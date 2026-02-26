package com.example.minilibrary.discovery;

import jakarta.persistence.*;
import com.example.minilibrary.auth.User;
import lombok.*;
import com.example.minilibrary.auth.User;
import java.time.LocalDateTime;
import com.example.minilibrary.auth.User;

@Entity
@Table(name = "search_history", indexes = {
        @Index(name = "idx_search_user_timestamp", columnList = "user_id, timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String query;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
