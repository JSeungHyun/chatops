package com.chatops.domain.chat.dto;

import com.chatops.domain.message.entity.MessageType;
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
