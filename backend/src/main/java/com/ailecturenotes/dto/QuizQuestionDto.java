package com.ailecturenotes.dto;

import java.util.List;

public class QuizQuestionDto {
    private int questionIndex;
    private String question;
    private List<String> options;

    public QuizQuestionDto() {
    }

    public QuizQuestionDto(int questionIndex, String question, List<String> options) {
        this.questionIndex = questionIndex;
        this.question = question;
        this.options = options;
    }

    public int getQuestionIndex() {
        return questionIndex;
    }

    public void setQuestionIndex(int questionIndex) {
        this.questionIndex = questionIndex;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }
}
