/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 9.1.0 : Database - gold_stock_management
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`gold_stock_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `gold_stock_management`;

/*Table structure for table `app_settings` */

DROP TABLE IF EXISTS `app_settings`;

CREATE TABLE `app_settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_settings_key_key` (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `app_settings` */

insert  into `app_settings`(`id`,`key`,`value`,`updatedAt`) values 
('cmnbxbkyi0009v6fuzz21j7hb','company_name','AssetFlow Management','2026-03-29 15:38:19.483'),
('cmnbxbkyn000av6fudos77xzo','company_phone','+92 300 0000000','2026-03-29 15:38:19.488'),
('cmnbxbkyo000bv6fu03nfwi13','company_address','Lahore, Pakistan','2026-03-29 15:38:19.489'),
('cmnbxbkyp000cv6fujwj95zpq','company_email','info@assetflow.pk','2026-03-29 15:38:19.490');

/*Table structure for table `carat_options` */

DROP TABLE IF EXISTS `carat_options`;

CREATE TABLE `carat_options` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carat_options_value_key` (`value`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `carat_options` */

insert  into `carat_options`(`id`,`value`,`label`,`sortOrder`,`isActive`,`createdAt`,`updatedAt`) values 
('cmnbxbkxn0000v6fu1gjw523v','24k','24 Karat (Pure Gold)',0,1,'2026-03-29 15:38:19.451','2026-03-29 15:38:19.451'),
('cmnbxbky30001v6fu7ityqvq2','22k','22 Karat',1,1,'2026-03-29 15:38:19.467','2026-03-29 15:38:19.467'),
('cmnbxbky70002v6fuysrmecuv','21k','21 Karat',2,1,'2026-03-29 15:38:19.471','2026-03-29 15:38:19.471'),
('cmnbxbky80003v6fumupfkxlp','18k','18 Karat',3,1,'2026-03-29 15:38:19.472','2026-03-29 15:38:19.472'),
('cmnbxbky90004v6fu2h5ptr8v','14k','14 Karat',4,1,'2026-03-29 15:38:19.473','2026-03-29 15:38:19.473');

/*Table structure for table `cash_ledger` */

DROP TABLE IF EXISTS `cash_ledger`;

CREATE TABLE `cash_ledger` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` double NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `cash_ledger` */

insert  into `cash_ledger`(`id`,`balance`,`updatedAt`) values 
('default',540000,'2026-03-29 15:41:05.570');

/*Table structure for table `cash_transactions` */

DROP TABLE IF EXISTS `cash_transactions`;

CREATE TABLE `cash_transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` text COLLATE utf8mb4_unicode_ci,
  `billNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cash_transactions_billNumber_key` (`billNumber`),
  KEY `cash_transactions_personId_idx` (`personId`),
  KEY `cash_transactions_type_idx` (`type`),
  KEY `cash_transactions_date_idx` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `cash_transactions` */

insert  into `cash_transactions`(`id`,`personId`,`type`,`amount`,`date`,`notes`,`billNumber`,`createdAt`,`updatedAt`) values 
('cmnbxbkzb000iv6fuo2q43pfw','cmnbxbkyv000dv6fubc0e4gtt','LENT',50000,'2026-03-13 13:35:21.563','Short term loan','BILL-1774798699507-4447','2026-03-29 15:38:19.512','2026-03-29 15:38:19.512'),
('cmnbxbkzx000kv6fu8puloxsk','cmnbxbkyx000gv6fuvubs0mbb','RECEIVED',75000,'2026-03-07 05:28:38.600','Repayment of previous loan','BILL-1774798699530-3132','2026-03-29 15:38:19.534','2026-03-29 15:38:19.534'),
('cmnbxbl0e000mv6fuz4vpkpp1','cmnbxbkyx000fv6fu53m7uqex','DEPOSIT',200000,'2026-03-18 08:07:28.568','Initial cash deposit','BILL-1774798699546-8760','2026-03-29 15:38:19.550','2026-03-29 15:38:19.550'),
('cmnbxbl0v000ov6fu8lworwof','cmnbxbkyv000dv6fubc0e4gtt','RECEIVED',25000,'2026-03-22 18:32:17.214','Partial repayment','BILL-1774798699563-3702','2026-03-29 15:38:19.567','2026-03-29 15:38:19.567'),
('cmnbxbl1b000qv6fuo704gljw','cmnbxbkyx000ev6fujxz0sve1','LENT',30000,'2026-03-19 05:58:29.413','Business advance','BILL-1774798699579-7864','2026-03-29 15:38:19.583','2026-03-29 15:38:19.583'),
('cmnbxbl1s000sv6fuxq6k3wrl','cmnbxbkyx000fv6fu53m7uqex','WITHDRAWAL',40000,'2026-03-01 22:13:13.096','Operational expenses','BILL-1774798699596-6841','2026-03-29 15:38:19.600','2026-03-29 15:38:19.600'),
('cmnbxf53x0003152659brbddo','cmnbxexmi00001526ffw4oyb1','RECEIVED',40000,'2026-03-29 00:00:00.000','','BILL-260329-8017','2026-03-29 15:41:05.565','2026-03-29 15:41:05.565');

/*Table structure for table `gold_inventory` */

DROP TABLE IF EXISTS `gold_inventory`;

CREATE TABLE `gold_inventory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `carat` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` double NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_inventory_carat_key` (`carat`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `gold_inventory` */

insert  into `gold_inventory`(`id`,`carat`,`weight`,`updatedAt`) values 
('cmnbxbl4l0013v6fuurp5xghr','22k',69.75,'2026-03-29 15:38:19.701'),
('cmnbxbl4v0014v6fucyaif3ub','24k',0,'2026-03-29 15:38:19.712'),
('cmnbxbl4x0015v6fuw8fu1igi','18k',75,'2026-03-29 15:38:19.713');

/*Table structure for table `gold_transactions` */

DROP TABLE IF EXISTS `gold_transactions`;

CREATE TABLE `gold_transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `carat` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` double NOT NULL,
  `ratePerGram` double DEFAULT NULL,
  `totalValue` double DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` text COLLATE utf8mb4_unicode_ci,
  `billNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gold_transactions_billNumber_key` (`billNumber`),
  KEY `gold_transactions_personId_idx` (`personId`),
  KEY `gold_transactions_type_idx` (`type`),
  KEY `gold_transactions_carat_idx` (`carat`),
  KEY `gold_transactions_date_idx` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `gold_transactions` */

insert  into `gold_transactions`(`id`,`personId`,`type`,`carat`,`weight`,`ratePerGram`,`totalValue`,`date`,`notes`,`billNumber`,`createdAt`,`updatedAt`) values 
('cmnbxbl29000uv6fuft89eywb','cmnbxbkyv000dv6fubc0e4gtt','RECEIVED','22k',100.5,8500,854250,'2026-03-13 19:27:43.090',NULL,'BILL-1774798699614-5556','2026-03-29 15:38:19.618','2026-03-29 15:38:19.618'),
('cmnbxbl2p000wv6fu1kslkzt4','cmnbxbkyx000gv6fuvubs0mbb','LENT','24k',50.25,9200,462300,'2026-03-19 02:28:02.060',NULL,'BILL-1774798699630-5733','2026-03-29 15:38:19.634','2026-03-29 15:38:19.634'),
('cmnbxbl35000yv6fu7aep48st','cmnbxbkyx000fv6fu53m7uqex','RECEIVED','18k',75,7100,532500,'2026-03-19 12:42:15.457',NULL,'BILL-1774798699645-158','2026-03-29 15:38:19.649','2026-03-29 15:38:19.649'),
('cmnbxbl3n0010v6fueehhfxnb','cmnbxbkyx000ev6fujxz0sve1','LENT','22k',30.75,8500,261375,'2026-03-24 13:19:47.674',NULL,'BILL-1774798699663-6885','2026-03-29 15:38:19.667','2026-03-29 15:38:19.667'),
('cmnbxbl440012v6fu9898u1i9','cmnbxbkyv000dv6fubc0e4gtt','RECEIVED','24k',25,9200,230000,'2026-03-10 01:11:55.408',NULL,'BILL-1774798699680-6854','2026-03-29 15:38:19.684','2026-03-29 15:38:19.684');

/*Table structure for table `password_reset_tokens` */

DROP TABLE IF EXISTS `password_reset_tokens`;

CREATE TABLE `password_reset_tokens` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_token_key` (`token`),
  KEY `password_reset_tokens_token_idx` (`token`),
  KEY `password_reset_tokens_userId_idx` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `password_reset_tokens` */

/*Table structure for table `persons` */

DROP TABLE IF EXISTS `persons`;

CREATE TABLE `persons` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `persons` */

insert  into `persons`(`id`,`name`,`phone`,`email`,`address`,`notes`,`createdAt`,`updatedAt`) values 
('cmnbxbkyv000dv6fubc0e4gtt','Ahmed Khan','+92 300 9999999','ahmed@updated.com','Updated Address','updated note','2026-03-29 15:38:19.495','2026-03-29 16:01:41.011'),
('cmnbxbkyx000gv6fuvubs0mbb','Fatima Malik','+92 321 9876543',NULL,'DHA Phase 5, Lahore',NULL,'2026-03-29 15:38:19.495','2026-03-29 15:38:19.495'),
('cmnbxbkyx000fv6fu53m7uqex','Usman Ali','+92 333 5678901','usman@business.pk','Johar Town, Lahore','Bulk cash transactions','2026-03-29 15:38:19.495','2026-03-29 15:38:19.495'),
('cmnbxbkyx000ev6fujxz0sve1','Sara Hussain','+92 345 2345678',NULL,'Bahria Town, Lahore',NULL,'2026-03-29 15:38:19.495','2026-03-29 15:38:19.495'),
('cmnbxexmi00001526ffw4oyb1','shivam',NULL,NULL,NULL,NULL,'2026-03-29 15:40:55.867','2026-03-29 15:40:55.867');

/*Table structure for table `transaction_types` */

DROP TABLE IF EXISTS `transaction_types`;

CREATE TABLE `transaction_types` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#6b7280',
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_types_value_key` (`value`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `transaction_types` */

insert  into `transaction_types`(`id`,`value`,`label`,`color`,`sortOrder`,`isActive`,`createdAt`,`updatedAt`) values 
('cmnbxbkya0005v6fu0o5pa7la','LENT','Lent Out','#ef4444',0,1,'2026-03-29 15:38:19.475','2026-03-29 15:38:19.475'),
('cmnbxbkyf0006v6fu0fdel3lh','RECEIVED','Received','#22c55e',1,1,'2026-03-29 15:38:19.479','2026-03-29 15:38:19.479'),
('cmnbxbkyg0007v6fu6zon6vik','DEPOSIT','Deposit','#3b82f6',2,1,'2026-03-29 15:38:19.480','2026-03-29 15:38:19.480'),
('cmnbxbkyh0008v6fuz5gqvulo','WITHDRAWAL','Withdrawal','#f59e0b',3,1,'2026-03-29 15:38:19.481','2026-03-29 15:38:19.481');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`name`,`email`,`password`,`role`,`isActive`,`createdAt`,`updatedAt`) values 
('cmnbymcru0000133waip0gx2m','Admin','admin@assetflow.pk','$2b$12$C0iEgTIN63bb1Z/MbVRRRO/jMHYoSxrr1jzKUHTKpbme2bXVSSjSG','admin',1,'2026-03-29 16:14:41.706','2026-03-29 16:14:41.706');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
