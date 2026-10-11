package com.ailecturenotes;

import com.ailecturenotes.service.PdfExtractionService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;

@SpringBootTest
class PdfAndQuizIntegrationTests {

    @Autowired
    private PdfExtractionService pdfExtractionService;

    @Test
    void testPdfTextExtractionWithPdfBox() throws Exception {
        // Generate a real sample in-memory PDF using PDFBox 3.x
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                stream.newLineAtOffset(50, 700);
                stream.showText("Computer Networks and OSI Layer Architecture.");
                stream.newLineAtOffset(0, -20);
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                stream.showText("The Transport layer is defined as the layer providing end-to-end communication.");
                stream.endText();
            }

            document.save(baos);
        }

        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "lecture_networks.pdf",
                "application/pdf",
                baos.toByteArray()
        );

        String extracted = pdfExtractionService.extractText(mockFile);
        Assertions.assertNotNull(extracted);
        Assertions.assertTrue(extracted.contains("Computer Networks"));
        Assertions.assertTrue(extracted.contains("Transport layer"));
    }
}
