package com.chatops.chat.dto;

import com.chatops.chat.ChatRoomMember;
import com.chatops.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponse {
    private String id;
    private String userId;
    private String roomId;
    private LocalDateTime joinedAt;
    private MemberUserResponse user;

    @Getter
    @AllArgsConstructor
    public static class MemberUserResponse {
        private String id;
        private String email;
        private String nickname;
        private String avatar;
    }

    public static MemberResponse from(ChatRoomMember member, User user) {
        MemberUserResponse userResponse = user != null
            ? new MemberUserResponse(user.getId(), user.getEmail(), user.getNickname(), user.getAvatar())
            : null;
        return MemberResponse.builder()
            .id(member.getId())
            .userId(member.getUserId())
            .roomId(member.getRoomId())
            .joinedAt(member.getJoinedAt())
            .user(userResponse)
            .build();
    }
}
