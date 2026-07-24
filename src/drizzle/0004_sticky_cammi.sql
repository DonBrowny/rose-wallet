ALTER TABLE `patterns` ADD `extraction_regex` text;--> statement-breakpoint
ALTER TABLE `patterns` ADD `sender` text;--> statement-breakpoint
ALTER TABLE `patterns` ADD `normalizer_version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `sms_messages` ADD `match_status` text DEFAULT 'unmatched' NOT NULL;--> statement-breakpoint
UPDATE `sms_messages` SET `match_status` = 'matched' WHERE `id` IN (SELECT `sms_id` FROM `transactions` WHERE `sms_id` IS NOT NULL);