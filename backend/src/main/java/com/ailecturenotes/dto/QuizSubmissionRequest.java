package com.ailecturenotes.dto;

import java.util.HashMap;
import java.util.Map;

public class QuizSubmissionRequest {
    // Map questionIndex (0-based) -> selectedOptionIndex (0-based)
    private Map<Integer, Integer> answers = new HashMap<>();

    public QuizSubmissionRequest() {
    }

    public QuizSubmissionRequest(Map<Integer, Integer> answers) {
        this.answers = answers;
    }

    public Map<Integer, Integer> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Integer, Integer> answers) {
        this.answers = answers;
    }
}
