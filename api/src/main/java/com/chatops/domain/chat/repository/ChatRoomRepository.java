package com.chatops.domain.chat.repository;

import com.chatops.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    @Query("SELECT DISTINCT cr FROM ChatRoom cr JOIN cr.members m WHERE m.userId = :userId ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findByMembersUserId(@Param("userId") String userId);
}
