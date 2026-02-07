/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.3-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: u140314839_Admin2026
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `migrations` VALUES
(1,'2014_10_12_000000_create_users_table',1),
(2,'2025_12_02_000001_create_orders_table',1),
(3,'2025_12_02_000002_create_order_images_table',1),
(4,'2025_12_02_000003_create_order_logs_table',1),
(5,'2025_12_02_000004_create_password_resets_table',1),
(6,'2025_12_04_000001_create_payments_table',1),
(7,'2025_12_05_000001_add_actual_delivery_date_to_orders',1),
(8,'2026_01_25_000001_add_payment_method_to_payments',1),
(9,'2026_01_25_235800_add_entry_date_to_orders',1),
(10,'2019_12_14_000001_create_personal_access_tokens_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `order_images`
--

DROP TABLE IF EXISTS `order_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `filename` varchar(255) NOT NULL,
  `mime` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_images_order_id_foreign` (`order_id`),
  CONSTRAINT `order_images_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_images`
--

LOCK TABLES `order_images` WRITE;
/*!40000 ALTER TABLE `order_images` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `order_images` VALUES
(1,2,'uploads/orders/2/gCr5SD4H9FnPmxJ2pbHpYKDCRpA2y43dARh5HIiY.jpg','image/jpeg',3360306,'2026-02-01 09:28:09','2026-02-01 09:28:09'),
(2,3,'uploads/orders/3/niYzyZPXDNEsc9xXrmBBHzeGix2sTLpFNB6TZoBZ.jpg','image/jpeg',3294237,'2026-02-01 09:35:45','2026-02-01 09:35:45'),
(3,4,'uploads/orders/4/c9ZnYho3s73m6itMc8FVkBOIxGSgVH748yySb8At.jpg','image/jpeg',2965743,'2026-02-01 10:04:15','2026-02-01 10:04:15'),
(4,5,'uploads/orders/5/mb1X64U9mGs0ihzG65bZjPwXe9MowTsoH93dINRG.jpg','image/jpeg',3324566,'2026-02-01 10:10:23','2026-02-01 10:10:23'),
(5,6,'uploads/orders/6/GeQpPcnZer9L38WQFLnFuh371NZ5aCZjIHREeJMR.png','image/png',2487865,'2026-02-02 12:49:52','2026-02-02 12:49:52'),
(6,7,'uploads/orders/7/w83XRjRlkbokhlCqPgxUxJ1IAy3h8oyyWlnuPglG.jpg','image/jpeg',3563821,'2026-02-03 08:49:01','2026-02-03 08:49:01'),
(8,9,'uploads/orders/9/i4c1W9NuSGNK3UBVcbPfaClUdt8kQBjwd6FT4uvG.jpg','image/jpeg',4656608,'2026-02-03 08:53:10','2026-02-03 08:53:10'),
(9,10,'uploads/orders/10/xbNGkHcRa7LHPljJNUOgpcJuSD4V7v1tr3vQtk6y.jpg','image/jpeg',5135637,'2026-02-03 08:57:03','2026-02-03 08:57:03'),
(10,11,'uploads/orders/11/u1Gc9oLwW0uvl03el1TuVZRcL2zXgWVENPpB6vuA.jpg','image/jpeg',5019547,'2026-02-03 08:57:43','2026-02-03 08:57:43'),
(11,12,'uploads/orders/12/mSsq2xPlOvG0ueDqDSTy6bPgwqffoHHzywU8zqKc.jpg','image/jpeg',5182399,'2026-02-03 09:09:27','2026-02-03 09:09:27'),
(12,13,'uploads/orders/13/gVSNMTKl1AzKiyQjW92gpExzh7ZfkkckSnn9cOO3.jpg','image/jpeg',3045337,'2026-02-03 09:41:39','2026-02-03 09:41:39'),
(13,14,'uploads/orders/14/ke3TwY5JwFPEylM1o8bXPaPYKOLPuRLIXThR0yuI.png','image/png',2487865,'2026-02-03 12:45:51','2026-02-03 12:45:51'),
(14,27,'uploads/orders/27/bG7DvcOtYcF2O7nXGJh0rJCp0lIXI6SXhrPGrehL.jpg','image/jpeg',56246,'2026-02-05 07:50:14','2026-02-05 07:50:14'),
(15,28,'uploads/orders/28/4biXsmlD2DwYHdfSPYHi9EkIftZpgQWIYXsJH69h.jpg','image/jpeg',2066971,'2026-02-06 06:08:19','2026-02-06 06:08:19'),
(16,29,'uploads/orders/29/SFyQA5hmNUjf1tRaMApHNlORp6F5UaruDshEj9Vx.png','image/png',5803105,'2026-02-06 09:14:34','2026-02-06 09:14:34'),
(17,30,'uploads/orders/30/23HNjoIE1aovs9xsNbnYYnoz4uTkWXjk95Ip5IcU.jpg','image/jpeg',2484162,'2026-02-06 09:38:04','2026-02-06 09:38:04'),
(18,37,'uploads/orders/37/3fYZMvwDDGonW6Otnq9Uo4Wojk1L1IVdbkpmaa0s.jpg','image/jpeg',2484162,'2026-02-06 12:47:48','2026-02-06 12:47:48');
/*!40000 ALTER TABLE `order_images` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `order_logs`
--

DROP TABLE IF EXISTS `order_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_logs_order_id_foreign` (`order_id`),
  KEY `order_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `order_logs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_logs`
--

LOCK TABLES `order_logs` WRITE;
/*!40000 ALTER TABLE `order_logs` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `order_logs` VALUES
(1,3,1,'status_changed:ready',NULL,'2026-02-01 07:22:03','2026-02-01 07:22:03'),
(2,3,1,'status_changed:delivered','3000 pending','2026-02-01 07:22:57','2026-02-01 07:22:57'),
(3,1,1,'status_changed:ready',NULL,'2026-02-01 09:19:53','2026-02-01 09:19:53'),
(4,3,1,'status_changed:transferred',NULL,'2026-02-01 09:54:30','2026-02-01 09:54:30'),
(5,4,1,'status_changed:ready',NULL,'2026-02-01 10:04:22','2026-02-01 10:04:22'),
(6,4,1,'status_changed:transferred',NULL,'2026-02-01 10:04:24','2026-02-01 10:04:24'),
(7,5,1,'status_changed:ready',NULL,'2026-02-01 10:10:34','2026-02-01 10:10:34'),
(8,5,1,'status_changed:transferred',NULL,'2026-02-01 10:10:35','2026-02-01 10:10:35'),
(9,5,1,'status_changed:delivered','669 pending','2026-02-01 14:29:40','2026-02-01 14:29:40'),
(10,6,3,'status_changed:ready',NULL,'2026-02-02 12:50:16','2026-02-02 12:50:16'),
(11,6,3,'status_changed:delivered','2134 pending','2026-02-02 12:50:43','2026-02-02 12:50:43'),
(12,11,3,'status_changed:ready',NULL,'2026-02-03 08:58:04','2026-02-03 08:58:04'),
(13,9,3,'status_changed:ready',NULL,'2026-02-03 08:58:17','2026-02-03 08:58:17'),
(14,11,3,'status_changed:delivered','Paid in full','2026-02-03 09:01:11','2026-02-03 09:01:11');
/*!40000 ALTER TABLE `order_logs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `token` varchar(50) NOT NULL,
  `bill_number` varchar(50) DEFAULT NULL,
  `customer_name` varchar(150) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `measurements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`measurements`)),
  `delivery_date` date DEFAULT NULL,
  `entry_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `status` enum('pending','ready','delivered','transferred') NOT NULL DEFAULT 'pending',
  `remarks` text DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_token_unique` (`token`),
  UNIQUE KEY `orders_bill_number_unique` (`bill_number`),
  KEY `orders_created_by_foreign` (`created_by`),
  KEY `orders_delivery_date_status_index` (`delivery_date`,`status`),
  CONSTRAINT `orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `orders` VALUES
(1,'123','BILL-1769937588','Ashraf',5000.00,'[]','2026-02-20','2026-02-01',NULL,'ready',NULL,1,'2026-02-01 09:19:48','2026-02-01 09:19:53'),
(2,'121','BILL-1769938089','Ravi',138.00,'[]','2026-02-12','2026-02-01',NULL,'pending',NULL,1,'2026-02-01 09:28:09','2026-02-01 09:28:09'),
(3,'12314','BILL-1769938545',NULL,1856.00,'[]','2026-02-20','2026-02-01',NULL,'transferred',NULL,1,'2026-02-01 09:35:45','2026-02-01 09:54:30'),
(4,'75','BILL-1769940255','Hgh',365.00,'[]','2026-02-20','2026-02-01',NULL,'transferred',NULL,1,'2026-02-01 10:04:15','2026-02-01 10:04:24'),
(5,'999','BILL-1769940623',NULL,6669.00,'[]','2026-02-17','2026-02-01','2026-02-01','delivered',NULL,1,'2026-02-01 10:10:23','2026-02-01 14:29:40'),
(6,'Test 121','BILL-1770036592','asaf',12134.00,'[]','2026-02-14','2026-02-02','2026-02-02','delivered',NULL,3,'2026-02-02 12:49:52','2026-02-02 12:50:43'),
(7,'567','BILL-1770108541',NULL,200.00,'[]','2026-02-04','2026-02-03',NULL,'pending',NULL,3,'2026-02-03 08:49:01','2026-02-03 08:49:01'),
(9,'125','BILL-1770108790',NULL,200.00,'[]','2026-02-12','2026-02-03',NULL,'ready',NULL,3,'2026-02-03 08:53:10','2026-02-03 08:58:17'),
(10,'126','BILL-1770109023',NULL,366.00,'[]','2026-02-11','2026-02-03',NULL,'pending',NULL,3,'2026-02-03 08:57:03','2026-02-03 08:57:03'),
(11,'127','BILL-1770109063',NULL,580.00,'[]','2026-02-13','2026-02-03','2026-02-03','delivered',NULL,3,'2026-02-03 08:57:43','2026-02-03 09:01:11'),
(12,'545','BILL-1770109767',NULL,300.00,'[]','2026-02-18','2026-02-03',NULL,'pending',NULL,3,'2026-02-03 09:09:27','2026-02-03 09:09:27'),
(13,'5667','BILL-1770111699',NULL,580.00,'[]','2026-02-14','2026-02-03',NULL,'pending',NULL,3,'2026-02-03 09:41:39','2026-02-03 09:41:39'),
(14,'12387','BILL-1770122751','asfd',4545.00,'[]','2026-02-07','2026-02-03',NULL,'pending',NULL,3,'2026-02-03 12:45:51','2026-02-03 12:45:51'),
(27,'122','BILL-1770277814','ilyhg',6326.00,'[]','2026-02-12','2026-02-05',NULL,'pending',NULL,3,'2026-02-05 07:50:14','2026-02-05 07:50:14'),
(28,'945387','BILL-1770358099','Ashraf',2000.00,'[]','2026-02-07','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 06:08:19','2026-02-06 06:08:19'),
(29,'ASh322','BILL-1770369274',NULL,13455.00,'[]','2026-02-07','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 09:14:34','2026-02-06 09:14:34'),
(30,'5888','BILL-1770370684','888',969.00,'[]','2026-02-07','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 09:38:04','2026-02-06 09:38:04'),
(31,'879','BILL-1770381870',NULL,500.00,'[]','2026-02-11','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 12:44:30','2026-02-06 12:44:30'),
(32,'345','BILL-1770381889',NULL,200.00,'[]','2026-02-11','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 12:44:49','2026-02-06 12:44:49'),
(33,'766','BILL-1770381915',NULL,900.00,'[]','2026-02-09','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 12:45:15','2026-02-06 12:45:15'),
(34,'876','BILL-1770381929',NULL,600.00,'[]',NULL,'2026-02-06',NULL,'pending',NULL,3,'2026-02-06 12:45:29','2026-02-06 12:45:29'),
(36,'877','BILL-1770381949',NULL,500.00,'[]','2026-02-16','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 12:45:49','2026-02-06 12:45:49'),
(37,'T3523','BILL-1770382068',NULL,2500.00,'[]','2026-02-08','2026-02-06',NULL,'pending',NULL,3,'2026-02-06 12:47:48','2026-02-06 12:47:48'),
(38,'7667','BILL-1770389112',NULL,300.00,'[]',NULL,'2026-02-06',NULL,'pending',NULL,3,'2026-02-06 14:45:12','2026-02-06 14:45:12'),
(39,'1001','BILL-1770431385',NULL,80.00,'[]','2026-02-14','2026-02-07',NULL,'pending',NULL,3,'2026-02-07 02:29:45','2026-02-07 02:29:45'),
(40,'TEST-999','BILL-1770453150',NULL,100.00,'[]',NULL,'2026-02-07',NULL,'pending',NULL,3,'2026-02-07 08:32:30','2026-02-07 08:32:30'),
(41,'TEST-101','BILL-1770453181',NULL,200.00,'[]',NULL,'2026-02-07',NULL,'pending',NULL,3,'2026-02-07 08:33:01','2026-02-07 08:33:01');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','upi','online') NOT NULL DEFAULT 'cash',
  `payment_date` date NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_order_id_foreign` (`order_id`),
  CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `payments` VALUES
(1,5,6000.00,'online','2026-02-01','Delivery Payment','2026-02-01 14:29:40','2026-02-01 14:29:40'),
(2,6,10000.00,'cash','2026-02-02','Delivery Payment','2026-02-02 12:50:43','2026-02-02 12:50:43'),
(3,11,580.00,'cash','2026-02-03','Delivery Payment','2026-02-03 09:01:11','2026-02-03 09:01:11');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `personal_access_tokens` VALUES
(1,'App\\Models\\User',1,'auth_token','cd6587514eb64a0d42cbfe62a9bce7c0c9d060a6f65b4a2df11c1a306914b91f','[\"*\"]','2026-02-01 14:37:13',NULL,'2026-02-01 07:08:26','2026-02-01 14:37:13'),
(2,'App\\Models\\User',1,'auth_token','3cf35a3a721ff1ae50498e5abf7b36fc576c6ea90eef32cb5cbcad65a657d122','[\"*\"]','2026-02-01 14:39:37',NULL,'2026-02-01 09:18:00','2026-02-01 14:39:37'),
(3,'App\\Models\\User',1,'auth_token','62d9ad91b335f3d389bec28d50d6c602dd6238a0ea17c062c323004020828d34','[\"*\"]',NULL,NULL,'2026-02-01 09:18:42','2026-02-01 09:18:42'),
(4,'App\\Models\\User',1,'auth_token','1595c7b4c7993a75fa88d1b44a81cf2a15dd414844b5cd22edcc07d51eab07c7','[\"*\"]','2026-02-01 14:35:53',NULL,'2026-02-01 10:03:38','2026-02-01 14:35:53'),
(5,'App\\Models\\User',1,'auth_token','deffd9e7c2f868bfb324238368fa3be6cbfd2b4c7f2b867a5e5a344267d46f17','[\"*\"]','2026-02-02 12:52:10',NULL,'2026-02-01 10:09:58','2026-02-02 12:52:10'),
(6,'App\\Models\\User',2,'auth_token','f03e266ba3e19bb86b004fc8a194342dd95fad59059ca04c5e65c63cf483dc21','[\"*\"]',NULL,NULL,'2026-02-02 12:25:27','2026-02-02 12:25:27'),
(7,'App\\Models\\User',2,'auth_token','4a185ca0c809f23cea20a801313ac738990e691f79d1362dc9d0e381439b1b96','[\"*\"]',NULL,NULL,'2026-02-02 12:26:09','2026-02-02 12:26:09'),
(8,'App\\Models\\User',3,'auth_token','848eef23c009ccecd60bdbc0fdeaeb6fd80c90f6c626f582047c570939b83552','[\"*\"]',NULL,NULL,'2026-02-02 12:47:56','2026-02-02 12:47:56'),
(9,'App\\Models\\User',3,'auth_token','d24df5a7ab8988bfd7d4eaa160a18c72d03e2f46eea59d980474c234965c2ac0','[\"*\"]','2026-02-05 07:18:37',NULL,'2026-02-02 12:49:16','2026-02-05 07:18:37'),
(10,'App\\Models\\User',3,'auth_token','ef0b6d851386d730e310db40103df00eac2457610a119ba6c07d33e9a135d2f2','[\"*\"]','2026-02-03 08:53:10',NULL,'2026-02-03 06:37:36','2026-02-03 08:53:10'),
(11,'App\\Models\\User',3,'auth_token','0c5d71fd6ef264c1eec1d98c8636cea342c6a8844c87763cdc59f69c3881b4d1','[\"*\"]',NULL,NULL,'2026-02-03 08:56:06','2026-02-03 08:56:06'),
(12,'App\\Models\\User',3,'auth_token','a6b1680b8d09491c3594de61887ea53fc7e8704e323e4b9a4137fb59b5db4a24','[\"*\"]',NULL,NULL,'2026-02-03 09:58:49','2026-02-03 09:58:49'),
(13,'App\\Models\\User',3,'auth_token','753bd71d961b789d2e9f8dabf3b1d7631cbe8f9ce79818009712c06e1454a38c','[\"*\"]',NULL,NULL,'2026-02-03 12:45:21','2026-02-03 12:45:21'),
(14,'App\\Models\\User',3,'auth_token','480d10aa69871ddc9940ec4af839189697db9325f2d5ff6500627ecc831081c1','[\"*\"]',NULL,NULL,'2026-02-03 12:58:54','2026-02-03 12:58:54'),
(15,'App\\Models\\User',3,'auth_token','87c58c8b1b09b35c178f0be8315785f3b997415c8b5df3ab6b50dbfbe689ed3e','[\"*\"]',NULL,NULL,'2026-02-03 13:04:17','2026-02-03 13:04:17'),
(16,'App\\Models\\User',3,'auth_token','53a3f4f37768218a70ea7c566c14bb1b5613519beca11fea6cb94fa4c86c8d1e','[\"*\"]','2026-02-06 13:04:55',NULL,'2026-02-05 07:18:51','2026-02-06 13:04:55'),
(17,'App\\Models\\User',3,'auth_token','2f7846fbcb59907278f3191d19abbc65acb09baf57015a0b4fb113618d7c94ae','[\"*\"]',NULL,NULL,'2026-02-06 12:27:00','2026-02-06 12:27:00'),
(18,'App\\Models\\User',3,'auth_token','5ea95c0a4d97f7e273640a8a2ea41310124545e2b8fb4d6eb7970e4baf681fa5','[\"*\"]',NULL,NULL,'2026-02-06 13:05:55','2026-02-06 13:05:55'),
(19,'App\\Models\\User',3,'auth_token','9024569b25a6cc5c41f2d03c191075dc6e5fadecc18845fab40557e3ebbeb511','[\"*\"]',NULL,NULL,'2026-02-06 14:44:45','2026-02-06 14:44:45'),
(20,'App\\Models\\User',3,'auth_token','12207021386f2ba7732cb08a80907b9a3e940d6543e74dd15be0a1bb3e548aa0','[\"*\"]',NULL,NULL,'2026-02-07 02:29:10','2026-02-07 02:29:10'),
(21,'App\\Models\\User',3,'auth_token','3ad503c316170832d595da71090a2649caf48b57879bf300bdf71694013f1b10','[\"*\"]',NULL,NULL,'2026-02-07 08:32:09','2026-02-07 08:32:09');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','operator') NOT NULL DEFAULT 'operator',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'Admin','admin@admin.com',NULL,'$2y$12$CZWrHNK7lJN3wFKl7SvBKOgaS4yiF6vP8F3t3qlKdqRV0KrDGZ23a','admin',NULL,'2026-01-25 19:21:56','2026-02-05 07:10:07'),
(2,'Admin','admin',NULL,'$2y$12$a6Ku3ei9qTrjsZeaIsklBelORA.f6T65mFF7v9HO4DhqOlnhQg3Wm','operator',NULL,'2026-02-02 12:23:16','2026-02-02 12:23:16'),
(3,'Admin','kapda@factory.in',NULL,'$2y$12$PnmyVy9J3oqTTyDSn0oVJuj6AlMoc4G1UwZ6kYRAsJB97OsQTG38G','operator',NULL,'2026-02-02 12:47:51','2026-02-02 12:47:51'),
(4,'Auto Test Admin','autotest@kapdafactory.in',NULL,'$2y$12$zp1c4rkxQXPddXphfphp/OiqLMoXVf/C4IQvptWmkL/m19KYJXOD.','operator',NULL,'2026-02-04 02:36:09','2026-02-04 02:36:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-02-07 14:29:46
