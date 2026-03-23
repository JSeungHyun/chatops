package com.chatops.global.config;

import com.chatops.domain.chat.repository.ChatRoomMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final ChatRoomMemberRepository chatRoomMemberRepository;

    private static final Pattern ROOM_TOPIC_PATTERN =
        Pattern.compile("^/topic/room/([^/]+)(/typing)?$");

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new MessageDeliveryException("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                throw new MessageDeliveryException("Invalid or expired JWT token");
            }

            String userId = jwtTokenProvider.getUserIdFromToken(token);
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                sessionAttributes.put("userId", userId);
            }
            accessor.setUser(new StompPrincipal(userId));
            log.debug("STOMP CONNECT authenticated: userId={}", userId);
        }

        if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();
            if (destination == null) {
                return message;
            }

            Matcher matcher = ROOM_TOPIC_PATTERN.matcher(destination);
            if (matcher.matches()) {
                String roomId = matcher.group(1);

                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                String userId = sessionAttributes != null
                    ? (String) sessionAttributes.get("userId")
                    : null;

                if (userId == null) {
                    throw new MessageDeliveryException("Not authenticated");
                }

                boolean isMember = chatRoomMemberRepository.existsByUserIdAndRoomId(userId, roomId);
                if (!isMember) {
                    log.warn("SUBSCRIBE denied: userId={} is not a member of roomId={}", userId, roomId);
                    throw new MessageDeliveryException("Not a member of this room");
                }
                log.debug("SUBSCRIBE allowed: userId={} -> {}", userId, destination);
            }
        }

        return message;
    }
}
