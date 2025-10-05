CREATE TABLE `pattern_sms_group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pattern_id` integer NOT NULL,
	`sms_id` integer NOT NULL,
	`confidence` real DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`pattern_id`) REFERENCES `patterns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sms_id`) REFERENCES `sms_messages`(`id`) ON UPDATE no action ON DELETE no action
);
