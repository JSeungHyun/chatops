package com.chatops.auth.dto;

import com.chatops.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private LoginUser user;

    @Getter
    @AllArgsConstructor
    public static class LoginUser {
        private String id;
        private String email;
        private String nickname;

        public static LoginUser from(User user) {
            return new LoginUser(user.getId(), user.getEmail(), user.getNickname());
        }
    }
}
