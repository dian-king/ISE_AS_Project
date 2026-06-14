package com.iseas.ise_as_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

/**
 * SMS delivery service.
 * Primary: Africa's Talking (optimised for East Africa / Rwanda, MTN/Airtel).
 * Fallback: Twilio (global coverage).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final RestTemplate restTemplate;

    private static final String AT_API_URL = "https://api.africastalking.com/version1/messaging";
    private static final String TWILIO_API_URL = "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json";

    // Africa's Talking
    @Value("${africas-talking.api-key:}")
    private String atApiKey;

    @Value("${africas-talking.username:sandbox}")
    private String atUsername;

    @Value("${africas-talking.sender-id:}")
    private String atSenderId;

    // Twilio fallback
    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.from-number:}")
    private String twilioFromNumber;

    /**
     * Sends an SMS. Tries Africa's Talking first; falls back to Twilio if AT
     * is not configured or the call fails.
     *
     * @param to      Recipient phone in E.164 format, e.g. +250788123456
     * @param message SMS body (max 160 chars for single SMS)
     */
    public void send(String to, String message) {
        if (to == null || to.isBlank()) {
            log.debug("SMS skipped — no recipient phone number.");
            return;
        }

        if (atApiKey != null && !atApiKey.isBlank()) {
            if (sendViaAfricasTalking(to, message)) return;
        } else {
            log.info("Africa's Talking not configured — trying Twilio fallback.");
        }

        if (twilioAccountSid != null && !twilioAccountSid.isBlank()) {
            sendViaTwilio(to, message);
        } else {
            log.info("SMS not delivered (no provider configured) — would have sent to {}: {}", to, message);
        }
    }

    // ── Africa's Talking ──────────────────────────────────────────────────

    private boolean sendViaAfricasTalking(String to, String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("apiKey", atApiKey);
            headers.set("Accept", "application/json");

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("username", atUsername);
            body.add("to", to);
            body.add("message", message);
            if (atSenderId != null && !atSenderId.isBlank()) {
                body.add("from", atSenderId);
            }

            ResponseEntity<String> response = restTemplate.postForEntity(
                    AT_API_URL, new HttpEntity<>(body, headers), String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("SMS sent via Africa's Talking to {}", to);
                return true;
            }
            log.warn("Africa's Talking returned {} for {} — will try Twilio fallback",
                     response.getStatusCode(), to);
            return false;
        } catch (Exception e) {
            log.warn("Africa's Talking send failed for {} ({}), trying Twilio fallback", to, e.getMessage());
            return false;
        }
    }

    // ── Twilio fallback ───────────────────────────────────────────────────

    private void sendViaTwilio(String to, String message) {
        try {
            String url = String.format(TWILIO_API_URL, twilioAccountSid);

            String credentials = twilioAccountSid + ":" + twilioAuthToken;
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + encoded);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("From", twilioFromNumber);
            body.add("To", to);
            body.add("Body", message);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    url, new HttpEntity<>(body, headers), String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("SMS sent via Twilio fallback to {}", to);
            } else {
                log.warn("Twilio returned {} for {}", response.getStatusCode(), to);
            }
        } catch (Exception e) {
            log.warn("Twilio SMS fallback failed for {}: {}", to, e.getMessage());
        }
    }
}
