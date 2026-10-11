package com.ailecturenotes.service;

import com.ailecturenotes.dto.GeneratedContentDto;
import com.ailecturenotes.dto.NoteResponse;
import com.ailecturenotes.dto.NoteSummaryDto;
import com.ailecturenotes.entity.Note;
import com.ailecturenotes.entity.User;
import com.ailecturenotes.exception.BadRequestException;
import com.ailecturenotes.exception.ResourceNotFoundException;
import com.ailecturenotes.repository.NoteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final com.ailecturenotes.repository.QuizResultRepository quizResultRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public NoteService(NoteRepository noteRepository,
                       com.ailecturenotes.repository.QuizResultRepository quizResultRepository,
                       AiService aiService,
                       ObjectMapper objectMapper) {
        this.noteRepository = noteRepository;
        this.quizResultRepository = quizResultRepository;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public NoteResponse generateAndSaveNote(User user, String text, String topic, String style) {
        if (text == null || text.trim().isEmpty()) {
            throw new BadRequestException("Lecture content cannot be empty.");
        }

        GeneratedContentDto generatedContent = aiService.generateNotes(text, topic, style);

        String jsonContent;
        try {
            jsonContent = objectMapper.writeValueAsString(generatedContent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize note content", e);
        }

        Note note = new Note(
                user,
                generatedContent.getTitle() != null ? generatedContent.getTitle() : "Lecture Notes",
                topic,
                style != null ? style : "Detailed Notes",
                text,
                generatedContent.getSummary(),
                jsonContent
        );

        note = noteRepository.save(note);
        return toNoteResponse(note, generatedContent);
    }

    public List<NoteSummaryDto> getUserNotes(User user, String search) {
        List<Note> notes;
        if (search != null && !search.trim().isEmpty()) {
            notes = noteRepository.findByUserIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(user.getId(), search.trim());
        } else {
            notes = noteRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return notes.stream()
                .map(n -> new NoteSummaryDto(
                        n.getId(),
                        n.getTitle(),
                        n.getTopic(),
                        n.getStyle(),
                        n.getSummary(),
                        n.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public NoteResponse getUserNoteById(User user, Long noteId) {
        Note note = noteRepository.findByIdAndUserId(noteId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found or you do not have permission to access it."));

        GeneratedContentDto contentDto = deserializeContent(note.getGeneratedContentJson());
        return toNoteResponse(note, contentDto);
    }

    public Note getNoteEntity(User user, Long noteId) {
        return noteRepository.findByIdAndUserId(noteId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found or access denied."));
    }

    @Transactional
    public void deleteUserNote(User user, Long noteId) {
        Note note = noteRepository.findByIdAndUserId(noteId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found or access denied."));
        quizResultRepository.deleteByNoteId(note.getId());
        noteRepository.delete(note);
    }

    private NoteResponse toNoteResponse(Note note, GeneratedContentDto content) {
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getTopic(),
                note.getStyle(),
                note.getSourceText(),
                note.getSummary(),
                content,
                note.getCreatedAt()
        );
    }

    public GeneratedContentDto deserializeContent(String json) {
        try {
            return objectMapper.readValue(json, GeneratedContentDto.class);
        } catch (Exception e) {
            GeneratedContentDto fallback = new GeneratedContentDto();
            fallback.setTitle("Generated Notes");
            fallback.setSummary("Error parsing note details.");
            return fallback;
        }
    }
}
