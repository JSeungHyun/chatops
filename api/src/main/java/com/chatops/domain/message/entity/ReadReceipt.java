package com.chatops.domain.message.entity;

import com.chatops.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "read_receipt",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "message_id"}),
    indexes = @Index(name = "idx_read_receipt_message", columnList = "message_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "message_id", nullable = false)
    private String messageId;

    @Column(name = "read_at", nullable = false, updatable = false)
    private LocalDateTime readAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", insertable = false, updatable = false)
    private Message message;

    @PrePersist
    protected void onCreate() {
        readAt = LocalDateTime.now();
    }
}
