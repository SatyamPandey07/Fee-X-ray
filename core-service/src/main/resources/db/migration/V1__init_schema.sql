CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'FREE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    keycloak_subject_id VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_users_organization FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE bank_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    plaid_item_id VARCHAR(255) NOT NULL UNIQUE,
    institution_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_bank_connections_organization FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);
