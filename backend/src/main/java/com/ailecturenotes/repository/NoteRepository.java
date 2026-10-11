package com.ailecturenotes.repository;

import com.ailecturenotes.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Note> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    List<Note> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
    List<Note> findByUserIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(Long userId, String title);
}
