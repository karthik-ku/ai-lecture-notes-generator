package com.ailecturenotes.repository;

import com.ailecturenotes.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    void deleteByNoteId(Long noteId);

    @Query("SELECT AVG(qr.score) FROM QuizResult qr WHERE qr.user.id = :userId")
    Double getAverageScoreByUserId(@Param("userId") Long userId);
}
