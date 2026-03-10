package com.chatops.domain.chat.dto;

import com.chatops.domain.message.entity.Message;
import com.chatops.domain.message.entity.MessageType;
import com.chatops.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageResponse {
    private String id;
    private String content;
    private MessageType type;
    private String fileUrl;
    private String userId;
    private String roomId;
    private LocalDateTime createdAt;
    private MessageUserResponse user;

    @Getter
    @AllArgsConstructor
    public static class MessageUserResponse {
        private String id;
        private String email;
        private String nickname;
        private String avatar;
    }

    public static MessageResponse from(Message message, User user) {
        MessageUserResponse userResponse = user != null
            ? new MessageUserResponse(user.getId(), user.getEmail(), user.getNickname(), user.getAvatar())
            : null;
        return MessageResponse.builder()
            .id(message.getId())
            .content(message.getContent())
            .type(message.getType())
            .fileUrl(message.getFileUrl())
            .userId(message.getUserId())
            .roomId(message.getRoomId())
            .createdAt(message.getCreatedAt())
            .user(userResponse)
            .build();
    }
}
