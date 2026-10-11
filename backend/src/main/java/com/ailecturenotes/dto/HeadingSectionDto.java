package com.ailecturenotes.dto;

import java.util.List;

public class HeadingSectionDto {
    private String heading;
    private String content;
    private List<String> bulletPoints;

    public HeadingSectionDto() {
    }

    public HeadingSectionDto(String heading, String content, List<String> bulletPoints) {
        this.heading = heading;
        this.content = content;
        this.bulletPoints = bulletPoints;
    }

    public String getHeading() {
        return heading;
    }

    public void setHeading(String heading) {
        this.heading = heading;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getBulletPoints() {
        return bulletPoints;
    }

    public void setBulletPoints(List<String> bulletPoints) {
        this.bulletPoints = bulletPoints;
    }
}
