package com.ailecturenotes.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class TokenService {

    private final String secretKey;
    private static final long EXPIRATION_MILLIS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public TokenService(@Value("${app.jwt.secret:AI_LECTURE_NOTES_SECURE_TOKEN_SECRET_KEY_FOR_LOCAL_DEV_2026_XYZ}") String secretKey) {
        this.secretKey = secretKey;
    }

    public String generateToken(Long userId, String email) {
        long expiresAt = System.currentTimeMillis() + EXPIRATION_MILLIS;
        String payload = userId + ":" + email + ":" + expiresAt;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(encodedPayload);
        return encodedPayload + "." + signature;
    }

    public Long parseAndValidateToken(String token) {
        if (token == null || !token.contains(".")) {
            return null;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return null;
        }

        String encodedPayload = parts[0];
        String signature = parts[1];

        String expectedSignature = sign(encodedPayload);
        if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8))) {
            return null;
        }

        try {
            String payload = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
            String[] payloadParts = payload.split(":");
            if (payloadParts.length != 3) {
                return null;
            }

            long expiresAt = Long.parseLong(payloadParts[2]);
            if (System.currentTimeMillis() > expiresAt) {
                return null; // Expired
            }

            return Long.parseLong(payloadParts[0]);
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error signing token", e);
        }
    }
}
