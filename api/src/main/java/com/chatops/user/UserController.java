package com.chatops.user;

import com.chatops.auth.dto.UserResponse;
import com.chatops.user.dto.UpdateUserRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getMe(@AuthenticationPrincipal User user) {
        return userService.findById(user.getId());
    }

    @GetMapping("/search")
    public List<UserResponse> searchUsers(@RequestParam @Size(min = 2, max = 20) String nickname) {
        return userService.searchByNickname(nickname);
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable String id) {
        return userService.findById(id);
    }

    @PatchMapping("/{id}")
    public UserResponse updateUser(@PathVariable String id,
                                   @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }
}
