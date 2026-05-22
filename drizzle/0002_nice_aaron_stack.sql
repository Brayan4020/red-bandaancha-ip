CREATE TABLE `config_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vendor` enum('huawei','cisco','fortinet') NOT NULL,
	`deviceType` enum('switch','router','firewall') NOT NULL,
	`siteId` enum('sede1','sede2','sede3') NOT NULL,
	`configName` varchar(256) NOT NULL,
	`configContent` text NOT NULL,
	`commandCount` int NOT NULL,
	`auditScore` int DEFAULT 0,
	`auditNotes` text,
	`exportFormat` enum('txt','md','json','csv') DEFAULT 'txt',
	`tags` json,
	`notes` text,
	`isTemplate` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `config_history_id` PRIMARY KEY(`id`)
);
