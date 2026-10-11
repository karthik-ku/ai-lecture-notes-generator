package com.ailecturenotes.dto;

import java.util.ArrayList;
import java.util.List;

public class GeneratedContentDto {
    private String title;
    private String summary;
    private List<HeadingSectionDto> sections = new ArrayList<>();
    private List<String> keyConcepts = new ArrayList<>();
    private List<DefinitionItemDto> definitions = new ArrayList<>();
    private List<String> keyPoints = new ArrayList<>();
    private List<String> examQuestions = new ArrayList<>();
    private List<McqItemDto> mcqs = new ArrayList<>();
    private boolean isDemoMode;
    private String generationMode; // "AI_POWERED" or "RULE_BASED_DEMO"

    public GeneratedContentDto() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<HeadingSectionDto> getSections() {
        return sections;
    }

    public void setSections(List<HeadingSectionDto> sections) {
        this.sections = sections;
    }

    public List<String> getKeyConcepts() {
        return keyConcepts;
    }

    public void setKeyConcepts(List<String> keyConcepts) {
        this.keyConcepts = keyConcepts;
    }

    public List<DefinitionItemDto> getDefinitions() {
        return definitions;
    }

    public void setDefinitions(List<DefinitionItemDto> definitions) {
        this.definitions = definitions;
    }

    public List<String> getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(List<String> keyPoints) {
        this.keyPoints = keyPoints;
    }

    public List<String> getExamQuestions() {
        return examQuestions;
    }

    public void setExamQuestions(List<String> examQuestions) {
        this.examQuestions = examQuestions;
    }

    public List<McqItemDto> getMcqs() {
        return mcqs;
    }

    public void setMcqs(List<McqItemDto> mcqs) {
        this.mcqs = mcqs;
    }

    public boolean isDemoMode() {
        return isDemoMode;
    }

    public void setDemoMode(boolean demoMode) {
        isDemoMode = demoMode;
    }

    public String getGenerationMode() {
        return generationMode;
    }

    public void setGenerationMode(String generationMode) {
        this.generationMode = generationMode;
    }
}
