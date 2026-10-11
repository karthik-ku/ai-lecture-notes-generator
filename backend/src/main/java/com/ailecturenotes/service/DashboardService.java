package com.ailecturenotes.service;

import com.ailecturenotes.dto.DashboardStatsResponse;
import com.ailecturenotes.dto.NoteSummaryDto;
import com.ailecturenotes.entity.Note;
import com.ailecturenotes.entity.User;
import com.ailecturenotes.repository.NoteRepository;
import com.ailecturenotes.repository.QuizResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final NoteRepository noteRepository;
    private final QuizResultRepository quizResultRepository;

    public DashboardService(NoteRepository noteRepository, QuizResultRepository quizResultRepository) {
        this.noteRepository = noteRepository;
        this.quizResultRepository = quizResultRepository;
    }

    public DashboardStatsResponse getDashboardStats(User user) {
        long totalNotes = noteRepository.countByUserId(user.getId());
        long totalDocumentsProcessed = totalNotes;
        long quizzesCompleted = quizResultRepository.countByUserId(user.getId());
        Double avg = quizResultRepository.getAverageScoreByUserId(user.getId());
        double averageScore = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;

        List<Note> recent = noteRepository.findTop5ByUserIdOrderByCreatedAtDesc(user.getId());
        List<NoteSummaryDto> recentDtos = recent.stream()
                .map(n -> new NoteSummaryDto(
                        n.getId(),
                        n.getTitle(),
                        n.getTopic(),
                        n.getStyle(),
                        n.getSummary(),
                        n.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new DashboardStatsResponse(
                totalNotes,
                totalDocumentsProcessed,
                quizzesCompleted,
                averageScore,
                recentDtos
        );
    }
}
