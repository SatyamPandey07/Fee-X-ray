package com.feexray.core.repository;

import com.feexray.core.model.AnalysisJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnalysisJobRepository extends JpaRepository<AnalysisJob, UUID> {
    List<AnalysisJob> findByOrgIdOrderByCreatedAtDesc(UUID orgId);
    Optional<AnalysisJob> findFirstByOrgIdOrderByCreatedAtDesc(UUID orgId);
}
