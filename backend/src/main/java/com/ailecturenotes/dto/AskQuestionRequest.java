package com.ailecturenotes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AskQuestionRequest {

    @NotNull(message = "Note ID is required")
    private Long noteId;

    @NotBlank(message = "Question cannot be blank")
    private String question;

    public AskQuestionRequest() {
    }

    public AskQuestionRequest(Long noteId, String question) {
        this.noteId = noteId;
        this.question = question;
    }

    public Long getNoteId() {
        return noteId;
    }

    public void setNoteId(Long noteId) {
        this.noteId = noteId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
