package com.chatops.global.queue.consumer;

import com.chatops.global.config.RabbitMQConfig;
import com.chatops.global.queue.dto.NotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificationConsumer {

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleNotification(NotificationEvent event) {
        log.info("Push notification for offline user: userId={}, roomId={}, sender={}, content={}",
            event.getUserId(), event.getRoomId(), event.getSenderNickname(),
            truncate(event.getContent(), 50));

        // TODO: FCM/APNs 푸시 알림 연동, 이메일 알림 등 향후 확장
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}
