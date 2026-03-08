package com.chatops.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, String> {
    boolean existsByUserIdAndRoomId(String userId, String roomId);
    List<ChatRoomMember> findByRoomId(String roomId);

    @Query("SELECT m FROM ChatRoomMember m JOIN FETCH m.user WHERE m.roomId IN :roomIds")
    List<ChatRoomMember> findByRoomIdInWithUser(@Param("roomIds") List<String> roomIds);
}
