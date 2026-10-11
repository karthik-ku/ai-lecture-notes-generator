package com.ailecturenotes.dto;

import java.time.LocalDateTime;

public class NoteResponse {
    private Long id;
    private String title;
    private String topic;
    private String style;
    private String sourceText;
    private String summary;
    private GeneratedContentDto generatedContent;
    private LocalDateTime createdAt;

    public NoteResponse() {
    }

    public NoteResponse(Long id, String title, String topic, String style, String sourceText, String summary, GeneratedContentDto generatedContent, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.topic = topic;
        this.style = style;
        this.sourceText = sourceText;
        this.summary = summary;
        this.generatedContent = generatedContent;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public String getSourceText() {
        return sourceText;
    }

    public void setSourceText(String sourceText) {
        this.sourceText = sourceText;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public GeneratedContentDto getGeneratedContent() {
        return generatedContent;
    }

    public void setGeneratedContent(GeneratedContentDto generatedContent) {
        this.generatedContent = generatedContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
