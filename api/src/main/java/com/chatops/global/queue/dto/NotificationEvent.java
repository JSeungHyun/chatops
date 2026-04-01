package com.chatops.global.queue.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String userId;
    private String roomId;
    private String messageId;
    private String senderNickname;
    private String content;
}
