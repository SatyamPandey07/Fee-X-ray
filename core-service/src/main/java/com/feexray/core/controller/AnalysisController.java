package com.feexray.core.controller;

import com.feexray.core.model.AnalysisJob;
import com.feexray.core.model.User;
import com.feexray.core.service.AnalysisJobService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisJobService analysisJobService;

    private User getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null) {
            throw new AccessDeniedException("User not authenticated or not onboarded");
        }
        return user;
    }

    @PostMapping("/run")
    public ResponseEntity<AnalysisJob> startAnalysis(HttpServletRequest request) {
        User user = getCurrentUser(request);
        AnalysisJob job = analysisJobService.submitAnalysisJob(user.getOrganization().getId());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(job);
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<AnalysisJob> getJobDetails(
            @PathVariable UUID jobId,
            HttpServletRequest request) {
        User user = getCurrentUser(request);
        
        return analysisJobService.getJob(jobId)
                .map(job -> {
                    if (!job.getOrgId().equals(user.getOrganization().getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<AnalysisJob>build();
                    }
                    return ResponseEntity.ok(job);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/jobs/latest")
    public ResponseEntity<AnalysisJob> getLatestJob(HttpServletRequest request) {
        User user = getCurrentUser(request);
        
        return analysisJobService.getLatestJob(user.getOrganization().getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
