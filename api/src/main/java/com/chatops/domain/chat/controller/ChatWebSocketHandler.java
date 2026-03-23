package com.chatops.domain.chat.controller;

import com.chatops.domain.chat.dto.MessageResponse;
import com.chatops.domain.chat.dto.SendMessageRequest;
import com.chatops.domain.chat.dto.TypingEvent;
import com.chatops.domain.chat.dto.WebSocketErrorResponse;
import com.chatops.domain.chat.dto.WebSocketMessageRequest;
import com.chatops.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat/{roomId}/send")
    public void handleSendMessage(
        @DestinationVariable String roomId,
        WebSocketMessageRequest request,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        String userId = sessionAttributes != null ? (String) sessionAttributes.get("userId") : null;

        if (userId == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        SendMessageRequest sendRequest = new SendMessageRequest();
        sendRequest.setContent(request.getContent());
        sendRequest.setType(request.getType());
        sendRequest.setFileUrl(request.getFileUrl());

        MessageResponse messageResponse = chatService.sendMessage(userId, roomId, sendRequest);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, messageResponse);
        log.debug("Message broadcast to /topic/room/{}: userId={}", roomId, userId);
    }

    @MessageMapping("/chat/{roomId}/typing")
    public void handleTyping(
        @DestinationVariable String roomId,
        TypingEvent typingEvent,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        String userId = sessionAttributes != null ? (String) sessionAttributes.get("userId") : null;

        typingEvent.setRoomId(roomId);
        if (userId != null) {
            typingEvent.setUserId(userId);
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing", typingEvent);
        log.debug("Typing event broadcast to /topic/room/{}/typing: userId={}, isTyping={}", roomId, userId, typingEvent.isTyping());
    }

    @MessageExceptionHandler
    public void handleException(
        ResponseStatusException ex,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        String userId = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : null;
        WebSocketErrorResponse errorResponse = WebSocketErrorResponse.builder()
            .code(ex.getStatusCode().toString())
            .message(ex.getReason() != null ? ex.getReason() : ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();

        if (userId != null) {
            log.warn("WebSocket error for user {}: {}", userId, ex.getMessage());
            messagingTemplate.convertAndSendToUser(userId, "/queue/errors", errorResponse);
        } else {
            log.warn("WebSocket error (no user principal): {}", ex.getMessage());
        }
    }
}
