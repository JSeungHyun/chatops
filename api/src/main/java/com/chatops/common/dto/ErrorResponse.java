package com.chatops.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private int statusCode;
    private Object message; // String or List<String>
    private String error;
}
