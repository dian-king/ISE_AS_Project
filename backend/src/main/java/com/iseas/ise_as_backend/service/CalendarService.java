package com.iseas.ise_as_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Generates iCalendar (.ics) payloads for interview events.
 * iCal is universally supported by Google Calendar, Outlook, and Apple Calendar
 * without requiring provider-specific OAuth.
 */
@Service
@Slf4j
public class CalendarService {

    private static final ZoneId KIGALI_TZ = ZoneId.of("Africa/Kigali");
    private static final DateTimeFormatter ICAL_FMT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

    /**
     * Builds an iCalendar string for an interview event.
     *
     * @param interviewId  UUID of the interview (used as UID)
     * @param summary      Event title, e.g. "Iga Afriqa — Interview: Alice Uwase"
     * @param description  Full event description
     * @param location     Physical address or video link
     * @param startTime    Interview start (school local time, treated as Africa/Kigali)
     * @param durationMins Duration in minutes (default 60)
     * @param organizerEmail School contact email
     * @return iCalendar text suitable for attaching as a .ics file
     */
    public String buildInterviewIcal(UUID interviewId, String summary, String description,
                                      String location, LocalDateTime startTime,
                                      int durationMins, String organizerEmail) {
        ZonedDateTime start = startTime.atZone(KIGALI_TZ);
        ZonedDateTime end   = start.plusMinutes(durationMins > 0 ? durationMins : 60);

        String dtStart  = start.format(ICAL_FMT);
        String dtEnd    = end.format(ICAL_FMT);
        String uid      = interviewId.toString() + "@igaafriqa.rw";
        String now      = LocalDateTime.now(KIGALI_TZ).format(ICAL_FMT);

        String safeDesc = description != null ? description.replace("\n", "\\n") : "";
        String safeLoc  = location    != null ? location    : "To be confirmed";
        String orgEmail = organizerEmail != null ? organizerEmail : "admissions@igaafriqa.rw";

        return "BEGIN:VCALENDAR\r\n" +
               "VERSION:2.0\r\n" +
               "PRODID:-//iga afriqa Admissions//EN\r\n" +
               "CALSCALE:GREGORIAN\r\n" +
               "METHOD:REQUEST\r\n" +
               "BEGIN:VEVENT\r\n" +
               "UID:" + uid + "\r\n" +
               "DTSTAMP;TZID=Africa/Kigali:" + now + "\r\n" +
               "DTSTART;TZID=Africa/Kigali:" + dtStart + "\r\n" +
               "DTEND;TZID=Africa/Kigali:" + dtEnd + "\r\n" +
               "SUMMARY:" + escapeIcal(summary) + "\r\n" +
               "DESCRIPTION:" + escapeIcal(safeDesc) + "\r\n" +
               "LOCATION:" + escapeIcal(safeLoc) + "\r\n" +
               "ORGANIZER;CN=iga afriqa Admissions:MAILTO:" + orgEmail + "\r\n" +
               "STATUS:CONFIRMED\r\n" +
               "SEQUENCE:0\r\n" +
               "END:VEVENT\r\n" +
               "END:VCALENDAR\r\n";
    }

    /**
     * Builds a CANCEL iCal to retract a previously issued invite.
     */
    public String buildCancelIcal(UUID interviewId, String summary, String organizerEmail) {
        String uid = interviewId.toString() + "@igaafriqa.rw";
        String now = LocalDateTime.now(KIGALI_TZ).format(ICAL_FMT);
        String orgEmail = organizerEmail != null ? organizerEmail : "admissions@igaafriqa.rw";

        return "BEGIN:VCALENDAR\r\n" +
               "VERSION:2.0\r\n" +
               "PRODID:-//iga afriqa Admissions//EN\r\n" +
               "CALSCALE:GREGORIAN\r\n" +
               "METHOD:CANCEL\r\n" +
               "BEGIN:VEVENT\r\n" +
               "UID:" + uid + "\r\n" +
               "DTSTAMP;TZID=Africa/Kigali:" + now + "\r\n" +
               "SUMMARY:" + escapeIcal(summary) + "\r\n" +
               "ORGANIZER;CN=iga afriqa Admissions:MAILTO:" + orgEmail + "\r\n" +
               "STATUS:CANCELLED\r\n" +
               "SEQUENCE:1\r\n" +
               "END:VEVENT\r\n" +
               "END:VCALENDAR\r\n";
    }

    private String escapeIcal(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace(";", "\\;")
                    .replace(",", "\\,");
    }
}
