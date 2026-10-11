package com.ailecturenotes.dto;

public class DefinitionItemDto {
    private String term;
    private String definition;

    public DefinitionItemDto() {
    }

    public DefinitionItemDto(String term, String definition) {
        this.term = term;
        this.definition = definition;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }
}
