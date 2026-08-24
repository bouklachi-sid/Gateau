ALTER TABLE `content_posts` ADD `visualComplianceStatus` enum('pending_review','approved','rejected') DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualComplianceNote` text;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualPhoneNumber` varchar(40);--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualSceneDirection` varchar(700);--> statement-breakpoint
ALTER TABLE `content_posts` ADD `cakePreserved` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `professionalStagingApproved` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `phoneNumberInImage` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `visualVerifiedAt` timestamp;