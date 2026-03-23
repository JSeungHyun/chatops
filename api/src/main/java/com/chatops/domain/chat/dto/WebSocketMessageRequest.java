package com.chatops.domain.chat.dto;

import com.chatops.domain.message.entity.MessageType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WebSocketMessageRequest {
    private String content;
    private MessageType type;
    private String fileUrl;
}
