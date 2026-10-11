package com.ailecturenotes.dto;

import java.util.List;

public class DashboardStatsResponse {
    private long totalNotes;
    private long totalDocumentsProcessed;
    private long quizzesCompleted;
    private double averageQuizScore;
    private List<NoteSummaryDto> recentNotes;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalNotes, long totalDocumentsProcessed, long quizzesCompleted, double averageQuizScore, List<NoteSummaryDto> recentNotes) {
        this.totalNotes = totalNotes;
        this.totalDocumentsProcessed = totalDocumentsProcessed;
        this.quizzesCompleted = quizzesCompleted;
        this.averageQuizScore = averageQuizScore;
        this.recentNotes = recentNotes;
    }

    public long getTotalNotes() {
        return totalNotes;
    }

    public void setTotalNotes(long totalNotes) {
        this.totalNotes = totalNotes;
    }

    public long getTotalDocumentsProcessed() {
        return totalDocumentsProcessed;
    }

    public void setTotalDocumentsProcessed(long totalDocumentsProcessed) {
        this.totalDocumentsProcessed = totalDocumentsProcessed;
    }

    public long quizzesCompleted() {
        return quizzesCompleted;
    }

    public long getQuizzesCompleted() {
        return quizzesCompleted;
    }

    public void setQuizzesCompleted(long quizzesCompleted) {
        this.quizzesCompleted = quizzesCompleted;
    }

    public double getAverageQuizScore() {
        return averageQuizScore;
    }

    public void setAverageQuizScore(double averageQuizScore) {
        this.averageQuizScore = averageQuizScore;
    }

    public List<NoteSummaryDto> getRecentNotes() {
        return recentNotes;
    }

    public void setRecentNotes(List<NoteSummaryDto> recentNotes) {
        this.recentNotes = recentNotes;
    }
}
