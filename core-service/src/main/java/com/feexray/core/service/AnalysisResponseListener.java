package com.feexray.core.service;

import com.feexray.core.config.RabbitConfig;
import com.feexray.core.model.AnalysisJob;
import com.feexray.core.repository.AnalysisJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnalysisResponseListener {

    private final AnalysisJobRepository analysisJobRepository;

    @RabbitListener(queues = RabbitConfig.RESPONSE_QUEUE)
    public void receiveResponse(Map<String, String> response) {
        log.info("Received analysis completion response message: {}", response);

        try {
            String jobIdStr = response.get("jobId");
            String status = response.get("status");
            String summary = response.get("summary");

            if (jobIdStr == null || status == null) {
                log.error("Invalid response message format received. Missing jobId or status.");
                return;
            }

            UUID jobId = UUID.fromString(jobIdStr);
            analysisJobRepository.findById(jobId).ifPresentOrElse(job -> {
                job.setStatus(status);
                job.setResultsSummary(summary);
                analysisJobRepository.save(job);
                log.info("Successfully updated analysis job {} to status: {}", jobId, status);
            }, () -> log.error("Analysis job with ID {} not found in database.", jobId));

        } catch (Exception e) {
            log.error("Error processing analysis response message: {}", e.getMessage(), e);
        }
    }
}
