package com.chatops.domain.chat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketHandler {
    private final SimpMessagingTemplate messagingTemplate;
    // TODO: Stage 2 - implement message handlers
}
