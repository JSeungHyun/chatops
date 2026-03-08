package com.chatops.auth;

import com.chatops.auth.dto.CreateUserRequest;
import com.chatops.auth.dto.LoginRequest;
import com.chatops.auth.dto.LoginResponse;
import com.chatops.auth.dto.UserResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody CreateUserRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @GetMapping("/check-nickname")
    public Map<String, Boolean> checkNickname(@RequestParam @Size(min = 2, max = 20) String nickname) {
        return Map.of("available", authService.checkNicknameAvailable(nickname));
    }
}
