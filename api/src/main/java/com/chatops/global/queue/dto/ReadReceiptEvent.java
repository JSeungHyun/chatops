package com.chatops.global.queue.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadReceiptEvent {
    private String userId;
    private String messageId;
    private String roomId;
}
