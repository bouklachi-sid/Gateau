CREATE TABLE `automation_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`isEnabled` int NOT NULL DEFAULT 0,
	`maxPostsPerDay` int NOT NULL DEFAULT 5,
	`scheduleCronTaskUid` varchar(65),
	`lastPreparedAt` timestamp,
	`lastPublishedAt` timestamp,
	`stoppedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automation_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `automation_settings_business_unique` UNIQUE(`businessId`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`tagline` varchar(220),
	`brandStory` text,
	`market` varchar(80) NOT NULL DEFAULT 'Algérie',
	`primaryLanguage` enum('fr','ar','darija','mixed') NOT NULL DEFAULT 'mixed',
	`tone` varchar(160) NOT NULL DEFAULT 'Élégant, chaleureux et gourmand',
	`accentColor` varchar(12) NOT NULL DEFAULT '#BC6C3B',
	`logoUrl` text,
	`phone` varchar(40),
	`whatsapp` varchar(40),
	`orderUrl` text,
	`orderInstructions` text,
	`timezone` varchar(64) NOT NULL DEFAULT 'Africa/Algiers',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_owner_unique` UNIQUE(`ownerId`)
);
--> statement-breakpoint
CREATE TABLE `content_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`productId` int,
	`offerId` int,
	`contentType` enum('commercial','saisonnier','traditionnel','produit','offre','engagement') NOT NULL,
	`format` enum('text','link','image') NOT NULL DEFAULT 'text',
	`status` enum('draft','scheduled','publishing','published','failed','cancelled') NOT NULL DEFAULT 'draft',
	`title` varchar(180),
	`caption` text,
	`callToAction` varchar(220),
	`hashtags` text,
	`linkUrl` text,
	`imageUrl` text,
	`imagePrompt` text,
	`scheduledFor` timestamp,
	`publishedAt` timestamp,
	`metaPostId` varchar(120),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(140) NOT NULL,
	`deliveryFeeDzd` decimal(12,2),
	`minimumOrderDzd` decimal(12,2),
	`note` varchar(240),
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`postId` int,
	`productId` int,
	`kind` enum('product','promotion','brand') NOT NULL,
	`source` enum('upload','generated') NOT NULL,
	`url` text NOT NULL,
	`prompt` text,
	`altText` varchar(280),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meta_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`pageId` varchar(80),
	`pageName` varchar(180),
	`status` enum('disconnected','connected','needs_reauth','error') NOT NULL DEFAULT 'disconnected',
	`lastValidatedAt` timestamp,
	`lastError` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meta_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `meta_connections_business_unique` UNIQUE(`businessId`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`terms` text,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` enum('traditionnel','moderne','événement','coffret','autre') NOT NULL DEFAULT 'autre',
	`description` text,
	`priceDzd` decimal(12,2),
	`photoUrl` text,
	`visualPrompt` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`postId` int,
	`event` enum('prepared','queued','published','failed','paused','resumed','blocked') NOT NULL,
	`message` text NOT NULL,
	`metaResponse` text,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publication_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publishing_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`label` varchar(100) NOT NULL,
	`timeOfDay` varchar(5) NOT NULL,
	`daysOfWeek` json NOT NULL,
	`preferredContentTypes` json NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publishing_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `automation_settings` ADD CONSTRAINT `automation_settings_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `businesses` ADD CONSTRAINT `businesses_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_posts` ADD CONSTRAINT `content_posts_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_posts` ADD CONSTRAINT `content_posts_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_posts` ADD CONSTRAINT `content_posts_offerId_offers_id_fk` FOREIGN KEY (`offerId`) REFERENCES `offers`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `delivery_zones` ADD CONSTRAINT `delivery_zones_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_postId_content_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `content_posts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meta_connections` ADD CONSTRAINT `meta_connections_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offers` ADD CONSTRAINT `offers_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_logs` ADD CONSTRAINT `publication_logs_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_logs` ADD CONSTRAINT `publication_logs_postId_content_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `content_posts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publishing_slots` ADD CONSTRAINT `publishing_slots_businessId_businesses_id_fk` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `automation_settings_task_uid_idx` ON `automation_settings` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `content_posts_business_status_idx` ON `content_posts` (`businessId`,`status`);--> statement-breakpoint
CREATE INDEX `content_posts_scheduled_idx` ON `content_posts` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `delivery_zones_business_idx` ON `delivery_zones` (`businessId`);--> statement-breakpoint
CREATE INDEX `media_assets_business_idx` ON `media_assets` (`businessId`);--> statement-breakpoint
CREATE INDEX `offers_business_idx` ON `offers` (`businessId`);--> statement-breakpoint
CREATE INDEX `products_business_idx` ON `products` (`businessId`);--> statement-breakpoint
CREATE INDEX `publication_logs_business_occurred_idx` ON `publication_logs` (`businessId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `publication_logs_post_idx` ON `publication_logs` (`postId`);--> statement-breakpoint
CREATE INDEX `publishing_slots_business_idx` ON `publishing_slots` (`businessId`);