package com.chatops.chat.dto;

import com.chatops.chat.RoomType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ChatRoomResponse {
    private String id;
    private String name;
    private RoomType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MemberResponse> members;
    private List<MessageResponse> messages;
}
