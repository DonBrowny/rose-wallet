ALTER TABLE `sms_messages` ADD `sms_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_sms_hash` ON `sms_messages` (`sms_hash`);