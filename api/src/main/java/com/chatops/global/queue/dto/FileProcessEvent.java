package com.chatops.global.queue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileProcessEvent {
    private String fileUrl;
    private String roomId;
    private String messageId;
    private String processType;
}
