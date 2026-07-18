package com.feexray.core.service;

import com.feexray.core.config.RabbitConfig;
import com.feexray.core.model.AnalysisJob;
import com.feexray.core.repository.AnalysisJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisJobService {

    private final AnalysisJobRepository analysisJobRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public AnalysisJob submitAnalysisJob(UUID orgId) {
        log.info("Submitting new analysis job for org: {}", orgId);

        AnalysisJob job = AnalysisJob.builder()
                .orgId(orgId)
                .status("PENDING")
                .build();

        job = analysisJobRepository.save(job);

        Map<String, String> message = Map.of(
                "jobId", job.getId().toString(),
                "orgId", orgId.toString()
        );

        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE,
                RabbitConfig.REQUEST_KEY,
                message
        );

        log.info("Successfully submitted and published analysis job: {}", job.getId());
        return job;
    }

    public Optional<AnalysisJob> getJob(UUID jobId) {
        return analysisJobRepository.findById(jobId);
    }

    public Optional<AnalysisJob> getLatestJob(UUID orgId) {
        return analysisJobRepository.findFirstByOrgIdOrderByCreatedAtDesc(orgId);
    }
}
