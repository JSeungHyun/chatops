package com.chatops.chat.dto;

import com.chatops.message.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendMessageRequest {
    @NotBlank
    @Size(max = 5000)
    private String content;

    private MessageType type;

    private String fileUrl;
}
