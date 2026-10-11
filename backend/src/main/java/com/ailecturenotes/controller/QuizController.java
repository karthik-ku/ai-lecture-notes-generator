package com.ailecturenotes.controller;

import com.ailecturenotes.dto.QuizQuestionDto;
import com.ailecturenotes.dto.QuizResultResponse;
import com.ailecturenotes.dto.QuizSubmissionRequest;
import com.ailecturenotes.entity.User;
import com.ailecturenotes.service.QuizService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController extends BaseController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<List<QuizQuestionDto>> getQuizQuestions(
            HttpServletRequest request,
            @PathVariable("noteId") Long noteId) {

        User user = getCurrentUser(request);
        List<QuizQuestionDto> questions = quizService.getQuizQuestions(user, noteId);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/{noteId}/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            HttpServletRequest request,
            @PathVariable("noteId") Long noteId,
            @RequestBody QuizSubmissionRequest submissionRequest) {

        User user = getCurrentUser(request);
        QuizResultResponse result = quizService.submitQuiz(user, noteId, submissionRequest);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<QuizResultResponse>> getQuizHistory(HttpServletRequest request) {
        User user = getCurrentUser(request);
        List<QuizResultResponse> history = quizService.getUserQuizHistory(user);
        return ResponseEntity.ok(history);
    }
}
