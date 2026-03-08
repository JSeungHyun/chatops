package com.chatops.queue.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationEvent {
    private String userId;
    private String roomId;
    private String messageId;
    private String senderNickname;
    private String content;
}
