ALTER TABLE organizations
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_subscription_id VARCHAR(255),
ADD COLUMN subscription_status VARCHAR(50);
