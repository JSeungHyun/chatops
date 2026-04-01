package com.chatops.global.queue.producer;

import com.chatops.global.config.RabbitMQConfig;
import com.chatops.global.queue.dto.FileProcessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessProducer {

    private final RabbitTemplate rabbitTemplate;

    public void requestFileProcessing(FileProcessEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.CHAT_EXCHANGE, "file-process", event);
        log.debug("File process event sent: messageId={}, processType={}",
            event.getMessageId(), event.getProcessType());
    }
}
