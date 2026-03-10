package com.chatops.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    @Size(min = 2, max = 20)
    private String nickname;

    private String avatar;
}
