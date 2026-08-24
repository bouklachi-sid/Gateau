ALTER TABLE `media_assets` ADD `retouchStatus` enum('original','retouched') DEFAULT 'original' NOT NULL;--> statement-breakpoint
ALTER TABLE `media_assets` ADD `retouchedAt` timestamp;