package com.chatops.domain.chat.controller;

import com.chatops.domain.chat.dto.ChatRoomResponse;
import com.chatops.domain.chat.dto.MessageResponse;
import com.chatops.domain.chat.dto.CreateRoomRequest;
import com.chatops.domain.chat.dto.SendMessageRequest;
import com.chatops.domain.chat.service.ChatService;
import com.chatops.global.common.dto.PageResponse;
import com.chatops.domain.user.entity.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    public ChatRoomResponse createRoom(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateRoomRequest request) {
        return chatService.createRoom(user.getId(), request);
    }

    @GetMapping
    public List<ChatRoomResponse> getRooms(@AuthenticationPrincipal User user) {
        return chatService.getRoomsByUserId(user.getId());
    }

    @GetMapping("/{id}")
    public ChatRoomResponse getRoom(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        return chatService.getRoomById(id, user.getId());
    }

    @PostMapping("/{id}/messages")
    public MessageResponse sendMessage(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody SendMessageRequest request) {
        return chatService.sendMessage(user.getId(), id, request);
    }

    @GetMapping("/{id}/messages")
    public PageResponse<MessageResponse> getMessages(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @RequestParam(defaultValue = "1") @Min(1) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer limit) {
        return chatService.getMessages(id, user.getId(), page, limit);
    }
}
