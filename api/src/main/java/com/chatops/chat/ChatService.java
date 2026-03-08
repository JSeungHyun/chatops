package com.chatops.chat;

import com.chatops.chat.dto.ChatRoomResponse;
import com.chatops.chat.dto.MemberResponse;
import com.chatops.chat.dto.MessageResponse;
import com.chatops.chat.dto.CreateRoomRequest;
import com.chatops.chat.dto.SendMessageRequest;
import com.chatops.common.dto.PageResponse;
import com.chatops.message.Message;
import com.chatops.message.MessageRepository;
import com.chatops.message.MessageType;
import com.chatops.user.User;
import com.chatops.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatRoomResponse createRoom(String userId, CreateRoomRequest request) {
        ChatRoom room = ChatRoom.builder()
            .name(request.getName())
            .type(request.getType())
            .build();
        ChatRoom savedRoom = chatRoomRepository.save(room);

        // Add creator as member
        ChatRoomMember creatorMember = ChatRoomMember.builder()
            .userId(userId)
            .roomId(savedRoom.getId())
            .room(savedRoom)
            .build();
        chatRoomMemberRepository.save(creatorMember);

        // Add other members
        List<ChatRoomMember> otherMembers = request.getMemberIds().stream()
            .map(memberId -> ChatRoomMember.builder()
                .userId(memberId)
                .roomId(savedRoom.getId())
                .room(savedRoom)
                .build())
            .toList();
        chatRoomMemberRepository.saveAll(otherMembers);

        return buildChatRoomResponse(savedRoom.getId());
    }

    public List<ChatRoomResponse> getRoomsByUserId(String userId) {
        // Query 1: Get rooms
        List<ChatRoom> rooms = chatRoomRepository.findByMembersUserId(userId);
        if (rooms.isEmpty()) {
            return List.of();
        }

        List<String> roomIds = rooms.stream().map(ChatRoom::getId).toList();

        // Query 2: Batch load all members with users (JOIN FETCH)
        List<ChatRoomMember> allMembers = chatRoomMemberRepository.findByRoomIdInWithUser(roomIds);
        Map<String, List<ChatRoomMember>> membersByRoom = allMembers.stream()
            .collect(Collectors.groupingBy(ChatRoomMember::getRoomId));

        // Query 3: Batch load last messages with users (JOIN FETCH)
        List<Message> lastMessages = messageRepository.findLastMessagesByRoomIds(roomIds);
        Map<String, Message> lastMessageByRoom = lastMessages.stream()
            .collect(Collectors.toMap(Message::getRoomId, m -> m, (a, b) -> a));

        return rooms.stream().map(room -> {
            List<MemberResponse> memberResponses = membersByRoom
                .getOrDefault(room.getId(), List.of()).stream()
                .map(m -> MemberResponse.from(m, m.getUser()))
                .toList();

            Message lastMessage = lastMessageByRoom.get(room.getId());
            List<MessageResponse> messages = lastMessage != null
                ? List.of(MessageResponse.from(lastMessage, lastMessage.getUser()))
                : List.of();

            return ChatRoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .type(room.getType())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .members(memberResponses)
                .messages(messages)
                .build();
        }).toList();
    }

    public ChatRoomResponse getRoomById(String id, String userId) {
        chatRoomRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat room not found"));

        if (!chatRoomMemberRepository.existsByUserIdAndRoomId(userId, id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this chat room");
        }

        return buildChatRoomResponse(id);
    }

    @Transactional
    public MessageResponse sendMessage(String userId, String roomId, SendMessageRequest request) {
        ChatRoom room = chatRoomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat room not found"));

        if (!chatRoomMemberRepository.existsByUserIdAndRoomId(userId, roomId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this chat room");
        }

        Message message = Message.builder()
            .content(request.getContent())
            .type(request.getType() != null ? request.getType() : MessageType.TEXT)
            .fileUrl(request.getFileUrl())
            .userId(userId)
            .roomId(roomId)
            .build();
        Message saved = messageRepository.save(message);

        room.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        User sender = userRepository.findById(userId).orElse(null);
        return MessageResponse.from(saved, sender);
    }

    public PageResponse<MessageResponse> getMessages(String roomId, String userId, int page, int limit) {
        chatRoomRepository.findById(roomId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat room not found"));

        if (!chatRoomMemberRepository.existsByUserIdAndRoomId(userId, roomId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this chat room");
        }

        Page<Message> messagePage = messageRepository.findByRoomIdOrderByCreatedAtDesc(
            roomId, PageRequest.of(page - 1, limit)
        );

        List<MessageResponse> messageResponses = messagePage.getContent().stream()
            .map(m -> {
                User user = userRepository.findById(m.getUserId()).orElse(null);
                return MessageResponse.from(m, user);
            })
            .toList();

        return new PageResponse<>(
            messageResponses,
            new PageResponse.PageMeta(
                messagePage.getTotalElements(),
                page,
                limit,
                messagePage.getTotalPages()
            )
        );
    }

    private ChatRoomResponse buildChatRoomResponse(String roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
        List<ChatRoomMember> members = chatRoomMemberRepository.findByRoomId(roomId);
        List<MemberResponse> memberResponses = members.stream()
            .map(m -> {
                User user = userRepository.findById(m.getUserId()).orElse(null);
                return MemberResponse.from(m, user);
            })
            .toList();

        return ChatRoomResponse.builder()
            .id(room.getId())
            .name(room.getName())
            .type(room.getType())
            .createdAt(room.getCreatedAt())
            .updatedAt(room.getUpdatedAt())
            .members(memberResponses)
            .messages(List.of())
            .build();
    }
}
