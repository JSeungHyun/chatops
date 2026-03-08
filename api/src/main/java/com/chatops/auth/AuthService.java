package com.chatops.auth;

import com.chatops.auth.dto.CreateUserRequest;
import com.chatops.auth.dto.LoginResponse;
import com.chatops.auth.dto.UserResponse;
import com.chatops.config.JwtTokenProvider;
import com.chatops.user.User;
import com.chatops.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserResponse register(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (userRepository.findByNickname(request.getNickname()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nickname already exists");
        }

        try {
            User user = User.builder()
                .email(request.getEmail())
                .nickname(request.getNickname())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
            User saved = userRepository.save(user);
            return UserResponse.from(saved);
        } catch (DataIntegrityViolationException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("nickname")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Nickname already exists");
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
    }

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new LoginResponse(token, LoginResponse.LoginUser.from(user));
    }

    public boolean checkNicknameAvailable(String nickname) {
        return userRepository.findByNickname(nickname).isEmpty();
    }
}
