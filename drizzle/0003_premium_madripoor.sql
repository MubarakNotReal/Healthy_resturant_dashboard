ALTER TABLE "check_ins" ADD COLUMN "subscription_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "check_ins" ADD COLUMN "meals_picked_up" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "check_ins" ADD COLUMN "attendance_status" varchar(20) DEFAULT 'present' NOT NULL;--> statement-breakpoint
ALTER TABLE "check_ins" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" DROP COLUMN "meal_type";