package com.ailecturenotes.service;

import com.ailecturenotes.dto.DefinitionItemDto;
import com.ailecturenotes.dto.GeneratedContentDto;
import com.ailecturenotes.dto.HeadingSectionDto;
import com.ailecturenotes.dto.McqItemDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiService(
            @Value("${ai.api.key:}") String apiKey,
            @Value("${ai.base.url:https://api.openai.com/v1}") String baseUrl,
            @Value("${ai.model:gpt-4o-mini}") String model,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl != null ? baseUrl.trim().replaceAll("/+$", "") : "https://api.openai.com/v1";
        this.model = model != null ? model.trim() : "gpt-4o-mini";
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(12))
                .build();
    }

    public boolean isAiConfigured() {
        return !apiKey.isEmpty();
    }

    public GeneratedContentDto generateNotes(String sourceText, String topic, String style) {
        if (sourceText == null || sourceText.trim().isEmpty()) {
            throw new IllegalArgumentException("Source lecture text cannot be empty");
        }

        // Limit oversized inputs for safety (approx 40,000 chars ~ 10,000 tokens)
        String trimmedSource = sourceText.trim();
        if (trimmedSource.length() > 60000) {
            trimmedSource = trimmedSource.substring(0, 60000) + "\n...[Content truncated for processing]...";
        }

        if (isAiConfigured()) {
            try {
                GeneratedContentDto aiResult = callOpenAiForNotes(trimmedSource, topic, style);
                if (aiResult != null) {
                    aiResult.setDemoMode(false);
                    aiResult.setGenerationMode("AI_POWERED");
                    return aiResult;
                }
            } catch (Exception e) {
                log.warn("AI generation call failed, falling back to rule-based demo mode: {}", e.getMessage());
            }
        }

        // Rule-Based Demo Mode
        return generateRuleBasedNotes(trimmedSource, topic, style);
    }

    public String askQuestion(String question, String noteTitle, String sourceText) {
        if (question == null || question.trim().isEmpty()) {
            return "Please provide a question to ask.";
        }

        if (isAiConfigured()) {
            try {
                String aiAnswer = callOpenAiForChat(question, noteTitle, sourceText);
                if (aiAnswer != null && !aiAnswer.trim().isEmpty()) {
                    return aiAnswer;
                }
            } catch (Exception e) {
                log.warn("AI chat call failed, falling back to rule-based demo mode: {}", e.getMessage());
            }
        }

        return answerQuestionRuleBased(question, noteTitle, sourceText);
    }

    // ==========================================
    // Real OpenAI API Calls
    // ==========================================

    private GeneratedContentDto callOpenAiForNotes(String text, String topic, String style) throws Exception {
        String prompt = buildPromptForNotes(text, topic, style);

        Map<String, Object> messageSystem = Map.of(
                "role", "system",
                "content", "You are an expert university professor and exam preparation specialist. You transform lecture text into clear, structured, high-yield study notes. Always output valid JSON conforming exactly to the requested schema."
        );
        Map<String, Object> messageUser = Map.of(
                "role", "user",
                "content", prompt
        );

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("model", model);
        requestBodyMap.put("messages", List.of(messageSystem, messageUser));
        requestBodyMap.put("temperature", 0.3);
        requestBodyMap.put("response_format", Map.of("type", "json_object"));

        String requestJson = objectMapper.writeValueAsString(requestBodyMap);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode choices = rootNode.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                String contentString = choices.get(0).path("message").path("content").asText();
                return parseAiGeneratedJson(contentString, topic);
            }
        } else {
            log.warn("OpenAI API returned error code {}: {}", response.statusCode(), response.body());
        }
        return null;
    }

    private String callOpenAiForChat(String question, String noteTitle, String sourceText) throws Exception {
        String systemContent = "You are an intelligent educational assistant. The student is asking questions about their lecture notes titled '"
                + (noteTitle != null ? noteTitle : "Lecture Material")
                + "'. Answer strictly using the context provided below. If the provided notes do not contain enough information to answer the question, clearly state: 'The provided lecture notes do not contain enough information to answer this question.'\n\n--- LECTURE CONTEXT ---\n"
                + (sourceText.length() > 25000 ? sourceText.substring(0, 25000) : sourceText);

        Map<String, Object> messageSystem = Map.of("role", "system", "content", systemContent);
        Map<String, Object> messageUser = Map.of("role", "user", "content", question);

        Map<String, Object> requestBodyMap = Map.of(
                "model", model,
                "messages", List.of(messageSystem, messageUser),
                "temperature", 0.2
        );

        String requestJson = objectMapper.writeValueAsString(requestBodyMap);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(45))
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode choices = rootNode.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }
        }
        return null;
    }

    private String buildPromptForNotes(String text, String topic, String style) {
        return "Create structured study notes from the following lecture text.\n"
                + "Topic Hint: " + (topic != null && !topic.isBlank() ? topic : "Auto-detect from text") + "\n"
                + "Style: " + (style != null && !style.isBlank() ? style : "Detailed Notes") + "\n\n"
                + "Please return a JSON object with the following exact keys:\n"
                + "{\n"
                + "  \"title\": \"Clear concise title for the notes\",\n"
                + "  \"summary\": \"Executive summary paragraph of 3-5 sentences\",\n"
                + "  \"sections\": [\n"
                + "     {\"heading\": \"Heading name\", \"content\": \"Brief overview\", \"bulletPoints\": [\"Point 1\", \"Point 2\"]}\n"
                + "  ],\n"
                + "  \"keyConcepts\": [\"Concept 1\", \"Concept 2\", \"Concept 3\"],\n"
                + "  \"definitions\": [\n"
                + "     {\"term\": \"Term Name\", \"definition\": \"Clear definition\"}\n"
                + "  ],\n"
                + "  \"keyPoints\": [\"Key takeaway 1\", \"Key takeaway 2\", \"Key takeaway 3\", \"Key takeaway 4\"],\n"
                + "  \"examQuestions\": [\"Exam question 1?\", \"Exam question 2?\", \"Exam question 3?\"],\n"
                + "  \"mcqs\": [\n"
                + "     {\n"
                + "       \"question\": \"Question text?\",\n"
                + "       \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
                + "       \"correctOptionIndex\": 0,\n"
                + "       \"explanation\": \"Why option A is correct based on the text.\"\n"
                + "     }\n"
                + "  ]\n"
                + "}\n\n"
                + "Source Text:\n" + text;
    }

    private GeneratedContentDto parseAiGeneratedJson(String jsonString, String fallbackTopic) {
        try {
            // In case the model wrapped it in markdown codeblocks
            String cleanJson = jsonString.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            GeneratedContentDto dto = objectMapper.readValue(cleanJson, GeneratedContentDto.class);
            if (dto.getTitle() == null || dto.getTitle().isBlank()) {
                dto.setTitle(fallbackTopic != null && !fallbackTopic.isBlank() ? fallbackTopic : "Lecture Study Notes");
            }
            return dto;
        } catch (Exception e) {
            log.error("Failed to parse AI JSON response: {}", e.getMessage());
            return null;
        }
    }

    // ==========================================
    // Rule-Based DEMO MODE Implementation
    // ==========================================

    public GeneratedContentDto generateRuleBasedNotes(String text, String topic, String style) {
        GeneratedContentDto dto = new GeneratedContentDto();
        dto.setDemoMode(true);
        dto.setGenerationMode("RULE_BASED_DEMO");

        List<String> rawLines = Arrays.stream(text.split("\\r?\\n"))
                .map(String::trim)
                .filter(l -> !l.isEmpty())
                .collect(Collectors.toList());

        List<String> sentences = extractSentences(text);

        // 1. Determine Title
        String title;
        if (topic != null && !topic.isBlank()) {
            title = topic.trim();
        } else if (!rawLines.isEmpty() && rawLines.get(0).length() < 90) {
            title = cleanTitle(rawLines.get(0));
        } else {
            title = "Study Notes: " + extractTopKeywords(sentences, 1).stream().findFirst().orElse("Lecture Overview");
        }
        dto.setTitle(title);

        // 2. Summary
        String summary = generateRuleBasedSummary(sentences, style);
        dto.setSummary(summary);

        // 3. Key Concepts
        List<String> keyConcepts = extractTopKeywords(sentences, 6);
        dto.setKeyConcepts(keyConcepts);

        // 4. Definitions
        List<DefinitionItemDto> definitions = extractDefinitions(sentences);
        dto.setDefinitions(definitions);

        // 5. Key Points
        List<String> keyPoints = extractKeyPoints(sentences, style);
        dto.setKeyPoints(keyPoints);

        // 6. Structured Sections
        List<HeadingSectionDto> sections = buildSections(rawLines, sentences, keyConcepts);
        dto.setSections(sections);

        // 7. Exam Preparation Questions
        List<String> examQuestions = generateExamQuestions(keyConcepts, definitions, sentences);
        dto.setExamQuestions(examQuestions);

        // 8. Multiple Choice Questions (MCQs)
        List<McqItemDto> mcqs = generateRuleBasedMcqs(definitions, sentences, keyConcepts);
        dto.setMcqs(mcqs);

        return dto;
    }

    private List<String> extractSentences(String text) {
        // Split on standard sentence boundaries
        String[] split = text.split("(?<=[.!?])\\s+");
        List<String> result = new ArrayList<>();
        for (String s : split) {
            String clean = s.trim().replaceAll("\\s+", " ");
            if (clean.length() >= 20) {
                result.add(clean);
            }
        }
        return result;
    }

    private String cleanTitle(String raw) {
        return raw.replaceAll("^[#\\-*\\d.]+\\s*", "").trim();
    }

    private String generateRuleBasedSummary(List<String> sentences, String style) {
        if (sentences.isEmpty()) {
            return "Summary unavailable. No clear sentences detected.";
        }
        int count = 3;
        if ("Quick Revision".equalsIgnoreCase(style)) {
            count = 2;
        } else if ("Detailed Notes".equalsIgnoreCase(style)) {
            count = 4;
        }

        // Pick initial sentence and high-information sentences
        List<String> picked = new ArrayList<>();
        picked.add(sentences.get(0));
        for (int i = 1; i < sentences.size() && picked.size() < count; i++) {
            String s = sentences.get(i);
            if (s.contains("is") || s.contains("important") || s.contains("key") || s.contains("defined") || s.contains("primary") || s.contains("results")) {
                if (!picked.contains(s)) {
                    picked.add(s);
                }
            }
        }
        // Fill if needed
        for (int i = 1; i < sentences.size() && picked.size() < count; i++) {
            if (!picked.contains(sentences.get(i))) {
                picked.add(sentences.get(i));
            }
        }
        return String.join(" ", picked);
    }

    private List<String> extractTopKeywords(List<String> sentences, int max) {
        Set<String> stopWords = Set.of(
                "the", "and", "that", "this", "with", "from", "for", "have", "been", "were",
                "which", "their", "about", "would", "there", "these", "other", "into", "more",
                "some", "such", "than", "then", "also", "when", "what", "where", "while", "between",
                "lecture", "notes", "slide", "chapter", "student", "class", "study", "page"
        );

        Map<String, Integer> freq = new HashMap<>();
        Pattern wordPattern = Pattern.compile("\\b[a-zA-Z]{4,20}\\b");

        for (String s : sentences) {
            Matcher m = wordPattern.matcher(s);
            while (m.find()) {
                String word = m.group().toLowerCase();
                if (!stopWords.contains(word)) {
                    freq.put(word, freq.getOrDefault(word, 0) + 1);
                }
            }
        }

        return freq.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(max)
                .map(e -> capitalize(e.getKey()))
                .collect(Collectors.toList());
    }

    private List<DefinitionItemDto> extractDefinitions(List<String> sentences) {
        List<DefinitionItemDto> list = new ArrayList<>();
        Pattern defPattern = Pattern.compile("(?i)^([A-Z][a-zA-Z0-9\\s]{2,30})\\s+(is defined as|refers to|means|is a|is an|represents)\\s+(.+)$");

        for (String sentence : sentences) {
            Matcher m = defPattern.matcher(sentence);
            if (m.find()) {
                String term = m.group(1).trim();
                String def = m.group(2) + " " + m.group(3).trim();
                if (term.split("\\s+").length <= 4) {
                    list.add(new DefinitionItemDto(capitalize(term), def));
                }
            } else if (sentence.contains(":") && sentence.indexOf(":") < 35) {
                int colonIdx = sentence.indexOf(":");
                String term = sentence.substring(0, colonIdx).replaceAll("^[#\\-*\\d.]+\\s*", "").trim();
                String def = sentence.substring(colonIdx + 1).trim();
                if (term.length() >= 3 && term.split("\\s+").length <= 4 && def.length() >= 15) {
                    list.add(new DefinitionItemDto(capitalize(term), def));
                }
            }
            if (list.size() >= 5) break;
        }

        if (list.isEmpty() && !sentences.isEmpty()) {
            list.add(new DefinitionItemDto("Primary Concept", sentences.get(0)));
        }
        return list;
    }

    private List<String> extractKeyPoints(List<String> sentences, String style) {
        List<String> points = new ArrayList<>();
        int target = "Exam Preparation".equalsIgnoreCase(style) ? 6 : 5;

        for (String s : sentences) {
            if (s.length() >= 30 && s.length() <= 180) {
                if (!points.contains(s)) {
                    points.add(s);
                }
            }
            if (points.size() >= target) break;
        }

        if (points.isEmpty()) {
            points.add("Comprehensive lecture material provided for exam review.");
        }
        return points;
    }

    private List<HeadingSectionDto> buildSections(List<String> rawLines, List<String> sentences, List<String> keyConcepts) {
        List<HeadingSectionDto> sections = new ArrayList<>();

        // Detect explicit headings
        for (int i = 0; i < rawLines.size(); i++) {
            String line = rawLines.get(i);
            if ((line.startsWith("#") || line.matches("^[0-9]+\\..*") || line.toUpperCase().equals(line)) && line.length() < 70) {
                String heading = cleanTitle(line);
                List<String> bullets = new ArrayList<>();
                for (int j = i + 1; j < Math.min(i + 5, rawLines.size()); j++) {
                    String sub = rawLines.get(j);
                    if (sub.length() > 20) {
                        bullets.add(cleanTitle(sub));
                    }
                }
                if (!bullets.isEmpty()) {
                    sections.add(new HeadingSectionDto(heading, "Key findings and discussion under " + heading + ".", bullets));
                }
            }
            if (sections.size() >= 3) break;
        }

        // If no explicit headings, generate contextual thematic sections
        if (sections.isEmpty()) {
            String concept1 = keyConcepts.size() > 0 ? keyConcepts.get(0) : "Foundational Principles";
            String concept2 = keyConcepts.size() > 1 ? keyConcepts.get(1) : "Core Methodologies";
            String concept3 = keyConcepts.size() > 2 ? keyConcepts.get(2) : "Applications & Implications";

            sections.add(new HeadingSectionDto("Overview of " + concept1,
                    "Core definitions and initial framework established in the notes.",
                    sentences.stream().limit(3).collect(Collectors.toList())));

            sections.add(new HeadingSectionDto("Analysis of " + concept2,
                    "Detailed exploration of primary concepts and mechanics.",
                    sentences.stream().skip(2).limit(3).collect(Collectors.toList())));

            sections.add(new HeadingSectionDto("Conclusions on " + concept3,
                    "Important takeaways, exam considerations, and synthesis.",
                    sentences.stream().skip(4).limit(3).collect(Collectors.toList())));
        }

        return sections;
    }

    private List<String> generateExamQuestions(List<String> keyConcepts, List<DefinitionItemDto> definitions, List<String> sentences) {
        List<String> questions = new ArrayList<>();

        if (!definitions.isEmpty()) {
            questions.add("Define '" + definitions.get(0).getTerm() + "' and explain its primary function within this subject.");
        }

        if (keyConcepts.size() >= 2) {
            questions.add("Compare and contrast " + keyConcepts.get(0) + " and " + keyConcepts.get(1) + " based on the lecture material.");
        } else if (!keyConcepts.isEmpty()) {
            questions.add("What are the most significant characteristics and applications of " + keyConcepts.get(0) + "?");
        }

        if (sentences.size() >= 3) {
            questions.add("Explain the mechanism or rationale described in the following statement: \"" + sentences.get(1) + "\"");
        }

        questions.add("Discuss the practical implications and potential challenges associated with the topics presented.");
        questions.add("How would you formulate a step-by-step summary for an exam regarding this lecture's core themes?");

        return questions;
    }

    private List<McqItemDto> generateRuleBasedMcqs(List<DefinitionItemDto> definitions, List<String> sentences, List<String> keyConcepts) {
        List<McqItemDto> mcqs = new ArrayList<>();

        // Question 1 from definition if available
        if (!definitions.isEmpty()) {
            DefinitionItemDto def = definitions.get(0);
            List<String> options = List.of(
                    def.getDefinition(),
                    "A negligible factor not directly addressed in this lecture unit.",
                    "An external variable used solely for non-primary baseline measurements.",
                    "A theoretical model completely contradicted by the findings."
            );
            mcqs.add(new McqItemDto(
                    "According to the lecture notes, what is the definition or role of '" + def.getTerm() + "'?",
                    options,
                    0,
                    "'" + def.getTerm() + "' is defined in the material as: " + def.getDefinition()
            ));
        }

        // Question 2 from key concept
        if (!keyConcepts.isEmpty()) {
            String concept = keyConcepts.get(0);
            String otherConcept = keyConcepts.size() > 1 ? keyConcepts.get(1) : "secondary parameters";
            List<String> options = List.of(
                    "It is completely omitted from the foundational curriculum.",
                    "It constitutes a central theme analyzed across the lecture material.",
                    "It is exclusively used to disprove modern scientific consensus.",
                    "It applies only to theoretical calculations outside real-world scope."
            );
            mcqs.add(new McqItemDto(
                    "Which statement most accurately reflects the significance of '" + concept + "' in the lecture?",
                    options,
                    1,
                    "The lecture heavily emphasizes '" + concept + "' and its connection to " + otherConcept + "."
            ));
        }

        // Question 3 from sentence statement
        if (sentences.size() >= 2) {
            String sentence = sentences.get(0);
            List<String> options = List.of(
                    "It is rejected as an obsolete hypothesis.",
                    "It represents an unsupported speculation.",
                    sentence,
                    "It only applies under zero-gravity or vacuum conditions."
            );
            mcqs.add(new McqItemDto(
                    "Which of the following propositions is explicitly supported by the lecture text?",
                    options,
                    2,
                    "Supported by the verbatim lecture sentence: \"" + sentence + "\""
            ));
        }

        // Question 4 general comprehension
        if (sentences.size() >= 3) {
            String detail = sentences.get(Math.min(2, sentences.size() - 1));
            List<String> options = List.of(
                    "By ignoring empirical data in favor of unverified assumptions.",
                    "By discrediting standard definitions without evidence.",
                    "By presenting unformatted raw variables.",
                    detail
            );
            mcqs.add(new McqItemDto(
                    "What key insight is conveyed by the instructor regarding the core topic?",
                    options,
                    3,
                    "The material explicitly states: \"" + detail + "\""
            ));
        }

        return mcqs;
    }

    private String answerQuestionRuleBased(String question, String noteTitle, String sourceText) {
        String cleanQuestion = question.toLowerCase().trim();
        List<String> sentences = extractSentences(sourceText);

        // Find best matching sentences
        String[] qWords = cleanQuestion.replaceAll("[^a-zA-Z0-9\\s]", "").split("\\s+");
        Set<String> stopWords = Set.of("what", "is", "the", "how", "why", "can", "does", "are", "tell", "me", "about", "in", "of", "and", "a", "an", "to");

        List<String> queryKeywords = Arrays.stream(qWords)
                .filter(w -> w.length() >= 3 && !stopWords.contains(w))
                .collect(Collectors.toList());

        if (queryKeywords.isEmpty()) {
            return "[DEMO MODE] The provided question is too generic. Please specify a concept or keyword from the lecture notes titled '"
                    + (noteTitle != null ? noteTitle : "Notes") + "'.";
        }

        // Score sentences
        String bestSentence = null;
        int maxMatches = 0;
        List<String> matchedSentences = new ArrayList<>();

        for (String s : sentences) {
            String lowerS = s.toLowerCase();
            int matches = 0;
            for (String kw : queryKeywords) {
                if (lowerS.contains(kw)) {
                    matches++;
                }
            }
            if (matches > maxMatches) {
                maxMatches = matches;
                bestSentence = s;
            }
            if (matches > 0 && matchedSentences.size() < 3) {
                matchedSentences.add(s);
            }
        }

        if (maxMatches == 0) {
            return "[DEMO MODE - Rule-Based Matcher] The provided lecture notes do not contain enough information to answer your question regarding '"
                    + String.join(" ", queryKeywords) + "'. Please refer to the uploaded document or ask about terms mentioned in the material.";
        }

        return "[DEMO MODE - Rule-Based Matcher]\nBased on your notes (" + (noteTitle != null ? noteTitle : "Lecture Notes") + "):\n\n"
                + String.join("\n\n", matchedSentences);
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }
}
