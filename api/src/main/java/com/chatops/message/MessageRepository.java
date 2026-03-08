package com.chatops.message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, String> {
    Page<Message> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);
    Optional<Message> findFirstByRoomIdOrderByCreatedAtDesc(String roomId);

    @Query("SELECT m FROM Message m JOIN FETCH m.user WHERE m.id IN " +
           "(SELECT m2.id FROM Message m2 WHERE m2.createdAt = " +
           "(SELECT MAX(m3.createdAt) FROM Message m3 WHERE m3.roomId = m2.roomId) " +
           "AND m2.roomId IN :roomIds)")
    List<Message> findLastMessagesByRoomIds(@Param("roomIds") List<String> roomIds);
}
