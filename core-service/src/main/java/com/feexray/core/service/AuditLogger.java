package com.feexray.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
public class AuditLogger {

    public void logSensitiveAction(String action, UUID orgId, UUID userId, String details) {
        // In a real production system, this could write to a dedicated audit database table
        // or a specific file for SIEM ingestion. For now, we log to stdout with a clear prefix.
        log.info("AUDIT_LOG | action={} | orgId={} | userId={} | timestamp={} | details={}",
                action, orgId, userId, Instant.now(), details);
    }
}
