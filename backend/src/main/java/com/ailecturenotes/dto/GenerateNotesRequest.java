package com.ailecturenotes.dto;

public class GenerateNotesRequest {
    private String text;
    private String topic;
    private String style; // "Quick Revision", "Detailed Notes", "Exam Preparation"

    public GenerateNotesRequest() {
    }

    public GenerateNotesRequest(String text, String topic, String style) {
        this.text = text;
        this.topic = topic;
        this.style = style;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
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
}
