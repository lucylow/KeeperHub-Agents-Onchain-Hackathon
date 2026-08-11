CREATE TABLE `audit_trails` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`action` varchar(255) NOT NULL,
	`status` varchar(64) NOT NULL,
	`details` text NOT NULL,
	`txHash` varchar(255),
	`gasUsed` int,
	`trigger` varchar(255),
	`simulationResult` text,
	`outcome` varchar(255),
	CONSTRAINT `audit_trails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dca_configs` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(18,8) NOT NULL,
	`tokenOut` varchar(64) NOT NULL,
	`frequency` enum('hourly','daily','weekly') NOT NULL,
	`slippageBps` int NOT NULL,
	`maxGasGwei` int NOT NULL,
	`paused` boolean NOT NULL DEFAULT false,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dca_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dca_executions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`status` enum('success','failed','pending') NOT NULL,
	`amount` decimal(18,8) NOT NULL,
	`tokenOut` varchar(64) NOT NULL,
	`executedPrice` decimal(18,8) NOT NULL,
	`gasUsed` int NOT NULL,
	`txHash` varchar(255),
	`auditTrailRef` varchar(255),
	`error` text,
	CONSTRAINT `dca_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_statuses` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`step` enum('funding','ready','firstTxLanded') NOT NULL,
	`isWalletConnected` boolean NOT NULL DEFAULT false,
	`hasUsdc` boolean NOT NULL DEFAULT false,
	`hasEth` boolean NOT NULL DEFAULT false,
	`firstTxLanded` boolean NOT NULL DEFAULT false,
	`fundingUrl` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_statuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboarding_statuses_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(255) NOT NULL,
	`payload` text NOT NULL,
	`processed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`)
);
