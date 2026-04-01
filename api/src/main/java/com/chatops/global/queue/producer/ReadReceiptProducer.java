package com.chatops.global.queue.producer;

import com.chatops.global.config.RabbitMQConfig;
import com.chatops.global.queue.dto.ReadReceiptEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadReceiptProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendReadReceipt(ReadReceiptEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "read-receipt", event);
        log.debug("Read receipt event sent: userId={}, roomId={}, messageCount={}",
            event.getUserId(), event.getRoomId(), event.getMessageIds().size());
    }
}
