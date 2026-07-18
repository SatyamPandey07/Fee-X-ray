CREATE TABLE analysis_jobs (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    results_summary TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX idx_analysis_jobs_org_id ON analysis_jobs(org_id);
