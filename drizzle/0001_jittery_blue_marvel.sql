CREATE TABLE `ai_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int,
	`recommendationType` enum('optimization','security','redundancy','capacity','failover') NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`suggestedAction` text NOT NULL,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`confidence` decimal(3,2) DEFAULT '0.85',
	`status` enum('new','reviewed','implemented','dismissed') DEFAULT 'new',
	`implementedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automation_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskName` varchar(256) NOT NULL,
	`taskType` enum('config_apply','failover','optimization','backup','diagnostic') NOT NULL,
	`description` text,
	`targetDevices` json,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('pending','running','completed','failed','cancelled') DEFAULT 'pending',
	`scheduledFor` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`result` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automation_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `device_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`configVersion` int NOT NULL,
	`configContent` text NOT NULL,
	`configHash` varchar(64) NOT NULL,
	`status` enum('active','pending','failed','archived') DEFAULT 'pending',
	`appliedBy` int,
	`appliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `device_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`deviceType` enum('router','switch','firewall','ap','server') NOT NULL,
	`vendor` enum('huawei','cisco','juniper','fortinet','arista','other') NOT NULL,
	`model` varchar(128) NOT NULL,
	`siteId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`sshPort` int DEFAULT 22,
	`username` varchar(128),
	`passwordEncrypted` text,
	`status` enum('online','offline','maintenance') DEFAULT 'offline',
	`lastHeartbeat` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `network_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('device_down','config_change','threshold_exceeded','failover','recovery','security_alert') NOT NULL,
	`severity` enum('info','warning','error','critical') DEFAULT 'info',
	`deviceId` int,
	`message` text NOT NULL,
	`details` json,
	`resolved` boolean DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`metricType` enum('cpu','memory','bandwidth','latency','packetLoss','temperature') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`threshold` decimal(10,2),
	`status` enum('normal','warning','critical') DEFAULT 'normal',
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `network_metrics_id` PRIMARY KEY(`id`)
);
