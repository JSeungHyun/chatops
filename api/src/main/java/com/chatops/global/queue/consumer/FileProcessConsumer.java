package com.chatops.global.queue.consumer;

import com.chatops.global.config.RabbitMQConfig;
import com.chatops.global.queue.dto.FileProcessEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FileProcessConsumer {

    @RabbitListener(queues = RabbitMQConfig.FILE_PROCESS_QUEUE)
    public void handleFileProcess(FileProcessEvent event) {
        log.info("File process event received: messageId={}, fileUrl={}, processType={}",
            event.getMessageId(), event.getFileUrl(), event.getProcessType());

        // TODO: 5주차 MinIO 연동 시 구현
        // - 이미지 리사이징 / 썸네일 생성
        // - 파일 메타데이터 추출
        // - 처리 완료 후 메시지 업데이트
    }
}
