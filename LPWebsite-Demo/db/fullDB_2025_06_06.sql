/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: Billiards-Site
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Admin`
--

DROP TABLE IF EXISTS `Admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `Admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Announcements`
--

DROP TABLE IF EXISTS `Announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Announcements` (
  `announcement_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `priority` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`announcement_id`),
  KEY `idx_expiry_active` (`expiry_date`,`is_active`),
  KEY `idx_priority` (`priority` DESC),
  KEY `idx_created_at` (`created_at` DESC),
  KEY `idx_announcements_active` (`is_active`,`expiry_date`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Announcements`
--

LOCK TABLES `Announcements` WRITE;
/*!40000 ALTER TABLE `Announcements` DISABLE KEYS */;
INSERT INTO `Announcements` VALUES
(10,'Test Announcement','this should expire on June 4',NULL,'2025-07-03',1,0,'2025-06-04 02:12:54','2025-06-04 02:12:54');
/*!40000 ALTER TABLE `Announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BusinessSettings`
--

DROP TABLE IF EXISTS `BusinessSettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BusinessSettings` (
  `setting_id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` enum('text','email','phone','number','textarea') DEFAULT 'text',
  `display_name` varchar(200) NOT NULL,
  `category` varchar(50) DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_business_settings_key` (`setting_key`),
  KEY `idx_business_settings_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BusinessSettings`
--

LOCK TABLES `BusinessSettings` WRITE;
/*!40000 ALTER TABLE `BusinessSettings` DISABLE KEYS */;
INSERT INTO `BusinessSettings` VALUES
(1,'business_name','Leather Pocket','text','Business Name','general','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(2,'phone_number','123-456-7891','phone','Phone Number','contact','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(3,'email_address','contact@leatherpocket.com','email','Contact Email','contact','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(4,'address_line1','3715 Edmonton Trail NE','text','Address Line 1','contact','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(5,'address_line2','Calgary, AB, T2E 3P3','text','Address Line 2','contact','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(6,'hours_description','7 days a week (11AM to 2AM)\n365 days a year\nIncluding every holiday','textarea','Operating Hours','general','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(7,'table_count_7ft_diamond','8','number','7-foot Diamond Tables','tables','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(8,'table_count_7ft_valley','2','number','7-foot Valley Tables','tables','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(9,'table_count_9ft_diamond','10','number','9-foot Diamond Tables','tables','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(10,'social_facebook','@LeatherPocket','text','Facebook Handle','social','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(11,'social_instagram','@LeatherPocket','text','Instagram Handle','social','2025-06-06 05:04:13','2025-06-06 05:09:35'),
(12,'google_maps_embed','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2506.2353179953684!2d-114.05533332340514!3d51.08566457172042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5371650b59d10d93%3A0xf13e461150efea6a!2s3715%20Edmonton%20Trl%2C%20Calgary%2C%20AB%20T2E%203P4!5e0!3m2!1sen!2sca!4v1733561185119!5m2!1sen!2sca','textarea','Google Maps Embed URL','general','2025-06-06 05:04:13','2025-06-06 05:09:35');
/*!40000 ALTER TABLE `BusinessSettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ContactRequest`
--

DROP TABLE IF EXISTS `ContactRequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ContactRequest` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `sender_name` varchar(100) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`request_id`),
  KEY `idx_team_status` (`team_id`,`status`),
  CONSTRAINT `ContactRequest_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ContactRequest`
--

LOCK TABLES `ContactRequest` WRITE;
/*!40000 ALTER TABLE `ContactRequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `ContactRequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DealPricing`
--

DROP TABLE IF EXISTS `DealPricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `DealPricing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tableType` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DealPricing`
--

LOCK TABLES `DealPricing` WRITE;
/*!40000 ALTER TABLE `DealPricing` DISABLE KEYS */;
INSERT INTO `DealPricing` VALUES
(1,'7ft Valley Tables',15.00,'2025-05-23 02:35:02','2025-05-23 02:35:02'),
(2,'7ft Diamond Tables',20.00,'2025-05-23 02:35:02','2025-05-23 02:35:02'),
(3,'9ft Diamond Tables',25.00,'2025-05-23 02:35:02','2025-05-23 02:35:02');
/*!40000 ALTER TABLE `DealPricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `DealPricing_View`
--

DROP TABLE IF EXISTS `DealPricing_View`;
/*!50001 DROP VIEW IF EXISTS `DealPricing_View`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `DealPricing_View` AS SELECT
 1 AS `id`,
  1 AS `tableType`,
  1 AS `price`,
  1 AS `created_at`,
  1 AS `updated_at` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `EventReservation`
--

DROP TABLE IF EXISTS `EventReservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `EventReservation` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_type_id` int(11) NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `event_id` (`event_type_id`),
  CONSTRAINT `EventReservation_ibfk_1` FOREIGN KEY (`event_type_id`) REFERENCES `SeasonalEvent` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EventReservation`
--

LOCK TABLES `EventReservation` WRITE;
/*!40000 ALTER TABLE `EventReservation` DISABLE KEYS */;
/*!40000 ALTER TABLE `EventReservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `tables_used` varchar(100) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_pattern_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_recurring_pattern` (`recurring_pattern_id`),
  KEY `idx_events_date` (`event_date`),
  KEY `idx_events_recurring` (`is_recurring`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`recurring_pattern_id`) REFERENCES `RecurringEventPatterns` (`pattern_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES
(1,'New Year Special Tournament','Special tournament to celebrate the new year','2024-01-01','14:00:00','18:00:00','All Tables',0,NULL,'2025-05-27 00:43:27','2025-05-27 00:43:27',NULL),
(2,'Pool Party Night','Casual pool night with music and drinks','2024-01-15','20:00:00','24:00:00','Tables 7-10',0,NULL,'2025-05-27 00:43:27','2025-05-27 00:43:27',NULL),
(17,'Large tournament','this is just a test tournament to see  how things will be formatted for one time events where the number of tables are not listed and an image is not posted.','2025-05-31','14:52:00','18:55:00','',0,NULL,'2025-05-31 00:52:20','2025-05-31 00:52:20',NULL),
(22,'Thursday 8-Ball - Summer 2025 Playoffs Begin','Summer 2025 playoffs begin for Thursday 8-Ball','2025-08-17','19:00:00','23:00:00','8',0,NULL,'2025-06-05 22:38:40','2025-06-05 22:38:40',NULL),
(23,'Tuna sandwich - Summer 2025 Playoffs Begin','Summer 2025 playoffs begin for Tuna sandwich','2025-07-01','19:00:00','23:00:00','7',0,NULL,'2025-06-06 01:32:07','2025-06-06 01:32:07',NULL);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FAQ`
--

DROP TABLE IF EXISTS `FAQ`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `FAQ` (
  `faq_id` int(11) NOT NULL AUTO_INCREMENT,
  `topic` varchar(100) NOT NULL DEFAULT 'Other',
  `question` text NOT NULL,
  `answer` text NOT NULL,
  PRIMARY KEY (`faq_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FAQ`
--

LOCK TABLES `FAQ` WRITE;
/*!40000 ALTER TABLE `FAQ` DISABLE KEYS */;
INSERT INTO `FAQ` VALUES
(1,'Pricing + Hours','What are your opening hours?','We are open from 11:00am - 2:00 am.  We are also open every holiday!'),
(2,'Leagues','How do I join your in-house League?','You can utilize the team registration from our website to contact existing teams.  Alternatively, you can place your name in the player pool under the team-finder.  Teams interested in you will reach out.  You can also reach out to other players and form your own team.'),
(3,'Leagues','How do I use the Team Finder?','You can use the team finder in two ways. Place your name in the pool and hope you get contacted by players.  You can also reach out to other players to see if they\'re interested in forming a team with you.  When you have enough players to form a team (5) you can register your team in \"Team Registration\".'),
(4,'Leagues','What is the difference between Tentative and Registered for Team Registration?','Tentative teams mean they are interested in playing that night, however, they have not paid their $200 deposit to reserve their spot.\n\nIf a Team is registered that means they have paid their deposit and their spot in that night is reserved.'),
(5,'Leagues','Why can I only contact some teams?','Teams with the contact button available welcome new players contacting them about joining.  If there is no contact button then they do not want new players');
/*!40000 ALTER TABLE `FAQ` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Food`
--

DROP TABLE IF EXISTS `Food`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Food` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `card_size` enum('small','large') DEFAULT 'small',
  PRIMARY KEY (`item_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `Food_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `MenuCategories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Food`
--

LOCK TABLES `Food` WRITE;
/*!40000 ALTER TABLE `Food` DISABLE KEYS */;
INSERT INTO `Food` VALUES
(1,'Chicken Wings','flavors: HONEY HOT,  HONEY GARLIC, TERIYAKI, BBQ, SWEET CHILI, salt & pepper, lemon pepper, hot, medium / SERVED WITH CARROTS AND CELERY / ADD RANCH $1',15.00,1,'large'),
(2,'BONELESS DRY RIBS','flavors: HONEY HOT,  HONEY GARLIC, TERIYAKI, BBQ, SWEET CHILI, salt & pepper, lemon pepper, hot, medium / SERVED WITH CARROTS AND CELERY / ADD RANCH $1',14.00,1,'large'),
(3,'BACON, CHEDDAR BURGER','LETTUCE, TOMATOES, ONIONS, MAYO AND PICKLES / ADD CHEESE OR BACON $2 / MAKE IT A DOUBLE PATTY $4',16.00,2,'large'),
(4,'TWO EGGS ANY STYLE','SERVED WITH HASH BROWNS, TOAST AND YOUR CHOICE OF SAUSAGE OR BACON / ADD EXTRA BACON OR SAUSAGE $2',12.00,3,'large'),
(5,'GARDEN SALAD','LETTUCE, TOMATOES, ONIONS, CELERY, GREEN PEPPERS, CUCUMBERS, SLICED CARROTS, WITH RANCH OR ITALIAN DRESSING / ADD BREADED CHICKEN $5',9.00,4,'large'),
(6,'Tuna sandwich','A CLASSIC TUNA SANDWICH WITH DELICIOUS FLAKY TuNA MIXED WITH, PICKLES, MAYO, AND LETTUCE ON YOUR CHOICE OF BREAD SERVED WTIH YOUR CHOICE OF SIDE: FRIES, SALAD, OR YAM FRIES.',14.00,2,'large'),
(7,'Spaghetti ','We dont actually sell this',18.00,19,'small'),
(12,'Ham And Cheese','This is a pretty average sandwich',4.00,2,'small'),
(13,'test sandwich','food',2.00,2,'small'),
(14,'test','test',3.00,19,'small'),
(15,'tgs','gs',3.00,19,'small'),
(16,'appTest','te',4.00,1,'small'),
(17,'Imposter Sandwich','A CLASSIC TUNA SANDWICH WITH DELICIOUS FLAKY TuNA MIXED WITH, PICKLES, MAYO, AND LETTUCE ON YOUR CHOICE OF BREAD SERVED WTIH YOUR CHOICE OF SIDE: FRIES, SALAD, OR YAM FRIES.',15.00,2,'large'),
(19,'Test size','this is just a test',12.00,19,'small'),
(20,'sand','a',12.00,2,'small'),
(21,'which','b',13.00,2,'small');
/*!40000 ALTER TABLE `Food` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HomeGallery`
--

DROP TABLE IF EXISTS `HomeGallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `HomeGallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `image_path` varchar(500) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `upload_date` timestamp NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HomeGallery`
--

LOCK TABLES `HomeGallery` WRITE;
/*!40000 ALTER TABLE `HomeGallery` DISABLE KEYS */;
INSERT INTO `HomeGallery` VALUES
(2,'gallery-1749204913702-571798530.jpg','hooey tournament.jpg','/uploads/gallery/gallery-1749204913702-571798530.jpg',1,1,'2025-06-06 10:15:13','2025-06-06 10:30:45'),
(3,'gallery-1749204926557-47141438.jpg','LPfullHouse.jpg','/uploads/gallery/gallery-1749204926557-47141438.jpg',4,1,'2025-06-06 10:15:26','2025-06-06 10:30:59'),
(6,'gallery-1749205739276-292188773.jpg','LPStaff.jpg','/uploads/gallery/gallery-1749205739276-292188773.jpg',5,1,'2025-06-06 10:28:59','2025-06-06 10:30:59'),
(7,'gallery-1749205747206-830431320.jpg','9ftsNiceView.jpg','/uploads/gallery/gallery-1749205747206-830431320.jpg',6,1,'2025-06-06 10:29:07','2025-06-06 10:30:59'),
(8,'gallery-1749205758469-328973149.jpg','alexLP.jpg','/uploads/gallery/gallery-1749205758469-328973149.jpg',7,1,'2025-06-06 10:29:18','2025-06-06 10:30:59'),
(9,'gallery-1749205764618-152556497.jpg','alex.jpg','/uploads/gallery/gallery-1749205764618-152556497.jpg',2,1,'2025-06-06 10:29:24','2025-06-06 10:30:51'),
(10,'gallery-1749205771809-216749938.jpg','9ftTables.jpg','/uploads/gallery/gallery-1749205771809-216749938.jpg',8,1,'2025-06-06 10:29:31','2025-06-06 10:30:59'),
(11,'gallery-1749205787141-74009181.jpg','LeaguePlayoffWinners.jpg','/uploads/gallery/gallery-1749205787141-74009181.jpg',9,1,'2025-06-06 10:29:47','2025-06-06 10:30:59'),
(12,'gallery-1749205807944-592136466.jpg','JuniorPoolSchool.jpg','/uploads/gallery/gallery-1749205807944-592136466.jpg',3,1,'2025-06-06 10:30:07','2025-06-06 10:30:59'),
(13,'gallery-1749205824381-846066996.jpg','Funny image.jpg','/uploads/gallery/gallery-1749205824381-846066996.jpg',10,1,'2025-06-06 10:30:24','2025-06-06 10:30:45');
/*!40000 ALTER TABLE `HomeGallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `League`
--

DROP TABLE IF EXISTS `League`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `League` (
  `league_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `max_teams` int(11) DEFAULT NULL,
  `fargo_cap` int(11) DEFAULT NULL,
  `play_night` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `play_time` time NOT NULL,
  `tables_reserved` int(11) DEFAULT NULL,
  `table_type` int(11) NOT NULL,
  `season_name` varchar(100) DEFAULT NULL,
  `season_start_date` date DEFAULT NULL,
  `season_end_date` date DEFAULT NULL,
  `playoff_start_date` date DEFAULT NULL,
  `skill_cap` int(11) DEFAULT 3000,
  `is_active` tinyint(1) DEFAULT 1,
  `registration_open` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`league_id`),
  KEY `idx_league_play_night` (`play_night`),
  KEY `idx_league_active` (`is_active`),
  KEY `idx_league_registration` (`registration_open`),
  KEY `idx_league_season_dates` (`season_start_date`,`season_end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `League`
--

LOCK TABLES `League` WRITE;
/*!40000 ALTER TABLE `League` DISABLE KEYS */;
INSERT INTO `League` VALUES
(5,'Thursday 8-Ball',NULL,16,NULL,'Thursday','19:00:00',8,1,'Summer 2025','2025-06-12','2025-08-14','2025-08-17',3000,1,1,'2025-06-05 22:38:40','2025-06-05 22:49:16'),
(6,'Tuna sandwich',NULL,16,NULL,'Tuesday','19:00:00',7,1,'Summer 2025','2025-06-10','2025-06-24','2025-07-01',2800,1,1,'2025-06-06 01:32:07','2025-06-06 01:32:07');
/*!40000 ALTER TABLE `League` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LeagueSeasonEvents`
--

DROP TABLE IF EXISTS `LeagueSeasonEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LeagueSeasonEvents` (
  `event_link_id` int(11) NOT NULL AUTO_INCREMENT,
  `league_id` int(11) NOT NULL,
  `event_type` enum('season_start','season_end','playoff_start') NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `recurring_pattern_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`event_link_id`),
  KEY `event_id` (`event_id`),
  KEY `recurring_pattern_id` (`recurring_pattern_id`),
  KEY `idx_league_events` (`league_id`),
  KEY `idx_event_type` (`event_type`),
  CONSTRAINT `LeagueSeasonEvents_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `League` (`league_id`) ON DELETE CASCADE,
  CONSTRAINT `LeagueSeasonEvents_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE SET NULL,
  CONSTRAINT `LeagueSeasonEvents_ibfk_3` FOREIGN KEY (`recurring_pattern_id`) REFERENCES `RecurringEventPatterns` (`pattern_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LeagueSeasonEvents`
--

LOCK TABLES `LeagueSeasonEvents` WRITE;
/*!40000 ALTER TABLE `LeagueSeasonEvents` DISABLE KEYS */;
INSERT INTO `LeagueSeasonEvents` VALUES
(6,5,'season_start',NULL,9,'2025-06-05 22:38:40'),
(7,5,'playoff_start',22,NULL,'2025-06-05 22:38:40'),
(8,6,'season_start',NULL,12,'2025-06-06 01:32:07'),
(9,6,'playoff_start',23,NULL,'2025-06-06 01:32:07');
/*!40000 ALTER TABLE `LeagueSeasonEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MenuCategories`
--

DROP TABLE IF EXISTS `MenuCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MenuCategories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_path` varchar(255) DEFAULT NULL,
  `image_position` enum('left','right','none') DEFAULT 'none',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MenuCategories`
--

LOCK TABLES `MenuCategories` WRITE;
/*!40000 ALTER TABLE `MenuCategories` DISABLE KEYS */;
INSERT INTO `MenuCategories` VALUES
(1,'Appetizers','Appetizers',1,1,'2025-05-26 04:36:12','2025-05-26 05:18:32','/uploads/categories/category-1748236712832-294135342.webp','left'),
(2,'BurgersAndSandwiches','Burgers and Sandwiches',2,1,'2025-05-26 04:36:12','2025-05-26 06:58:37','/burger.png','left'),
(3,'AllDayBreakfast','All Day Breakfast',3,1,'2025-05-26 04:36:12','2025-05-26 05:03:37','/breakfast.png','left'),
(4,'Salads','Salads',4,1,'2025-05-26 04:36:12','2025-05-26 04:36:12',NULL,'none'),
(14,'TestCategory','Test Category',0,0,'2025-05-26 05:31:57','2025-05-26 05:35:02',NULL,'none'),
(19,'PastaDishes','Pasta Dishes',0,1,'2025-05-26 05:41:46','2025-05-27 00:22:27','/uploads/categories/category-1748238118790-847148025.webp','left');
/*!40000 ALTER TABLE `MenuCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PlayerFinder`
--

DROP TABLE IF EXISTS `PlayerFinder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlayerFinder` (
  `player_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `play_nights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`play_nights`)),
  `skill_level` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `active` tinyint(1) DEFAULT 1,
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_player_active` (`active`),
  KEY `idx_player_email` (`email`),
  KEY `idx_player_reset_token` (`reset_token_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PlayerFinder`
--

LOCK TABLES `PlayerFinder` WRITE;
/*!40000 ALTER TABLE `PlayerFinder` DISABLE KEYS */;
INSERT INTO `PlayerFinder` VALUES
(1,'Melinda Showfield','melinda@melinda.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I like to shoot balls into a pocket','[\"Monday\",\"Friday\"]','Advanced','2024-12-08 09:19:37',1,NULL,NULL),
(2,'Jenny Face','face@hand.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I have hands. Also a face... maybe.','[\"Tuesday\",\"Wednesday\",\"Thursday\"]','Professional','2024-12-08 09:20:22',1,NULL,NULL),
(3,'Ludwig Von Beethoven','classical@music.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I am dead.','[\"Monday\",\"Thursday\",\"Friday\"]','Beginner','2024-12-08 09:21:13',1,NULL,NULL),
(4,'Ronald Mcdonald','ronald@mcdonald.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I like burgers.','[\"Thursday\",\"Tuesday\"]','Intermediate','2024-12-08 09:21:50',1,NULL,NULL),
(5,'John Smith','john@smith.ca','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','Pool is pretty fun.','[\"Monday\"]','Beginner','2024-12-08 09:22:24',1,NULL,NULL),
(6,'Ethan McCorquodale','ethan.mccorquodale@gmail.com','c2a3134ea69eeec1689bf809385f9de47dcafc8484896df10cbaefeb61eeb960','I play pool','[\"Thursday\"]','Intermediate','2025-06-05 08:14:25',1,NULL,NULL);
/*!40000 ALTER TABLE `PlayerFinder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Playoffs`
--

DROP TABLE IF EXISTS `Playoffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Playoffs` (
  `playoff_id` int(11) NOT NULL AUTO_INCREMENT,
  `league_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `start_time` time NOT NULL,
  PRIMARY KEY (`playoff_id`),
  KEY `league_id` (`league_id`),
  CONSTRAINT `Playoffs_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `League` (`league_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Playoffs`
--

LOCK TABLES `Playoffs` WRITE;
/*!40000 ALTER TABLE `Playoffs` DISABLE KEYS */;
/*!40000 ALTER TABLE `Playoffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PricingRates`
--

DROP TABLE IF EXISTS `PricingRates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PricingRates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_type_id` int(11) NOT NULL,
  `pricing_type` enum('regular','deal') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `price_unit` varchar(20) DEFAULT 'hour',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pricing` (`table_type_id`,`pricing_type`),
  CONSTRAINT `PricingRates_ibfk_1` FOREIGN KEY (`table_type_id`) REFERENCES `TableTypes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PricingRates`
--

LOCK TABLES `PricingRates` WRITE;
/*!40000 ALTER TABLE `PricingRates` DISABLE KEYS */;
INSERT INTO `PricingRates` VALUES
(1,1,'deal',15.00,'person',1,'2025-06-06 09:20:53','2025-06-06 09:20:53'),
(2,2,'deal',20.00,'person',1,'2025-06-06 09:20:53','2025-06-06 09:20:53'),
(3,3,'deal',25.00,'person',1,'2025-06-06 09:20:53','2025-06-06 09:20:53'),
(4,1,'regular',12.00,'hour',1,'2025-06-06 09:20:53','2025-06-06 09:20:53'),
(5,2,'regular',13.00,'hour',1,'2025-06-06 09:20:53','2025-06-06 09:20:53'),
(6,3,'regular',14.00,'hour',1,'2025-06-06 09:20:53','2025-06-06 09:20:53'),
(7,4,'deal',20.00,'person',1,'2025-06-06 09:23:55','2025-06-06 09:24:21'),
(8,4,'regular',15.00,'hour',1,'2025-06-06 09:24:04','2025-06-06 09:24:49');
/*!40000 ALTER TABLE `PricingRates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RecurringEventExceptions`
--

DROP TABLE IF EXISTS `RecurringEventExceptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `RecurringEventExceptions` (
  `exception_id` int(11) NOT NULL AUTO_INCREMENT,
  `pattern_id` int(11) NOT NULL,
  `exception_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`exception_id`),
  UNIQUE KEY `unique_pattern_date` (`pattern_id`,`exception_date`),
  KEY `idx_exception_date` (`exception_date`),
  CONSTRAINT `RecurringEventExceptions_ibfk_1` FOREIGN KEY (`pattern_id`) REFERENCES `RecurringEventPatterns` (`pattern_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RecurringEventExceptions`
--

LOCK TABLES `RecurringEventExceptions` WRITE;
/*!40000 ALTER TABLE `RecurringEventExceptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `RecurringEventExceptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RecurringEventPatterns`
--

DROP TABLE IF EXISTS `RecurringEventPatterns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `RecurringEventPatterns` (
  `pattern_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `tables_used` varchar(100) DEFAULT NULL,
  `pattern_start_date` date NOT NULL,
  `pattern_end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`pattern_id`),
  KEY `idx_day_of_week` (`day_of_week`),
  KEY `idx_active` (`is_active`),
  KEY `idx_patterns_day` (`day_of_week`),
  KEY `idx_patterns_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RecurringEventPatterns`
--

LOCK TABLES `RecurringEventPatterns` WRITE;
/*!40000 ALTER TABLE `RecurringEventPatterns` DISABLE KEYS */;
INSERT INTO `RecurringEventPatterns` VALUES
(7,'Saturday 8-Ball Tournament','This is a recurring tournament that happens every Saturday.  $200 added.  Fargo handicapped.  Must have be established with 200+ games in Fargo.','Saturday','14:00:00','00:00:00','1-8','2025-05-30',NULL,1,'2025-05-30 23:50:33','2025-05-30 23:50:34','/uploads/events/event-1748649034103-820877768.jpg'),
(9,'Thursday 8-Ball - Summer 2025','Weekly Thursday 8-Ball league night for Summer 2025 season','Thursday','19:00:00','23:00:00','8','2025-06-12','2025-08-14',1,'2025-06-05 22:38:40','2025-06-05 22:49:16',NULL),
(10,'Friday 10-Ball','Weekly tournament that happens every Friday.  $200 added each week, Fargo handicapped (see poster), BCA ruleset, Winner breaks. ','Friday','19:00:00','02:00:00','14-23','2025-06-06',NULL,1,'2025-06-06 01:20:22','2025-06-06 01:20:22','/uploads/events/event-1749172822660-454693810.jpg'),
(11,'Sunday 9-Ball Tournament','Weekly tournament that happens every Sunday.  $200 added each week, entry fee fargo handicapped (see poster), BCA ruleset, alternate breaks. ','Sunday','14:00:00','00:00:00','14-23','2025-06-06',NULL,1,'2025-06-06 01:23:39','2025-06-06 01:25:53','/uploads/events/event-1749173019272-337889070.jpg'),
(12,'Tuna sandwich - Summer 2025','Weekly Tuna sandwich league night for Summer 2025 season','Tuesday','19:00:00','23:00:00','7','2025-06-10','2025-06-24',1,'2025-06-06 01:32:07','2025-06-06 01:32:07',NULL);
/*!40000 ALTER TABLE `RecurringEventPatterns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SeasonalEvent`
--

DROP TABLE IF EXISTS `SeasonalEvent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `SeasonalEvent` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_capacity` int(11) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `idx_seasonal_event_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SeasonalEvent`
--

LOCK TABLES `SeasonalEvent` WRITE;
/*!40000 ALTER TABLE `SeasonalEvent` DISABLE KEYS */;
/*!40000 ALTER TABLE `SeasonalEvent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ShopCategories`
--

DROP TABLE IF EXISTS `ShopCategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ShopCategories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `image_path` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_shop_categories_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ShopCategories`
--

LOCK TABLES `ShopCategories` WRITE;
/*!40000 ALTER TABLE `ShopCategories` DISABLE KEYS */;
INSERT INTO `ShopCategories` VALUES
(1,'cues','Pool Cues','Professional and recreational pool cues',1,NULL,1,'2025-06-03 23:44:36','2025-06-06 04:04:29'),
(2,'accessories','Accessories','Chalk, tips, cases, and other accessories',2,NULL,1,'2025-06-03 23:44:36','2025-06-03 23:44:36'),
(3,'tables','Tables & Equipment','Pool tables, racks, and table equipment',3,NULL,1,'2025-06-03 23:44:36','2025-06-03 23:44:36'),
(4,'apparel','Apparel','Clothing and branded merchandise',4,NULL,1,'2025-06-03 23:44:36','2025-06-03 23:44:36'),
(5,'maintenance','Maintenance','Cleaning and maintenance supplies',5,NULL,1,'2025-06-03 23:44:36','2025-06-03 23:44:36');
/*!40000 ALTER TABLE `ShopCategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ShopItems`
--

DROP TABLE IF EXISTS `ShopItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ShopItems` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `additional_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_images`)),
  `status` enum('active','inactive','out_of_stock') DEFAULT 'active',
  `stock_quantity` int(11) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`item_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_featured` (`featured`),
  KEY `idx_name` (`name`),
  KEY `idx_shop_items_price` (`price`),
  KEY `idx_shop_items_created` (`created_at`),
  CONSTRAINT `ShopItems_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `ShopCategories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ShopItems`
--

LOCK TABLES `ShopItems` WRITE;
/*!40000 ALTER TABLE `ShopItems` DISABLE KEYS */;
INSERT INTO `ShopItems` VALUES
(1,'Professional Pool Cue - Maple','High-quality maple pool cue with leather wrap and brass joints. Perfect weight and balance for serious players.','Professional maple cue with leather wrap',299.99,1,NULL,NULL,'active',5,1,'2025-06-03 23:44:37','2025-06-03 23:44:37'),
(2,'Premium Chalk - Blue','Tournament-grade billiard chalk for optimal cue tip grip. Box of 12 pieces.','Tournament-grade blue chalk (12 pieces)',8.99,2,NULL,NULL,'active',25,0,'2025-06-03 23:44:37','2025-06-03 23:44:37'),
(3,'Leather Cue Case','Genuine leather cue case with velvet lining. Holds 2 cues and has accessory compartments.','Leather case for 2 cues with accessories',89.99,2,NULL,NULL,'active',8,1,'2025-06-03 23:44:37','2025-06-06 00:19:10'),
(4,'Pool Table Cover','Heavy-duty vinyl pool table cover. Protects your table from dust and damage.','Heavy-duty vinyl table cover',49.99,3,NULL,NULL,'active',3,0,'2025-06-03 23:44:37','2025-06-03 23:44:37'),
(5,'Leather Pocket T-Shirt','Comfortable cotton t-shirt with Leather Pocket logo. Available in multiple sizes.','Cotton t-shirt with logo',24.99,4,NULL,NULL,'active',15,0,'2025-06-03 23:44:37','2025-06-03 23:44:37'),
(6,'test','this is a bigger test of the other test','this is a test',200.00,1,'/uploads/shop/shop-1748997984430-684808673.jpg',NULL,'active',200,1,'2025-06-04 00:21:36','2025-06-04 00:46:24');
/*!40000 ALTER TABLE `ShopItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TablePricing`
--

DROP TABLE IF EXISTS `TablePricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TablePricing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tableType` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TablePricing`
--

LOCK TABLES `TablePricing` WRITE;
/*!40000 ALTER TABLE `TablePricing` DISABLE KEYS */;
INSERT INTO `TablePricing` VALUES
(1,'7ft Valley Tables',12.00,'2025-05-23 02:35:02','2025-05-23 02:35:02'),
(2,'7ft Diamond Tables',13.00,'2025-05-23 02:35:02','2025-05-23 02:35:02'),
(3,'9ft Diamond Tables',14.00,'2025-05-23 02:35:02','2025-05-23 02:35:02');
/*!40000 ALTER TABLE `TablePricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `TablePricing_View`
--

DROP TABLE IF EXISTS `TablePricing_View`;
/*!50001 DROP VIEW IF EXISTS `TablePricing_View`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `TablePricing_View` AS SELECT
 1 AS `id`,
  1 AS `tableType`,
  1 AS `price`,
  1 AS `created_at`,
  1 AS `updated_at` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `TableTypes`
--

DROP TABLE IF EXISTS `TableTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TableTypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) NOT NULL,
  `table_description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `table_count` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `table_name` (`table_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TableTypes`
--

LOCK TABLES `TableTypes` WRITE;
/*!40000 ALTER TABLE `TableTypes` DISABLE KEYS */;
INSERT INTO `TableTypes` VALUES
(1,'7ft Valley Tables','Pool table type: 7ft Valley Tables',1,1,'2025-06-06 09:20:53','2025-06-06 09:41:14',2),
(2,'7ft Diamond Tables','Pool table type: 7ft Diamond Tables',1,2,'2025-06-06 09:20:53','2025-06-06 09:38:09',8),
(3,'9ft Diamond Tables','Pool table type: 9ft Diamond Tables',1,3,'2025-06-06 09:20:53','2025-06-06 09:38:12',8),
(4,'Snooker Table','Snooker Table',1,0,'2025-06-06 09:23:52','2025-06-06 09:41:00',1);
/*!40000 ALTER TABLE `TableTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Team`
--

DROP TABLE IF EXISTS `Team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Team` (
  `team_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `captain_name` varchar(100) DEFAULT NULL,
  `captain_email` varchar(255) DEFAULT NULL,
  `accepting_new_players` tinyint(1) DEFAULT 1,
  `password_hash` varchar(255) DEFAULT NULL,
  `reset_token_hash` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  `deactivation_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `unique_captain_email` (`captain_email`),
  KEY `idx_team_captain_email` (`captain_email`),
  KEY `idx_team_email` (`captain_email`),
  KEY `idx_team_reset_token` (`reset_token_hash`),
  KEY `idx_team_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Team`
--

LOCK TABLES `Team` WRITE;
/*!40000 ALTER TABLE `Team` DISABLE KEYS */;
INSERT INTO `Team` VALUES
(8,'HotShots',NULL,'starwarfare817@gmail.com',1,'5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',NULL,NULL,1,NULL,NULL),
(9,'Hotshot Shooters',NULL,'Ethan.McCorquodale@gmail.com',0,'e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23bd38ec221a',NULL,NULL,1,NULL,NULL);
/*!40000 ALTER TABLE `Team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TeamLeagueRegistration`
--

DROP TABLE IF EXISTS `TeamLeagueRegistration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TeamLeagueRegistration` (
  `registration_id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `league_id` int(11) NOT NULL,
  `registration_date` date NOT NULL,
  `deposit_paid` tinyint(1) DEFAULT 0,
  `registration_status` enum('tentative','confirmed','cancelled') DEFAULT 'tentative',
  `payment_date` date DEFAULT NULL,
  `season_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`registration_id`),
  KEY `team_id` (`team_id`),
  KEY `league_id` (`league_id`),
  KEY `idx_team_registration_status` (`registration_status`),
  KEY `idx_registration_season` (`season_id`),
  KEY `idx_registration_active` (`is_active`),
  CONSTRAINT `TeamLeagueRegistration_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`),
  CONSTRAINT `TeamLeagueRegistration_ibfk_2` FOREIGN KEY (`league_id`) REFERENCES `League` (`league_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TeamLeagueRegistration`
--

LOCK TABLES `TeamLeagueRegistration` WRITE;
/*!40000 ALTER TABLE `TeamLeagueRegistration` DISABLE KEYS */;
INSERT INTO `TeamLeagueRegistration` VALUES
(8,8,5,'2025-06-05',0,'tentative',NULL,NULL,1),
(9,9,5,'2025-06-05',0,'confirmed','2025-06-05',NULL,1);
/*!40000 ALTER TABLE `TeamLeagueRegistration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TeamPlayer`
--

DROP TABLE IF EXISTS `TeamPlayer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TeamPlayer` (
  `team_id` int(11) NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `join_date` date NOT NULL,
  PRIMARY KEY (`team_id`,`player_name`),
  CONSTRAINT `TeamPlayer_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TeamPlayer`
--

LOCK TABLES `TeamPlayer` WRITE;
/*!40000 ALTER TABLE `TeamPlayer` DISABLE KEYS */;
INSERT INTO `TeamPlayer` VALUES
(8,'Ethan McC',NULL,'2025-06-05'),
(9,'Ethan McCorquodale',NULL,'2025-06-05');
/*!40000 ALTER TABLE `TeamPlayer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tournament`
--

DROP TABLE IF EXISTS `Tournament`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tournament` (
  `tournament_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `entry_fee` decimal(10,2) DEFAULT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `tables_reserved` int(11) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tournament`
--

LOCK TABLES `Tournament` WRITE;
/*!40000 ALTER TABLE `Tournament` DISABLE KEYS */;
/*!40000 ALTER TABLE `Tournament` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TournamentSchedule`
--

DROP TABLE IF EXISTS `TournamentSchedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TournamentSchedule` (
  `schedule_id` int(11) NOT NULL AUTO_INCREMENT,
  `tournament_id` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `tournament_id` (`tournament_id`),
  KEY `idx_tournament_date` (`event_date`),
  CONSTRAINT `TournamentSchedule_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TournamentSchedule`
--

LOCK TABLES `TournamentSchedule` WRITE;
/*!40000 ALTER TABLE `TournamentSchedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `TournamentSchedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `DealPricing_View`
--

/*!50001 DROP VIEW IF EXISTS `DealPricing_View`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`billiards_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `DealPricing_View` AS select `pr`.`id` AS `id`,`tt`.`table_name` AS `tableType`,`pr`.`price` AS `price`,`pr`.`created_at` AS `created_at`,`pr`.`updated_at` AS `updated_at` from (`PricingRates` `pr` join `TableTypes` `tt` on(`pr`.`table_type_id` = `tt`.`id`)) where `pr`.`pricing_type` = 'deal' and `pr`.`is_active` = 1 and `tt`.`is_active` = 1 order by `tt`.`sort_order` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `TablePricing_View`
--

/*!50001 DROP VIEW IF EXISTS `TablePricing_View`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`billiards_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `TablePricing_View` AS select `pr`.`id` AS `id`,`tt`.`table_name` AS `tableType`,`pr`.`price` AS `price`,`pr`.`created_at` AS `created_at`,`pr`.`updated_at` AS `updated_at` from (`PricingRates` `pr` join `TableTypes` `tt` on(`pr`.`table_type_id` = `tt`.`id`)) where `pr`.`pricing_type` = 'regular' and `pr`.`is_active` = 1 and `tt`.`is_active` = 1 order by `tt`.`sort_order` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-06  4:26:33
