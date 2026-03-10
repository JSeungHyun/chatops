package com.chatops.domain.message.repository;

import com.chatops.domain.message.entity.ReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReadReceiptRepository extends JpaRepository<ReadReceipt, String> {
}
