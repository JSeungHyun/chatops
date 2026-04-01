package com.chatops.global.queue.consumer;

import com.chatops.global.config.RabbitMQConfig;
import com.chatops.global.queue.dto.ReadReceiptEvent;
import com.chatops.global.redis.RedisMessageRelay;
import com.chatops.domain.message.entity.ReadReceipt;
import com.chatops.domain.message.repository.ReadReceiptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReadReceiptConsumer {

    private final ReadReceiptRepository readReceiptRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisMessageRelay redisMessageRelay;

    @Transactional
    @RabbitListener(queues = RabbitMQConfig.READ_RECEIPT_QUEUE)
    public void handleReadReceipt(ReadReceiptEvent event) {
        String userId = event.getUserId();
        String roomId = event.getRoomId();
        List<String> messageIds = event.getMessageIds();

        if (messageIds == null || messageIds.isEmpty()) {
            return;
        }

        // Filter out already-read messages to prevent duplicate inserts
        Set<String> alreadyRead = readReceiptRepository
            .findByUserIdAndMessageIdIn(userId, messageIds)
            .stream()
            .map(ReadReceipt::getMessageId)
            .collect(Collectors.toSet());

        List<ReadReceipt> newReceipts = messageIds.stream()
            .filter(msgId -> !alreadyRead.contains(msgId))
            .map(msgId -> ReadReceipt.builder()
                .userId(userId)
                .messageId(msgId)
                .build())
            .toList();

        if (newReceipts.isEmpty()) {
            log.debug("All messages already read: userId={}, roomId={}", userId, roomId);
            return;
        }

        readReceiptRepository.saveAll(newReceipts);
        log.debug("Read receipts saved: userId={}, roomId={}, count={}", userId, roomId, newReceipts.size());

        // Broadcast read receipt update to room subscribers
        List<String> newlyReadIds = newReceipts.stream()
            .map(ReadReceipt::getMessageId)
            .toList();

        Map<String, Object> update = Map.of(
            "userId", userId,
            "roomId", roomId,
            "messageIds", newlyReadIds
        );

        String destination = "/topic/room/" + roomId + "/read-receipts";
        messagingTemplate.convertAndSend(destination, update);
        redisMessageRelay.publishToChannel(destination, update);
    }
}
