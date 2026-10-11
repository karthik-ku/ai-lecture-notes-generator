package com.ailecturenotes.dto;

import java.time.LocalDateTime;

public class NoteSummaryDto {
    private Long id;
    private String title;
    private String topic;
    private String style;
    private String summary;
    private LocalDateTime createdAt;

    public NoteSummaryDto() {
    }

    public NoteSummaryDto(Long id, String title, String topic, String style, String summary, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.topic = topic;
        this.style = style;
        this.summary = summary;
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

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
