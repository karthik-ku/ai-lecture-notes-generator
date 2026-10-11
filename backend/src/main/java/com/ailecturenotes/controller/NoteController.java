package com.ailecturenotes.controller;

import com.ailecturenotes.dto.GenerateNotesRequest;
import com.ailecturenotes.dto.NoteResponse;
import com.ailecturenotes.dto.NoteSummaryDto;
import com.ailecturenotes.entity.User;
import com.ailecturenotes.exception.BadRequestException;
import com.ailecturenotes.service.NoteService;
import com.ailecturenotes.service.PdfExtractionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController extends BaseController {

    private final NoteService noteService;
    private final PdfExtractionService pdfExtractionService;

    public NoteController(NoteService noteService, PdfExtractionService pdfExtractionService) {
        this.noteService = noteService;
        this.pdfExtractionService = pdfExtractionService;
    }

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NoteResponse> generateFromMultipart(
            HttpServletRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "style", required = false) String style) {

        User user = getCurrentUser(request);
        String extractedText;

        if (file != null && !file.isEmpty()) {
            extractedText = pdfExtractionService.extractText(file);
        } else if (text != null && !text.trim().isEmpty()) {
            extractedText = text.trim();
        } else {
            throw new BadRequestException("Please either upload a PDF document or paste lecture text.");
        }

        NoteResponse response = noteService.generateAndSaveNote(user, extractedText, topic, style);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/generate", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NoteResponse> generateFromJson(
            HttpServletRequest request,
            @RequestBody GenerateNotesRequest generateRequest) {

        User user = getCurrentUser(request);
        if (generateRequest.getText() == null || generateRequest.getText().trim().isEmpty()) {
            throw new BadRequestException("Lecture text cannot be empty.");
        }

        NoteResponse response = noteService.generateAndSaveNote(
                user,
                generateRequest.getText().trim(),
                generateRequest.getTopic(),
                generateRequest.getStyle()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<NoteSummaryDto>> getNotes(
            HttpServletRequest request,
            @RequestParam(value = "search", required = false) String search) {

        User user = getCurrentUser(request);
        List<NoteSummaryDto> notes = noteService.getUserNotes(user, search);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> getNoteById(
            HttpServletRequest request,
            @PathVariable("id") Long id) {

        User user = getCurrentUser(request);
        NoteResponse note = noteService.getUserNoteById(user, id);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNote(
            HttpServletRequest request,
            @PathVariable("id") Long id) {

        User user = getCurrentUser(request);
        noteService.deleteUserNote(user, id);
        return ResponseEntity.ok(Map.of("message", "Note deleted successfully"));
    }
}
