package com.chatops.chat.dto;

import com.chatops.chat.RoomType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateRoomRequest {
    private String name;

    @NotNull
    private RoomType type;

    @NotEmpty
    private List<String> memberIds;
}
