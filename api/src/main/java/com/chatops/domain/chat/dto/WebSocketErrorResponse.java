package com.chatops.domain.chat.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WebSocketErrorResponse {
    private String code;
    private String message;
    private LocalDateTime timestamp;
}
