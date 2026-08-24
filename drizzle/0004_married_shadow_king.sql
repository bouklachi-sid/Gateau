ALTER TABLE `content_posts` ADD `visualMediaAssetId` int;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualRetouched` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualDecor` varchar(160);--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualLighting` varchar(160);--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualAngle` varchar(160);--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualProps` varchar(160);--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualMood` varchar(160);