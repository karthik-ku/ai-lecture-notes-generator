package com.ailecturenotes.controller;

import com.ailecturenotes.dto.AskQuestionRequest;
import com.ailecturenotes.dto.ChatResponse;
import com.ailecturenotes.entity.Note;
import com.ailecturenotes.entity.User;
import com.ailecturenotes.service.AiService;
import com.ailecturenotes.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController extends BaseController {

    private final NoteService noteService;
    private final AiService aiService;

    public ChatController(NoteService noteService, AiService aiService) {
        this.noteService = noteService;
        this.aiService = aiService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askQuestion(
            HttpServletRequest request,
            @Valid @RequestBody AskQuestionRequest askRequest) {

        User user = getCurrentUser(request);
        Note note = noteService.getNoteEntity(user, askRequest.getNoteId());

        String answer = aiService.askQuestion(
                askRequest.getQuestion().trim(),
                note.getTitle(),
                note.getSourceText()
        );

        ChatResponse response = new ChatResponse(
                answer,
                !aiService.isAiConfigured(),
                note.getId(),
                note.getTitle()
        );

        return ResponseEntity.ok(response);
    }
}
