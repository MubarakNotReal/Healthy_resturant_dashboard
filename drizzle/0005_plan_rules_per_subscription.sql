ALTER TABLE "subscription_plans"
  ADD COLUMN "allow_backup_days" boolean DEFAULT true NOT NULL,
  ADD COLUMN "max_backup_days" integer DEFAULT 5 NOT NULL,
  ADD COLUMN "allow_pause" boolean DEFAULT true NOT NULL,
  ADD COLUMN "max_pause_days" integer DEFAULT 7 NOT NULL;
