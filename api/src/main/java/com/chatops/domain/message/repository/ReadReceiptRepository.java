package com.chatops.domain.message.repository;

import com.chatops.domain.message.entity.ReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReadReceiptRepository extends JpaRepository<ReadReceipt, String> {

    List<ReadReceipt> findByUserIdAndMessageIdIn(String userId, List<String> messageIds);

    long countByMessageId(String messageId);
}
