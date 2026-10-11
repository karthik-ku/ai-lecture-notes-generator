package com.ailecturenotes.dto;

import java.time.LocalDateTime;
import java.util.List;

public class QuizResultResponse {
    private Long id;
    private Long noteId;
    private String noteTitle;
    private int totalQuestions;
    private int correctAnswers;
    private double score;
    private List<QuizReviewItemDto> review;
    private LocalDateTime createdAt;

    public QuizResultResponse() {
    }

    public QuizResultResponse(Long id, Long noteId, String noteTitle, int totalQuestions, int correctAnswers, double score, List<QuizReviewItemDto> review, LocalDateTime createdAt) {
        this.id = id;
        this.noteId = noteId;
        this.noteTitle = noteTitle;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.score = score;
        this.review = review;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNoteId() {
        return noteId;
    }

    public void setNoteId(Long noteId) {
        this.noteId = noteId;
    }

    public String getNoteTitle() {
        return noteTitle;
    }

    public void setNoteTitle(String noteTitle) {
        this.noteTitle = noteTitle;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public List<QuizReviewItemDto> getReview() {
        return review;
    }

    public void setReview(List<QuizReviewItemDto> review) {
        this.review = review;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
