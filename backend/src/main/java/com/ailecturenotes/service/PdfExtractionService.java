package com.ailecturenotes.service;

import com.ailecturenotes.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PdfExtractionService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty. Please provide a valid PDF file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("PDF file size exceeds 10MB limit. Please upload a smaller document.");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        if ((contentType != null && !contentType.equalsIgnoreCase("application/pdf") && !contentType.equalsIgnoreCase("application/x-pdf"))
                && (originalFilename != null && !originalFilename.toLowerCase().endsWith(".pdf"))) {
            throw new BadRequestException("Invalid file format. Only PDF files are supported.");
        }

        try {
            byte[] fileBytes = file.getBytes();
            try (PDDocument document = Loader.loadPDF(fileBytes)) {
                if (document.isEncrypted()) {
                    throw new BadRequestException("The uploaded PDF is password protected. Please upload an unlocked PDF.");
                }

                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                String text = stripper.getText(document);

                if (text == null || text.trim().isEmpty()) {
                    throw new BadRequestException("No extractable text was found in this PDF (it may contain scanned image pages). OCR is not supported in this version.");
                }

                return text.trim();
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (IOException e) {
            throw new BadRequestException("Failed to read or parse the PDF document: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Could not process PDF: " + e.getMessage());
        }
    }
}
