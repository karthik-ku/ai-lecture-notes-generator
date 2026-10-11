package com.ailecturenotes.service;

import com.ailecturenotes.dto.*;
import com.ailecturenotes.entity.Note;
import com.ailecturenotes.entity.QuizResult;
import com.ailecturenotes.entity.User;
import com.ailecturenotes.exception.BadRequestException;
import com.ailecturenotes.exception.ResourceNotFoundException;
import com.ailecturenotes.repository.NoteRepository;
import com.ailecturenotes.repository.QuizResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizResultRepository quizResultRepository;
    private final NoteRepository noteRepository;
    private final NoteService noteService;

    public QuizService(QuizResultRepository quizResultRepository, NoteRepository noteRepository, NoteService noteService) {
        this.quizResultRepository = quizResultRepository;
        this.noteRepository = noteRepository;
        this.noteService = noteService;
    }

    public List<QuizQuestionDto> getQuizQuestions(User user, Long noteId) {
        Note note = noteRepository.findByIdAndUserId(noteId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found or access denied."));

        GeneratedContentDto content = noteService.deserializeContent(note.getGeneratedContentJson());
        List<McqItemDto> mcqs = content.getMcqs();

        if (mcqs == null || mcqs.isEmpty()) {
            throw new BadRequestException("This note does not have any generated quiz questions yet.");
        }

        List<QuizQuestionDto> questions = new ArrayList<>();
        for (int i = 0; i < mcqs.size(); i++) {
            McqItemDto mcq = mcqs.get(i);
            questions.add(new QuizQuestionDto(i, mcq.getQuestion(), mcq.getOptions()));
        }
        return questions;
    }

    @Transactional
    public QuizResultResponse submitQuiz(User user, Long noteId, QuizSubmissionRequest request) {
        Note note = noteRepository.findByIdAndUserId(noteId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found or access denied."));

        GeneratedContentDto content = noteService.deserializeContent(note.getGeneratedContentJson());
        List<McqItemDto> mcqs = content.getMcqs();

        if (mcqs == null || mcqs.isEmpty()) {
            throw new BadRequestException("No quiz questions available for this note.");
        }

        Map<Integer, Integer> answers = request.getAnswers() != null ? request.getAnswers() : Map.of();
        int totalQuestions = mcqs.size();
        int correctCount = 0;
        List<QuizReviewItemDto> review = new ArrayList<>();

        for (int i = 0; i < totalQuestions; i++) {
            McqItemDto mcq = mcqs.get(i);
            Integer selected = answers.get(i);
            boolean isCorrect = selected != null && selected == mcq.getCorrectOptionIndex();
            if (isCorrect) {
                correctCount++;
            }

            review.add(new QuizReviewItemDto(
                    i,
                    mcq.getQuestion(),
                    mcq.getOptions(),
                    selected,
                    mcq.getCorrectOptionIndex(),
                    isCorrect,
                    mcq.getExplanation()
            ));
        }

        double score = totalQuestions > 0 ? Math.round(((double) correctCount / totalQuestions * 100.0) * 10.0) / 10.0 : 0.0;

        QuizResult quizResult = new QuizResult(user, note, totalQuestions, correctCount, score);
        quizResult = quizResultRepository.save(quizResult);

        return new QuizResultResponse(
                quizResult.getId(),
                note.getId(),
                note.getTitle(),
                totalQuestions,
                correctCount,
                score,
                review,
                quizResult.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<QuizResultResponse> getUserQuizHistory(User user) {
        List<QuizResult> results = quizResultRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return results.stream()
                .map(r -> new QuizResultResponse(
                        r.getId(),
                        r.getNote().getId(),
                        r.getNote().getTitle(),
                        r.getTotalQuestions(),
                        r.getCorrectAnswers(),
                        r.getScore(),
                        List.of(), // omit verbose review in summary history
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
