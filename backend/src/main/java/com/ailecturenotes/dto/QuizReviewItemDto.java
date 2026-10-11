package com.ailecturenotes.dto;

import java.util.List;

public class QuizReviewItemDto {
    private int questionIndex;
    private String question;
    private List<String> options;
    private Integer selectedOption;
    private int correctOption;
    private boolean correct;
    private String explanation;

    public QuizReviewItemDto() {
    }

    public QuizReviewItemDto(int questionIndex, String question, List<String> options, Integer selectedOption, int correctOption, boolean correct, String explanation) {
        this.questionIndex = questionIndex;
        this.question = question;
        this.options = options;
        this.selectedOption = selectedOption;
        this.correctOption = correctOption;
        this.correct = correct;
        this.explanation = explanation;
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

    public Integer getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(Integer selectedOption) {
        this.selectedOption = selectedOption;
    }

    public int getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(int correctOption) {
        this.correctOption = correctOption;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
