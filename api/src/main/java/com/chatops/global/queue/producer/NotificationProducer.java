package com.chatops.global.queue.producer;

import com.chatops.global.config.RabbitMQConfig;
import com.chatops.global.queue.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(NotificationEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "notification", event);
        log.debug("Notification event sent: userId={}, roomId={}", event.getUserId(), event.getRoomId());
    }
}
