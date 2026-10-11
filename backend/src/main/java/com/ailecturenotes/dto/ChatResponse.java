package com.ailecturenotes.dto;

public class ChatResponse {
    private String answer;
    private boolean isDemoMode;
    private Long noteId;
    private String noteTitle;

    public ChatResponse() {
    }

    public ChatResponse(String answer, boolean isDemoMode, Long noteId, String noteTitle) {
        this.answer = answer;
        this.isDemoMode = isDemoMode;
        this.noteId = noteId;
        this.noteTitle = noteTitle;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public boolean isDemoMode() {
        return isDemoMode;
    }

    public void setDemoMode(boolean demoMode) {
        isDemoMode = demoMode;
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
}
