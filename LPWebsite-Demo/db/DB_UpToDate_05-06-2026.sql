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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
INSERT INTO `Admin` VALUES
(1,'LPManager','$2b$10$lqKN7uOYCeYN.GscheYVOe71NT1YGhBJGcXv75FCg/NBGUX8RTj2K');
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Announcements`
--

LOCK TABLES `Announcements` WRITE;
/*!40000 ALTER TABLE `Announcements` DISABLE KEYS */;
INSERT INTO `Announcements` VALUES
(14,'Leather Pocket Fall Classic Bracket Link','Link to bracket on digital pool: https://digitalpool.com/tournaments/fall-classic-10-ball-2025',NULL,'2025-12-08',1,0,'2025-12-06 04:08:41','2025-12-06 04:08:41'),
(15,'Friday 10-Ball Tournament Bracket','Link To Bracket:\nhttps://digitalpool.com/tournaments/friday-night-10-ball-tournament-dec-12th-2025/overview',NULL,'2025-12-14',1,0,'2025-12-13 02:05:06','2025-12-13 02:14:41'),
(16,'Weekly Friday10-Ball Bracket','link to the digital pool bracket: https://digitalpool.com/tournaments/leather-pocket-friday-10-ball-dec-19th-2025/bracket',NULL,'2025-12-20',1,0,'2025-12-20 01:40:37','2025-12-20 01:40:37'),
(17,'Saturday 8-ball Bracket','link to digital pool bracket: https://digitalpool.com/tournaments/saturday-8-ball-tournament-dec-20th-2025/bracket',NULL,'2025-12-21',1,0,'2025-12-20 21:14:46','2025-12-20 21:14:46'),
(18,'Bracket to Saturday Tournament','Link to digital pool bracket: https://digitalpool.com/tournaments/saturday-8-ball-tournament-dec-27-2025',NULL,'2025-12-28',1,0,'2025-12-27 21:01:41','2025-12-27 21:01:41'),
(19,'Friday 10-ball Bracket','bracket on digital pool: https://digitalpool.com/tournaments/friday-night-10-ball-tournament-jan-2-2026',NULL,'2026-01-03',1,0,'2026-01-03 02:17:27','2026-01-03 02:17:27'),
(20,'Saturday 8-Ball Bracket','Link to bracket on digital pool: https://digitalpool.com/tournaments/saturday-8-ball-tournament-jan-3rd-2026',NULL,'2026-01-04',1,0,'2026-01-03 20:59:33','2026-01-03 20:59:33'),
(21,'Leather Pocket Saturday Bracket','link to bracket on digital pool: https://digitalpool.com/tournaments/saturday-8-ball-tournament-jan-10th-2026',NULL,'2026-01-11',1,0,'2026-01-10 22:02:31','2026-01-10 22:02:31'),
(24,'Friday 10-Ball Tournament Bracket Link','Link to bracket on digital pool: https://digitalpool.com/tournaments/leather-pocket-friday-10-ball-feb-6th-2026',NULL,'2026-02-07',1,0,'2026-02-07 01:52:40','2026-02-07 01:52:40'),
(25,'Leather Pocket Saturday Bracket Link ','Link to digital pool bracket: https://digitalpool.com/tournaments/saturday-8-ball-tournament-feb-7th-2026',NULL,'2026-02-08',1,0,'2026-02-07 20:41:06','2026-02-07 20:41:06'),
(26,'Friday the 13th 10-Ball Tournament Bracket: ','link to the bracket on digital pool: https://digitalpool.com/tournaments/leather-pocket-friday-10-ball-feb-13-2026',NULL,'2026-02-17',1,0,'2026-02-14 01:39:18','2026-02-14 01:39:18'),
(27,'Bracket Link to 8-Ball tournament','link to the bracket: https://digitalpool.com/tournaments/saturday-8-ball-tournament-feb-14th-2026',NULL,'2026-02-15',1,0,'2026-02-14 20:58:52','2026-02-14 20:58:52'),
(28,'Friday 10-Ball Bracket Link','link to the bracket on digital pool: https://digitalpool.com/tournaments/leather-pocket-friday-10-ball-feb-27-2026',NULL,'2026-03-01',1,0,'2026-02-28 01:46:27','2026-02-28 01:46:27'),
(29,'Bracket to 8-Ball','https://digitalpool.com/tournaments/saturday-8-ball-tournament-feb-28th-2026',NULL,'2026-03-01',1,0,'2026-02-28 21:00:11','2026-02-28 21:00:11'),
(30,'10-Ball Bracket Link','https://digitalpool.com/tournaments/leather-pocket-friday-10-ball-tournament-mar-13-2026 ',NULL,'2026-03-14',1,0,'2026-03-14 00:35:50','2026-03-14 00:35:50'),
(31,'8-Ball Bracket Link','https://digitalpool.com/tournaments/leather-pocket-saturday-8-ball-tournament-mar-14th-2026',NULL,'2026-03-15',1,0,'2026-03-14 20:26:19','2026-03-14 20:26:33'),
(32,'10-Ball Bracket Link','https://digitalpool.com/tournaments/leather-pocket-friday-10-ball-mar-27-2026',NULL,'2026-04-01',1,0,'2026-03-28 00:46:35','2026-03-28 00:46:35'),
(33,'10-Ball Bracket link','bracket link to weekly tournament: https://digitalpool.com/tournaments/leather-pocket-friday-10-ball-apr-3-2026',NULL,'2026-04-05',1,0,'2026-04-04 00:18:47','2026-04-04 00:18:47');
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
(1,'business_name','Leather Pocket','text','Business Name','general','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(2,'phone_number','403-289-6408','phone','Phone Number','contact','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(3,'email_address','len@leatherpocket.ca','email','Contact Email','contact','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(4,'address_line1','3715B Edmonton Trail NE','text','Address Line 1','contact','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(5,'address_line2','Calgary, AB, T2E 3P3','text','Address Line 2','contact','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(6,'hours_description','7 days a week (11AM to 2AM)\n365 days a year\nIncluding every holiday','textarea','Operating Hours','general','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(7,'table_count_7ft_diamond','8','number','7-foot Diamond Tables','tables','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(8,'table_count_7ft_valley','2','number','7-foot Valley Tables','tables','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(9,'table_count_9ft_diamond','10','number','9-foot Diamond Tables','tables','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(10,'social_facebook','@LeatherPocket','text','Facebook Handle','social','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(11,'social_instagram','@LeatherPocket','text','Instagram Handle','social','2025-06-06 05:04:13','2025-11-15 18:47:16'),
(12,'google_maps_embed','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2506.2353179953684!2d-114.05533332340514!3d51.08566457172042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5371650b59d10d93%3A0xf13e461150efea6a!2s3715%20Edmonton%20Trl%2C%20Calgary%2C%20AB%20T2E%203P4!5e0!3m2!1sen!2sca!4v1733561185119!5m2!1sen!2sca','textarea','Google Maps Embed URL','general','2025-06-06 05:04:13','2025-11-15 18:47:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ContactRequest`
--

LOCK TABLES `ContactRequest` WRITE;
/*!40000 ALTER TABLE `ContactRequest` DISABLE KEYS */;
INSERT INTO `ContactRequest` VALUES
(2,12,'Ethan','eth@test.ca','This is a test','pending','2025-09-04 19:45:01','2025-09-04 19:45:01'),
(4,14,'John','JohnsEmail@gmail.com','I\'d like to join your team','pending','2025-09-04 20:59:27','2025-09-04 20:59:27');
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
  `event_type` enum('league','tournament','other') DEFAULT 'other',
  PRIMARY KEY (`event_id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_recurring_pattern` (`recurring_pattern_id`),
  KEY `idx_events_date` (`event_date`),
  KEY `idx_events_recurring` (`is_recurring`),
  KEY `idx_events_type` (`event_type`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`recurring_pattern_id`) REFERENCES `RecurringEventPatterns` (`pattern_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES
(1,'New Year Special Tournament','Special tournament to celebrate the new year','2024-01-01','14:00:00','18:00:00','All Tables',0,NULL,'2025-05-27 00:43:27','2025-06-14 01:07:27',NULL,'tournament'),
(2,'Pool Party Night','Casual pool night with music and drinks','2024-01-15','20:00:00','24:00:00','Tables 7-10',0,NULL,'2025-05-27 00:43:27','2025-05-27 00:43:27',NULL,'other'),
(27,'Leather Pocket 510 and under 9-ball','Short description','2025-09-06','14:00:00','18:53:00','14-23',0,NULL,'2025-09-04 20:49:20','2025-09-04 20:49:20',NULL,'tournament'),
(31,'Leather Pocket Fall Classic','Link to bracket on digital pool: https://digitalpool.com/tournaments/fall-classic-10-ball-2025','2025-12-05','18:30:00','00:00:00','14-23',0,NULL,'2025-11-16 00:17:45','2025-12-06 04:09:39','/uploads/events/event-1763252266405-126414957.jpg','tournament'),
(32,'Leather Pocket Fall Classic','Link to bracket on digital pool: https://digitalpool.com/tournaments/fall-classic-10-ball-2025','2025-12-06','10:00:00','00:00:00','All 9ft tables',0,NULL,'2025-11-16 05:01:54','2025-12-06 04:09:42','/uploads/events/event-1763269316067-206245647.jpg','tournament'),
(33,'Leather Pocket Fall Classic','Link to bracket on digital pool: https://digitalpool.com/tournaments/fall-classic-10-ball-2025','2025-12-07','10:00:00','00:00:00','All 9ft tables',0,NULL,'2025-11-16 05:04:02','2025-12-06 04:09:46','/uploads/events/event-1763269443483-901562327.jpg','tournament'),
(34,'Leather Pocket 3rd Annual 520 And Under 8-Ball','Players meeting begins at 6:00 play begins at 7:30 see poster for further details. ','2025-11-21','18:00:00','00:00:00','All 7ft Tables',0,NULL,'2025-11-16 05:18:18','2025-11-16 05:18:18','/uploads/events/event-1763270298949-535259436.jpg','tournament'),
(35,'Leather Pocket 3rd Annual 520 And Under 8-Ball','Posted start/end times are approximate, always consult the tournament director before leaving.','2025-11-23','09:00:00','00:00:00','All 7ft Tables',0,NULL,'2025-11-16 05:26:06','2025-11-22 05:35:55','/uploads/events/event-1763270767632-844065745.jpg','tournament'),
(36,'Leather Pocket Barbox Bonanza ','Come check out our boxing day event and get $6 fireball and Jäger shots.  See poster for more information about tournament.','2025-12-26','14:00:00','00:00:00','1-8',0,NULL,'2025-12-20 05:28:37','2025-12-20 05:28:38','/uploads/events/event-1766208518314-822470670.jpg','tournament'),
(37,'Leather Pocket U578','See Poster for more details, see poster for start/end times.  Always consult the TD before leaving posted times are guidelines only.','2026-01-16','17:30:00','02:00:00','1-8',0,NULL,'2026-01-13 20:18:58','2026-01-13 20:18:58','/uploads/events/event-1768335538715-164173735.jpg','tournament'),
(38,'Leather Pocket U578','See Poster for more details, see poster for start/end times.  Always consult the TD before leaving posted times are guidelines only.','2026-01-17','11:00:00','00:00:00','1-8',0,NULL,'2026-01-13 20:21:16','2026-01-13 20:21:16','/uploads/events/event-1768335676500-250934917.jpg','tournament'),
(39,'Leather Pocket U578','See Poster for more details, see poster for start/end times.  Always consult the TD before leaving posted times are guidelines only.','2026-01-18','11:00:00','00:00:00','1-8',0,NULL,'2026-01-13 20:22:48','2026-01-13 20:22:49','/uploads/events/event-1768335768993-444236649.jpg','tournament'),
(40,'BigWigs  590 and Under LP Qualifier','See poster for more information.  End time is approximate.','2026-01-31','12:00:00','01:59:00','14-23',0,NULL,'2026-01-27 20:15:58','2026-01-27 20:15:58','/uploads/events/event-1769544958928-720079605.jpg','tournament'),
(42,'Wednesday Night 7ft 8-Ball League - 3 Player Teams @1800 Fargo Cap - Wednesday Summer 1800 Playoffs Begin','Wednesday Summer 1800 playoffs begin for Wednesday Night 7ft 8-Ball League - 3 Player Teams @1800 Fargo Cap','2026-08-20','19:30:00','23:00:00','8',0,NULL,'2026-05-06 19:19:34','2026-05-06 19:19:34',NULL,'league');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
(5,'Leagues','Why can I only contact some teams?','Teams with the contact button available welcome new players contacting them about joining.  If there is no contact button then they do not want new players'),
(7,'Other','Do you allow minors at Leather Pocket?','Yes! They are allowed at any time.  We also host a junior pool school every Sunday that is led by Ben Francis.');
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
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Food`
--

LOCK TABLES `Food` WRITE;
/*!40000 ALTER TABLE `Food` DISABLE KEYS */;
INSERT INTO `Food` VALUES
(1,'Dry Ribs or Wings','Flavours: salt & pepper, hot, medium, honey hot, BBQ, honey garlic, lemon pepper, teriyaki, sweet chili served with carrots & celery',17.00,6,'large'),
(2,'Onion Rings','',9.00,6,'small'),
(3,'Fries','',7.00,6,'small'),
(4,'Yam Fries','with garlic aioli',9.00,6,'small'),
(5,'Poutine','',10.00,6,'small'),
(6,'Deep Fried Pickles/Mushrooms','',9.00,6,'small'),
(7,'Mozza Sticks','',9.00,6,'small'),
(8,'Spring Rolls Half Order','Half order of Spring Rolls, 6 pieces.',11.00,6,'small'),
(9,'Spring Rolls Full','Full order of Spring Rolls, 12 pieces,',19.00,6,'small'),
(10,'Chicken Fingers','with fries',16.00,1,'small'),
(11,'Taco in a Bowl','doritos, lettuce, tomatoes, cheese, sour cream, salsa & taco beef',14.00,6,'large'),
(12,'Nachos Half','half order - red onion, green pepper, tomatoes, cheese, sour cream, salsa, black olives & jalapeno',12.00,6,'large'),
(13,'Nachos Full','full order - red onion, green pepper, tomatoes, cheese, sour cream, salsa, black olives & jalapeno',18.00,6,'large'),
(14,'Ramen Soup','ramen, lettuce, carrots, onions, cucumber, celery, chicken or pork, sunny side up egg',14.00,6,'large'),
(15,'Share Platter','half portions of four fried favourites, carrots, celery, & a choice of 3 dips',25.00,6,'large'),
(16,'Veggie Platter','celery, carrots, cucumber, green pepper, cherry tomatoes & ranch',16.00,6,'large'),
(17,'Bacon Cheddar Burger','lettuce, tomatoes, onions, mayo & pickles',19.00,1,'large'),
(18,'Pocket Club','three slices of bread, turkey, ham, bacon, lettuce, mayo & tomatoes',18.00,1,'large'),
(19,'BBQ Chicken Burger','BBQ sauce, cheddar, lettuce, tomatoes, onion, mayo & pickles',18.00,1,'large'),
(20,'Pork Adobo','spicy pork bites with rice',14.00,1,'small'),
(21,'BLT Sandwich','BLT and side vegetables',15.00,1,'small'),
(22,'Tuna Sandwich','Tuna and side vegetables',15.00,1,'small'),
(23,'Grilled Ham & Cheese','grilled ham & cheese and side vegetables',15.00,1,'small'),
(24,'Pork Teriyaki Bowl',NULL,18.00,1,'small'),
(25,'Chicken Teriyaki Bowl',NULL,18.00,1,'small'),
(26,'Garden Salad','lettuce, tomatoes, onion, green pepper, cucumber & choice of dressing',10.00,2,'small'),
(27,'Caesar Salad','romaine lettuce, parmesan, bacon bits, croutons & caesar salad dressing',12.00,2,'small'),
(28,'Buffalo Chicken Wrap','chicken strips, hot sauce, ranch, lettuce, tomatoes & cheese',18.00,2,'large'),
(29,'Sweet Thai Chicken Wrap','chicken strips, sweet chili sauce, lettuce, tomatoes & cheese',18.00,2,'large'),
(30,'Chicken Caesar Wrap','chicken strips, lettuce, bacon bits, parmesan, & caesar dressing',18.00,2,'large'),
(31,'Two Eggs Any Style','hashbrowns, toast, bacon or sausage',14.00,7,'large'),
(32,'Filipino Breakfast','two eggs, rice, & sweet longanisa sausage',14.00,7,'large'),
(33,'Three Egg Omelette','hashbrowns, toast & two fillings',16.00,7,'large'),
(34,'Breakfast Bagel','bagel, one egg ham & cheese',9.00,7,'small'),
(35,'Bacon',NULL,2.00,3,'small'),
(36,'Cheese',NULL,2.00,3,'small'),
(37,'Sausage',NULL,2.00,3,'small'),
(38,'Taco Beef',NULL,3.00,3,'small'),
(39,'Egg',NULL,2.00,3,'small'),
(40,'Chicken Fingers','',3.00,3,'small'),
(41,'Extra Vegetables',NULL,2.00,3,'small'),
(42,'Hashbrowns',NULL,4.00,3,'small'),
(43,'Rice',NULL,4.00,3,'small'),
(44,'Extra Sauces',NULL,1.00,3,'small'),
(45,'Canned Pop',NULL,2.50,4,'small'),
(46,'Fountain with Refill',NULL,3.00,4,'small'),
(47,'Coffee/Tea/Hot Chocolate',NULL,2.75,4,'small'),
(48,'Fruit Juice',NULL,3.50,4,'small'),
(49,'Bottled Water',NULL,2.50,4,'small'),
(50,'Gatorade',NULL,5.25,4,'small'),
(51,'Coconut Water',NULL,5.00,4,'small'),
(52,'Red Bull',NULL,5.00,4,'small'),
(53,'Non Alch',NULL,5.25,4,'small'),
(54,'Perrier',NULL,3.00,4,'small'),
(55,'Dom. Beer',NULL,7.25,5,'small'),
(56,'Premium High Balls',NULL,8.00,5,'small'),
(57,'Tall Boy Cans',NULL,10.00,5,'small'),
(58,'Premium Beer',NULL,8.75,5,'small'),
(59,'Coolers',NULL,6.25,5,'small'),
(61,'Well High Ball',NULL,7.00,5,'small'),
(62,'Wine',NULL,7.50,5,'small');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HomeGallery`
--

LOCK TABLES `HomeGallery` WRITE;
/*!40000 ALTER TABLE `HomeGallery` DISABLE KEYS */;
INSERT INTO `HomeGallery` VALUES
(15,'gallery-1751941647129-517230604.jpg','alex.jpg','/uploads/gallery/gallery-1751941647129-517230604.jpg',2,1,'2025-07-08 02:27:27','2025-07-08 02:27:27'),
(16,'gallery-1751941652017-87030374.jpg','alexLP.jpg','/uploads/gallery/gallery-1751941652017-87030374.jpg',3,1,'2025-07-08 02:27:32','2025-07-08 02:27:32'),
(17,'gallery-1751941663640-151230300.jpg','hooey tournament.jpg','/uploads/gallery/gallery-1751941663640-151230300.jpg',4,1,'2025-07-08 02:27:43','2025-07-08 02:27:43'),
(18,'gallery-1751941677282-81301706.jpg','JuniorPoolSchool.jpg','/uploads/gallery/gallery-1751941677282-81301706.jpg',5,1,'2025-07-08 02:27:57','2025-07-08 02:27:57'),
(19,'gallery-1751941691297-604365666.jpg','9ftTables.jpg','/uploads/gallery/gallery-1751941691297-604365666.jpg',6,1,'2025-07-08 02:28:11','2025-07-08 02:28:11'),
(20,'gallery-1751941717906-947740375.jpg','LeaguePlayoffWinners.jpg','/uploads/gallery/gallery-1751941717906-947740375.jpg',7,1,'2025-07-08 02:28:37','2025-07-08 02:28:37'),
(21,'gallery-1751941732326-661317558.jpg','Funny image.jpg','/uploads/gallery/gallery-1751941732326-661317558.jpg',8,1,'2025-07-08 02:28:52','2025-07-08 02:28:52');
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
  `season` varchar(50) DEFAULT 'Fall/Winter',
  `active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`league_id`),
  KEY `idx_league_play_night` (`play_night`),
  KEY `idx_league_active` (`is_active`),
  KEY `idx_league_registration` (`registration_open`),
  KEY `idx_league_season_dates` (`season_start_date`,`season_end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `League`
--

LOCK TABLES `League` WRITE;
/*!40000 ALTER TABLE `League` DISABLE KEYS */;
INSERT INTO `League` VALUES
(5,'Wednesday Night 7ft 8-Ball League - 3 Player Teams @1800 Fargo Cap',NULL,16,NULL,'Wednesday','19:30:00',8,1,'Wednesday Summer 1800','2026-06-17','2026-08-19','2026-08-20',1800,1,1,'2026-05-06 19:19:34','2026-05-06 19:19:34','Fall/Winter',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LeagueSeasonEvents`
--

LOCK TABLES `LeagueSeasonEvents` WRITE;
/*!40000 ALTER TABLE `LeagueSeasonEvents` DISABLE KEYS */;
INSERT INTO `LeagueSeasonEvents` VALUES
(24,5,'season_start',NULL,22,'2026-05-06 19:19:34'),
(25,5,'playoff_start',42,NULL,'2026-05-06 19:19:34');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MenuCategories`
--

LOCK TABLES `MenuCategories` WRITE;
/*!40000 ALTER TABLE `MenuCategories` DISABLE KEYS */;
INSERT INTO `MenuCategories` VALUES
(1,'MainWithFries','Main with Fries',0,1,'2025-06-13 02:05:11','2025-11-14 21:54:54',NULL,'none'),
(2,'SaladWraps','Salads & Wraps',1,1,'2025-06-13 02:05:11','2025-06-14 05:39:41',NULL,'none'),
(3,'AddOns','Add Ons',7,1,'2025-06-13 02:05:11','2025-06-13 02:05:11',NULL,'none'),
(4,'Beverages','Beverages',8,1,'2025-06-13 02:05:11','2025-06-13 02:05:11',NULL,'none'),
(5,'Liquor','Liquor',9,1,'2025-06-13 02:05:11','2025-06-13 02:05:11',NULL,'none'),
(6,'Appetizers','Appetizers',2,1,'2025-06-14 05:13:14','2025-07-08 02:30:04',NULL,'none'),
(7,'allDayBreakfast','Lenny\'s All Day Breakfast',3,1,'2025-06-14 05:55:45','2025-06-14 05:55:45',NULL,'none');
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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PlayerFinder`
--

LOCK TABLES `PlayerFinder` WRITE;
/*!40000 ALTER TABLE `PlayerFinder` DISABLE KEYS */;
INSERT INTO `PlayerFinder` VALUES
(1,'Melinda Showfield','melinda@melinda.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I like to shoot balls into a pocket','[\"Monday\",\"Friday\"]','Advanced','2024-12-08 09:19:37',0,NULL,NULL),
(2,'Jenny Face','face@hand.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I have hands. Also a face... maybe.','[\"Tuesday\",\"Wednesday\",\"Thursday\"]','Professional','2024-12-08 09:20:22',0,NULL,NULL),
(3,'Ludwig Von Beethoven','classical@music.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I am dead.','[\"Monday\",\"Thursday\",\"Friday\"]','Beginner','2024-12-08 09:21:13',0,NULL,NULL),
(4,'Ronald Mcdonald','ronald@mcdonald.com','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','I like burgers.','[\"Thursday\",\"Tuesday\"]','Intermediate','2024-12-08 09:21:50',0,NULL,NULL),
(5,'John Smith','john@smith.ca','15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225','Pool is pretty fun.','[\"Monday\"]','Beginner','2024-12-08 09:22:24',0,NULL,NULL),
(6,'Ethan McCorquodale','ethan.mccorquodale@gmail.com','c2a3134ea69eeec1689bf809385f9de47dcafc8484896df10cbaefeb61eeb960','I play pool','[\"Thursday\"]','Intermediate','2025-06-05 08:14:25',0,NULL,NULL),
(7,'Zack ZoBell','zack@zobell.com','f5f5c11d5e703915b9fe46d8732ddbc3221556cf33b557b1cd6d56a6ca7e36aa','You know me.','[\"Tuesday\",\"Wednesday\"]','Intermediate','2025-06-06 21:35:35',0,NULL,NULL),
(8,'Nathaniel Arnold-Forster','n.arnold-forster@shaw.ca','5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8','Im a changed man','[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\"]','Professional','2025-06-06 23:32:42',0,NULL,NULL),
(9,'John','John@test.ca','5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8','I like to play pool','[\"Monday\",\"Tuesday\"]','Beginner','2025-09-04 21:04:11',0,NULL,NULL),
(10,'Vince Miclat','vmiclat@telus.net','9ad27f6c79a1199c997ab8a5f36234abe2c9f64128007ef74b327951ab43ebe1',NULL,'[\"Wednesday\"]','Intermediate','2025-12-11 01:18:12',1,NULL,NULL),
(11,'Aamir Riaz','aamir74@gmail.com','cd1f58567c4595228e815281330643c55a527b23dc7a61339e37576ea20038b9',NULL,'[\"Monday\",\"Wednesday\"]','Intermediate','2025-12-16 21:37:15',1,NULL,NULL),
(12,'Sarkheel Rahman','sarkheelrahman@gmail.com','2f6622c85229a00579415eed5c1f6798ae1c9493ed70270e365732c170d81099',NULL,'[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\"]','Intermediate','2025-12-20 10:13:23',1,NULL,NULL),
(13,'Gavin Reid','gav_in_van@hotmail.com','9fcdff7418579ca432027fc13cf2b06a65958e55b12413daeb820612f2b9c1fa','460 Fargo. Have recently moved to Calgary from Vancouver where I captained a team for 3 years. Am interested in joining a team and am also open to possibly captaining a team as I have done so in the past.','[\"Tuesday\",\"Monday\",\"Thursday\",\"Wednesday\"]','Intermediate','2025-12-26 04:29:00',1,NULL,NULL),
(14,'Bruce Bennett','bbenn1949@gmail.com','99572b65ab3fe490d8bc8bf5d2d172fcfff274f4f363a7e83611dfe4dadaa6aa','Just took up pool\nI’m a senior player\nAvailable to fill in if needed','[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\"]','Beginner','2025-12-29 20:26:04',1,NULL,NULL),
(15,'Christie','christieleeweaver@gmail.com','08f5293887d4f235b40ba07756dc22afe75ab856401b0b43758368d9161cc444','Been playing league for 20 years. ','[\"Wednesday\",\"Thursday\",\"Tuesday\"]','Intermediate','2026-01-03 18:42:33',1,NULL,NULL),
(16,'Jake','jacob.reynolds7778@gmail.com','9a83349d9b5ff59b6d046dfe189e3b8fb9f32f6e976c5d4c23c91fdc016a3379','+4 years casual play exp. Playing every week. Closer to intermediate but never played competative so beginner rank..\nlooking to advance the skills and have fun, maybe start doing turneys as well. Would like to join a chill team.\n\n','[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\"]','Beginner','2026-01-06 05:31:31',1,NULL,NULL),
(17,'Adam','adamrussoo@hotmail.com','913198e55864294b93e84146925c332b6235ff8ce1bd35d07b42cacbc6660b39','28 year old who just moved to the city from Vancouver. \nI work in tech and love to hike, ski and camp.','[\"Tuesday\"]','Intermediate','2026-01-17 01:19:55',1,NULL,NULL),
(18,'Brent','brentpatchin@gmail.com','14aa55b52b7cc2185a0df7e5f1f95fb7609905cabed748c8a68950f2553f2a74',NULL,'[\"Monday\",\"Tuesday\",\"Wednesday\",\"Friday\"]','Advanced','2026-01-20 13:23:40',1,NULL,NULL),
(19,'Jordan Swampy','jordanswampy@gmail.com','5bb3a2fb52eed8806ec4f13be67a2bd70280bad3989738ff5ce90f4003a79574','Would love to find a team to join eventually. I don’t play to often but I can play well.','[\"Tuesday\",\"Wednesday\",\"Monday\"]','Advanced','2026-02-04 00:28:28',1,NULL,NULL),
(20,'Lesa Ofosu Antwi','Lesa.Ogden.Bookkeeping@hotmail.com','c6aca497049e80b798fc32b74da73fb45892d52225c97468c00b0ca294d6a180','I have played in multiple pool leagues for about 10 years  in Vancouver and Vancouver Island. I have entered and played in some of the CCS and BCA tournaments in Canada and the US. I have just moved back to Calgary. I am registered and have played in WBCA, BCA and CCS sanctioned leagues. I am looking to join a team a couple nights a week. I am available Monday to Thursday. ','[\"Thursday\",\"Wednesday\",\"Tuesday\",\"Monday\"]','Intermediate','2026-02-19 17:46:11',1,NULL,NULL),
(21,'Jay','Juliankmaharaj@gmail.com','158b3b85951b8bcad6a181362470542734961d3ad8264113aa9349f108a60655',NULL,'[\"Friday\"]','Intermediate','2026-02-23 22:08:19',1,NULL,NULL),
(22,'Mitchell J Penny','pennycorp89@gmail.com','f33d34bbc4a9e5bc202f73565083f080d5677f0ae325cfda85b3308da30794b8','I play alot in the bar, I want to improve my skills.','[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\"]','Beginner','2026-02-28 14:10:14',1,NULL,NULL),
(23,'Greg Soltys','gregsoltys@gmail.com','2ff435c377529fe07e49d7a21dd39c915274051602c7c02d4fa677c8a9dc8a79','Love the game and enjoy playing anytime I get the chance.','[\"Tuesday\",\"Wednesday\",\"Thursday\"]','Intermediate','2026-03-08 17:12:11',1,NULL,NULL),
(24,'Peter Michael Nunes','pn070@outlook.com','b8b28919634694532e87c39e61a19d74fee730438de7e6c24198069d7644b05a',NULL,'[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\"]','Intermediate','2026-03-12 01:25:11',1,NULL,NULL),
(25,'Cory Lescarbeault','C.lescarbeault@gmail.com','b69c7ce1da89e859d5056c241d4fbe0e3a48dbb34055f0ee5d9b7fb09f23a2ee',NULL,'[\"Tuesday\",\"Thursday\"]','Beginner','2026-03-30 21:19:24',0,NULL,NULL),
(26,'Wesley Sherrard','wes.sherrard@gmail.com','8608684cf43636b760d93ca61f135ca07c1d8ea5e469116000d4de71ce95f66a','Beginner player looking to improve my skills and have a good time. ','[\"Monday\",\"Tuesday\",\"Wednesday\"]','Beginner','2026-04-02 02:35:30',1,NULL,NULL),
(27,'Rheace Evans','enderheace@gmail.com','95953789cfdbd9bcdd43421b15730ff3d6e535a5e492b3e25874b565bd2206ea','','[\"Monday\"]','Intermediate','2026-04-11 16:39:56',1,NULL,NULL),
(28,'Mike','Mike.jtaylor.403@gmail.com','e6db6377034630bd3e53141fecac71b454c798ae70921ae9d2d0a4d4131c9d10','35 years old. Single.\nBlue collar background. love the game, been playing recreationally for decades - looking to socialize and potentially\njoin a team for tournament play.','[\"Tuesday\",\"Wednesday\",\"Friday\",\"Thursday\"]','Advanced','2026-04-11 20:31:24',1,NULL,NULL),
(29,'Jorge Posada','jorgeposadaa17@gmail.com','bfe8fef0e9b1081cc1960a72eeaf4c86c063efae0d6710bd064caaa898591692','I\'m new in Calgary, I come from Colombia and I like to play pool and played amateur in my country','[\"Monday\",\"Tuesday\",\"Wednesday\",\"Thursday\",\"Friday\"]','Intermediate','2026-04-15 17:45:58',1,NULL,NULL),
(30,'Mike','lugossymike@gmail.com','2dd78ee3150914d6fdd710054e8532d16018b7dba4b762bdd952105827c41b73','Decent pool player, looking to join a league. ','[\"Monday\",\"Tuesday\",\"Thursday\",\"Wednesday\",\"Friday\"]','Intermediate','2026-04-17 17:22:45',1,NULL,NULL),
(31,'Shanne Schwartz','shanneschwartz@gmail.com','f1dd96dc1491ad2743081a0a4a874f1f782c478b899526d5ec6370b395505224','Played league for 10 years, then life happened and didn\'t pick up a cue for about 17 years. Played Winter league last 2 years. \n\nHave my moments of \"Nice\" shots but consistency is a problem I\'m trying to work on. ','[\"Monday\",\"Wednesday\"]','Intermediate','2026-04-18 16:48:22',1,NULL,NULL),
(32,'Gavin ','gfunkreid@gmail.com','9fcdff7418579ca432027fc13cf2b06a65958e55b12413daeb820612f2b9c1fa','I played league and was captain of a team for 6 years in Vancouver in Rollers League. Fargo is under 500. Have lots of availability. Am also lots of fun!','[\"Wednesday\",\"Thursday\",\"Tuesday\",\"Monday\"]','Intermediate','2026-04-21 22:29:57',1,NULL,NULL);
/*!40000 ALTER TABLE `PlayerFinder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Players`
--

DROP TABLE IF EXISTS `Players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Players` (
  `player_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `csr_rating` int(11) DEFAULT NULL,
  `role` varchar(10) DEFAULT '',
  `team_id` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`player_id`),
  KEY `idx_player_team` (`team_id`),
  KEY `idx_player_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Players`
--

LOCK TABLES `Players` WRITE;
/*!40000 ALTER TABLE `Players` DISABLE KEYS */;
/*!40000 ALTER TABLE `Players` ENABLE KEYS */;
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
(4,1,'regular',13.00,'hour',1,'2025-06-06 09:20:53','2025-09-04 20:54:18'),
(5,2,'regular',14.00,'hour',1,'2025-06-06 09:20:53','2025-09-04 20:54:18'),
(6,3,'regular',15.00,'hour',1,'2025-06-06 09:20:53','2025-09-04 20:54:18'),
(7,4,'deal',20.00,'person',0,'2025-06-06 09:23:55','2025-07-19 03:57:07'),
(8,4,'regular',15.00,'hour',0,'2025-06-06 09:24:04','2025-07-19 03:57:07');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RecurringEventExceptions`
--

LOCK TABLES `RecurringEventExceptions` WRITE;
/*!40000 ALTER TABLE `RecurringEventExceptions` DISABLE KEYS */;
INSERT INTO `RecurringEventExceptions` VALUES
(3,7,'2025-09-06','Event skipped by admin','2025-09-04 20:48:26'),
(4,10,'2025-12-05','Fall Classic','2025-11-16 05:07:22'),
(5,7,'2025-11-22','520 and under','2025-11-16 05:28:17'),
(6,10,'2025-11-21','520 and under','2025-11-20 19:49:57'),
(8,7,'2025-12-06','Fall classic','2025-12-03 06:06:55'),
(15,10,'2025-12-26','Barbox Bonanza','2025-12-20 05:29:00'),
(17,7,'2026-01-17','U578 Tournament','2026-01-13 20:13:14'),
(18,10,'2026-01-16','578 and under','2026-01-17 06:00:31');
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
  `event_type` enum('league','tournament','other') DEFAULT 'other',
  PRIMARY KEY (`pattern_id`),
  KEY `idx_day_of_week` (`day_of_week`),
  KEY `idx_active` (`is_active`),
  KEY `idx_patterns_day` (`day_of_week`),
  KEY `idx_patterns_active` (`is_active`),
  KEY `idx_recurring_patterns_type` (`event_type`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RecurringEventPatterns`
--

LOCK TABLES `RecurringEventPatterns` WRITE;
/*!40000 ALTER TABLE `RecurringEventPatterns` DISABLE KEYS */;
INSERT INTO `RecurringEventPatterns` VALUES
(7,'Saturday 8-Ball Tournament','This is a recurring tournament that happens every Saturday.  $200 added.  Fargo handicapped.  Unestablished Fargo will be determined by tournament director.','Saturday','14:00:00','00:00:00','1-8','2025-05-30',NULL,1,'2025-05-30 23:50:33','2025-12-03 18:23:23','/uploads/events/event-1750749574033-924220268.jpg','tournament'),
(10,'Friday 10-Ball Tournament','Weekly tournament that happens every Friday.  $200 added each week, Fargo handicapped (see poster), BCA ruleset, Winner breaks. ','Friday','19:00:00','02:00:00','14-23','2025-06-06',NULL,1,'2025-06-06 01:20:22','2025-06-24 07:18:43','/uploads/events/event-1750749522987-733581383.jpg','tournament'),
(11,'Sunday 9-Ball Tournament','Weekly tournament that happens every Sunday.  $200 added each week, entry fee fargo handicapped (see poster), BCA ruleset, alternate breaks. ','Sunday','14:00:00','00:00:00','14-23','2025-06-06',NULL,1,'2025-06-06 01:23:39','2025-06-24 07:19:46','/uploads/events/event-1750749586970-592166752.jpg','tournament'),
(19,'LP Junior School','Anyone under the age of 18 is welcome and only has to pay a $5 fee each week to attend.  Lessons are taught by Ben Francis, see poster for further details.','Sunday','11:00:00','12:00:00','1-8','2025-11-02','2026-03-29',1,'2025-11-16 05:11:54','2025-11-16 05:11:54','/uploads/events/event-1763269914827-973974725.jpg','other'),
(20,'Leather Pocket 3rd Annual 520 And Under 8-Ball','Posted start/end times are approximate, always consult the tournament director before leaving.','Saturday','09:00:00','00:00:00','1-8','2025-11-22','2025-11-22',1,'2025-11-16 05:26:31','2025-11-22 05:37:09','/uploads/events/event-1763270791730-815695942.jpg','tournament'),
(22,'Wednesday Night 7ft 8-Ball League - 3 Player Teams @1800 Fargo Cap - Wednesday Summer 1800','Weekly Wednesday Night 7ft 8-Ball League - 3 Player Teams @1800 Fargo Cap league night for Wednesday Summer 1800 season','Wednesday','19:30:00','23:00:00','8','2026-06-17','2026-08-19',1,'2026-05-06 19:19:34','2026-05-06 19:19:34',NULL,'league');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
(5,'maintenance','Maintenance','Cleaning and maintenance supplies',5,NULL,1,'2025-06-03 23:44:36','2025-06-03 23:44:36'),
(6,'Educational','Educational Resources','For things like books/movies and other media',0,NULL,1,'2025-09-19 19:22:50','2025-09-19 19:22:50'),
(7,'Pagulayan gear','Pagulayan Gear','Assorted Alex Pagulayan merch! ',1,'/uploads/shop/shop-1764274956983-237457997.jpeg',1,'2025-11-27 20:22:36','2025-11-27 20:32:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ShopItems`
--

LOCK TABLES `ShopItems` WRITE;
/*!40000 ALTER TABLE `ShopItems` DISABLE KEYS */;
INSERT INTO `ShopItems` VALUES
(10,'Vegas Dice','','6-sided dice ',0.00,2,'/uploads/shop/shop-1758063095094-371976598.JPG',NULL,'inactive',1,0,'2025-09-16 22:51:25','2025-11-15 02:13:21'),
(11,'Leather Chalk Holder','Will fit both Masters and Pagulayan chalk or other square chalk.','Chalk holder for square chalk.',10.00,2,'/uploads/shop/shop-1758063296252-200860790.JPG',NULL,'active',1,0,'2025-09-16 22:54:47','2025-09-16 22:54:56'),
(12,'Dufferin Key Chain','Key ring with the tip of a Dufferin shaft.','Key ring with the tip of a Dufferin shaft.',15.00,2,'/uploads/shop/shop-1758136007696-111586027.JPG',NULL,'active',1,0,'2025-09-17 19:06:36','2025-11-15 02:12:53'),
(13,'Tip Stik Chalk Holder','Chalk holder has a rod that will fit in your pocket and hang with the chalk outside.  This will avoid chalk residue building up in your pockets, or prevent your chalk falling into the table.','Chalk holder for square chalk.',24.00,2,'/uploads/shop/shop-1758136274234-344616230.JPG',NULL,'active',1,0,'2025-09-17 19:11:04','2025-09-17 19:11:14'),
(14,'Magnetic Chalk Holder Clip','This chalk holder will work with any chalk shape so long as the chalk has some metal that attracts magnets.','Clip attaches to waste band and keeps your chalk in place',0.00,2,'/uploads/shop/shop-1758136551551-921763740.JPG',NULL,'inactive',1,0,'2025-09-17 19:15:43','2025-11-15 02:15:42'),
(15,'Pink Tip Prik','When using this tool ensure you go straight down without twisting.  If you poke your tip with this tool and twist it can cause your tips glue to weaken and your tip could fall off.','a tip prick that will reduce the chances of your tip mushrooming.',26.00,2,'/uploads/shop/shop-1758136847121-704082016.JPG',NULL,'active',1,0,'2025-09-17 19:20:38','2025-09-17 19:22:50'),
(16,'Tip Shaper and Scuffer','Fixes tips that have lost their roundness and no longer hold chalk very well by roughing up the leather surface of the tip.','Used to shape your tip and allows chalk to apply easier.',20.00,2,'/uploads/shop/shop-1758137161086-763732387.JPG',NULL,'active',1,0,'2025-09-17 19:25:24','2025-09-17 19:26:01'),
(17,'Foldable Cue Holder','This cue holder is perfect if you don\'t want something too heavy or taking up too much space.  The arms of the cue holder fold up into a smaller rectangle body that will make it easy to transport in your pool case.  Designed by HP, Henry Pylvainen. ','Cue holder that sits on any tables edge to keep your cues safe.',35.00,2,'/uploads/shop/shop-1758137459929-675243003.JPG',NULL,'active',2,0,'2025-09-17 19:30:45','2025-11-27 20:33:52'),
(18,'Square Kamui Chalk','','Square chalk that is made by Kamui',25.00,2,'/uploads/shop/shop-1758137655421-301554934.JPG',NULL,'active',4,0,'2025-09-17 19:34:06','2026-01-29 20:28:06'),
(19,'Cue tip shaper','Not only will this tool shape your tip effectively it will also allow you to check if your tip is getting to flat with the cut out edge.','Used to shape your cues tip to a dimes radius.',15.00,2,'/uploads/shop/shop-1758137791796-949858555.JPG',NULL,'active',1,0,'2025-09-17 19:36:20','2025-09-17 19:36:31'),
(20,'Shaft Burnisher','A leather pad that will remove and residue on your cues shaft.','Use to clean/polish your cue shaft',10.00,2,'/uploads/shop/shop-1758137937048-786112960.JPG',NULL,'active',1,0,'2025-09-17 19:38:47','2025-09-17 19:38:57'),
(22,'Pool Table Brush','Brush has flared edges which will allow you to clean under and around the rails.','Used to brush away dirt/chalk buildup on the table.',15.00,5,'/uploads/shop/shop-1758309016213-773994312.JPG',NULL,'active',2,0,'2025-09-19 19:10:05','2025-09-19 19:13:50'),
(23,'Stefano Pelinga - Ultimate Trickshots Vol 2','','A collection of trick shots from Stefano Pelinga.',35.00,6,'/uploads/shop/shop-1758309674173-584780543.JPG',NULL,'active',1,0,'2025-09-19 19:21:02','2025-09-19 19:23:04'),
(24,'Stefano Pelinga - Ultimate Trick Shots Vol 1','','A collection of trickshots from Stefano Pelinga',35.00,6,'/uploads/shop/shop-1758309870966-686732410.JPG',NULL,'active',1,0,'2025-09-19 19:24:18','2025-09-19 19:24:30'),
(25,'Crayola - White Chalk','','White sticks of chalk, not intended for chalking cues.',4.50,2,'/uploads/shop/shop-1758310464984-709183760.JPG',NULL,'active',5,0,'2025-09-19 19:34:19','2025-09-19 19:34:24'),
(26,'Bridge Rest','','Attached to shaft of house cue or older cue to provide a bridge for longer shots',5.00,2,'/uploads/shop/shop-1758311339469-632540552.JPG',NULL,'active',27,0,'2025-09-19 19:48:49','2025-12-20 05:37:01'),
(27,'Gloves','','Gloves all sizes for lefties or righties ',39.50,7,NULL,NULL,'active',50,0,'2025-11-27 20:24:26','2025-11-27 20:24:26'),
(28,'Toque','','Stay warm this winter in your new Pagulayan toque. Who’s knows winter better than a fellow Canadian ',34.50,7,NULL,NULL,'active',10,0,'2025-11-27 20:25:58','2025-11-27 20:25:58'),
(29,'Hats','','Assorted ball caps ',39.50,7,NULL,NULL,'active',20,0,'2025-11-27 20:27:06','2025-11-27 20:27:06'),
(30,'Tee Shirts','','Assortment of Alex branded tees!',54.00,7,NULL,NULL,'active',30,0,'2025-11-27 20:28:16','2025-11-27 20:28:16'),
(31,'Pagulayan Chalk','','Blue or green available.  Listed price is per piece.',33.00,7,'/uploads/shop/shop-1764275392263-102552677.jpeg',NULL,'active',50,1,'2025-11-27 20:29:51','2025-12-22 00:16:17');
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
(3,'9ft Diamond Tables','Pool table type: 9ft Diamond Tables',1,3,'2025-06-06 09:20:53','2025-11-15 02:11:18',10),
(4,'Snooker Table','Snooker Table',0,0,'2025-06-06 09:23:52','2025-07-19 03:57:07',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Team`
--

LOCK TABLES `Team` WRITE;
/*!40000 ALTER TABLE `Team` DISABLE KEYS */;
INSERT INTO `Team` VALUES
(1,'Bannock Dawgs',NULL,'NAN1@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(2,'Fear and Loathing',NULL,'NAN2@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(3,'Guilty Pleasure',NULL,'NAN3@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(4,'Hidden Agenda',NULL,'NAN4@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(5,'Lucky Breaks',NULL,'NAN5@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(6,'Never Give Up',NULL,'NAN6@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(7,'No Wax',NULL,'NAN7@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(8,'Rookies',NULL,'NAN8@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(9,'Shape is Overrated',NULL,'Nan9@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(10,'Sharkstorm',NULL,'NAN10@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(11,'Slate Runners',NULL,'NAN11@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(12,'Team Jager ',NULL,'NAN12@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(13,'Tekila Little Time',NULL,'NAN13@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(14,'Temporarily Unavailable',NULL,'NAN14@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(15,'That\'s Your Cue',NULL,'NAN15@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:30','Season ended'),
(16,'Those Guys',NULL,'NAN16@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:33','Season ended'),
(17,'Guns and Roses',NULL,'NAN17@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:36','Season ended'),
(18,'Mojo',NULL,'NAN18@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:36','Season ended'),
(19,'Team Torture',NULL,'NAN19@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:36','Season ended'),
(20,'Vikings',NULL,'NAN20@email.ca',0,'1c5e612142cedca82b3eb0b35065c9a08ff42c386910e02b4b18bb2b6f4aa171',NULL,NULL,0,'2026-04-25 21:59:36','Season ended');
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TeamLeagueRegistration`
--

LOCK TABLES `TeamLeagueRegistration` WRITE;
/*!40000 ALTER TABLE `TeamLeagueRegistration` DISABLE KEYS */;
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
(1,'Charlo Brass',NULL,'2025-11-15'),
(1,'Darryl Brass',NULL,'2025-11-15'),
(1,'Dave Meguinis',NULL,'2025-11-15'),
(1,'Delaney Littlechild',NULL,'2025-11-15'),
(1,'Derrick Fullerton',NULL,'2025-11-15'),
(1,'Dustin Pipestem',NULL,'2025-11-15'),
(1,'Greg Morrison',NULL,'2025-11-15'),
(1,'Guffy Otter',NULL,'2025-11-15'),
(1,'Isaac Littlechild',NULL,'2025-11-15'),
(1,'Jason Fraser',NULL,'2025-11-15'),
(1,'Kristen Sparvier',NULL,'2025-11-15'),
(2,'Claude Bremault',NULL,'2025-11-15'),
(2,'Doug Lamoureux',NULL,'2025-11-15'),
(2,'Jason Renwick',NULL,'2025-11-15'),
(2,'Matt Davis',NULL,'2025-11-15'),
(2,'Patrick Puteria',NULL,'2025-11-15'),
(2,'Peter Nunes',NULL,'2025-11-15'),
(2,'Randy Davis',NULL,'2025-11-15'),
(2,'Trevor Lorenz',NULL,'2025-11-15'),
(3,'Chris Klassen',NULL,'2025-11-15'),
(3,'Darryl Woroniuk',NULL,'2025-11-15'),
(3,'Ethan McCorquodale',NULL,'2025-11-15'),
(3,'George Boyden',NULL,'2025-11-15'),
(3,'Jay Whitecotton',NULL,'2025-11-15'),
(3,'Jerry Bauche',NULL,'2025-11-15'),
(3,'Linda Sayers',NULL,'2025-11-15'),
(3,'Phil Sayers',NULL,'2025-11-15'),
(4,'Bob Bain',NULL,'2025-11-15'),
(4,'Bryan Nilsson',NULL,'2025-11-15'),
(4,'Chris Demers',NULL,'2025-11-15'),
(4,'Chris McClure',NULL,'2025-11-15'),
(4,'Don Collins',NULL,'2025-11-15'),
(4,'James Hornby',NULL,'2025-11-15'),
(4,'Joel Niven',NULL,'2025-11-15'),
(4,'Mike Bain',NULL,'2025-11-15'),
(4,'Russ Alexander',NULL,'2025-11-15'),
(5,'Bob Bain',NULL,'2025-11-15'),
(5,'Chad Berry',NULL,'2025-11-15'),
(5,'Colin Sampson',NULL,'2025-11-15'),
(5,'Glenn Jarvis',NULL,'2025-11-15'),
(5,'Jason Buckland',NULL,'2025-11-15'),
(5,'Mike Houston',NULL,'2025-11-15'),
(5,'Raj Pannu',NULL,'2025-11-15'),
(5,'Rod Schlachter',NULL,'2025-11-15'),
(5,'Roy Farr',NULL,'2025-11-15'),
(6,'Clarence Holloway',NULL,'2025-11-15'),
(6,'Colin Beaulieu',NULL,'2025-11-15'),
(6,'Kristen Sparvier',NULL,'2025-11-15'),
(6,'Leo Daniels',NULL,'2025-11-15'),
(6,'Mike Whitegrass',NULL,'2025-11-15'),
(6,'Rob Poglitsch',NULL,'2025-11-15'),
(6,'Rob Sparvier',NULL,'2025-11-15'),
(6,'Tom Kayyali',NULL,'2025-11-15'),
(6,'Vince Torok',NULL,'2025-11-15'),
(6,'Warren Drunkenchief',NULL,'2025-11-15'),
(7,'Chanh Le',NULL,'2025-11-15'),
(7,'Denzhel De Castro',NULL,'2025-11-15'),
(7,'Glen Inocencio',NULL,'2025-11-15'),
(7,'Mark Laya',NULL,'2025-11-15'),
(7,'Reynaldo Panta',NULL,'2025-11-15'),
(7,'Richard Dimas',NULL,'2025-11-15'),
(7,'Ron Agana',NULL,'2025-11-15'),
(7,'Ruel Panganiban',NULL,'2025-11-15'),
(8,'Bill Wahl',NULL,'2025-11-15'),
(8,'Frank McGeachie',NULL,'2025-11-15'),
(8,'Jason Stolz',NULL,'2025-11-15'),
(8,'Paul Stolz',NULL,'2025-11-15'),
(8,'Ross Johnston',NULL,'2025-11-15'),
(8,'Steve Friesen',NULL,'2025-11-15'),
(8,'Tom Murray',NULL,'2025-11-15'),
(9,'Bob Long',NULL,'2025-11-15'),
(9,'Chanh Le',NULL,'2025-11-15'),
(9,'Ken Low',NULL,'2025-11-15'),
(9,'Mark Matuska',NULL,'2025-11-15'),
(9,'Randy Sexsmith',NULL,'2025-11-15'),
(9,'Rob Malcolm',NULL,'2025-11-15'),
(10,'Brett Armseden',NULL,'2025-11-15'),
(10,'Chad MacLean',NULL,'2025-11-15'),
(10,'Cody Hall',NULL,'2025-11-15'),
(10,'Etienne Larose',NULL,'2025-11-15'),
(10,'Jason Reiter',NULL,'2025-11-15'),
(10,'Kyle Ashmore',NULL,'2025-11-15'),
(10,'Peter Chiasson',NULL,'2025-11-15'),
(10,'Zhewen Hu',NULL,'2025-11-15'),
(11,'Blake Holmes',NULL,'2025-11-15'),
(11,'Clinton Holmes',NULL,'2025-11-15'),
(11,'Darrick Bergman',NULL,'2025-11-15'),
(11,'Dave Long',NULL,'2025-11-15'),
(11,'Jared Brassard',NULL,'2025-11-15'),
(11,'Jeff Joliliffe',NULL,'2025-11-15'),
(11,'Jesse Farhat',NULL,'2025-11-15'),
(11,'Kenn McKeigan',NULL,'2025-11-15'),
(11,'Ryan Murrary',NULL,'2025-11-15'),
(11,'Warren Pasley',NULL,'2025-11-15'),
(12,'Adam Braunwarth',NULL,'2025-11-15'),
(12,'Adrian McKeown',NULL,'2025-11-15'),
(12,'Chris Dionne',NULL,'2025-11-15'),
(12,'Gord Casson',NULL,'2025-11-15'),
(12,'Greg Daunhauer',NULL,'2025-11-15'),
(12,'Jeremiah Hampton',NULL,'2025-11-15'),
(12,'Paul Silva',NULL,'2025-11-15'),
(12,'Shona MacIsaac',NULL,'2025-11-15'),
(13,'Andrew Kwan',NULL,'2025-11-15'),
(13,'Chanelle Mackenzie',NULL,'2025-11-15'),
(13,'Dale Hager',NULL,'2025-11-15'),
(13,'Elzear D\'Amour',NULL,'2025-11-15'),
(13,'Freddy Morales',NULL,'2025-11-15'),
(13,'Giovanni Morales',NULL,'2025-11-15'),
(13,'Lee Mutzeneek',NULL,'2025-11-15'),
(13,'Luis Morales',NULL,'2025-11-15'),
(13,'Martin Williams',NULL,'2025-11-15'),
(13,'Mike Mcnabb',NULL,'2025-11-15'),
(13,'Rob Malcolm',NULL,'2025-11-15'),
(14,'Bob Leonard',NULL,'2025-11-15'),
(14,'Chris Jackson',NULL,'2025-11-15'),
(14,'Ethan McCorquodale',NULL,'2025-11-15'),
(14,'Halle Hickey',NULL,'2025-11-15'),
(14,'Joelle Blanchard',NULL,'2025-11-15'),
(14,'Megan Martinovic',NULL,'2025-11-15'),
(14,'Mike Lapointe',NULL,'2025-11-15'),
(14,'Sonia Woodard',NULL,'2025-11-15'),
(15,'Alan Newlands',NULL,'2025-11-15'),
(15,'Darrell Stephens',NULL,'2025-11-15'),
(15,'Deep Rai',NULL,'2025-11-15'),
(15,'Dion Ullrich',NULL,'2025-11-15'),
(15,'Eldon Vansandt',NULL,'2025-11-15'),
(15,'Rainer Kambach',NULL,'2025-11-15'),
(15,'Randy Halsted',NULL,'2025-11-15'),
(16,'Dale Batten',NULL,'2025-11-15'),
(16,'David Blieske',NULL,'2025-11-15'),
(16,'Derek Fields',NULL,'2025-11-15'),
(16,'Doug Critchley',NULL,'2025-11-15'),
(16,'Elzear D\'Amour',NULL,'2025-11-15'),
(16,'Herb Veckenstedt',NULL,'2025-11-15'),
(16,'Lee Mutzeneek',NULL,'2025-11-15'),
(17,'Brett Armsden',NULL,'2025-11-15'),
(17,'Chris Jackson',NULL,'2025-11-15'),
(17,'Chris McClure',NULL,'2025-11-15'),
(17,'Geoff Gelinas',NULL,'2025-11-15'),
(17,'Jeremy Brann',NULL,'2025-11-15'),
(17,'Jilbert Nartia',NULL,'2025-11-15'),
(17,'Joel Niven',NULL,'2025-11-15'),
(17,'Mark Mapatac',NULL,'2025-11-15'),
(18,'Ben Liu',NULL,'2025-11-15'),
(18,'Daniel Leung',NULL,'2025-11-15'),
(18,'Denzhel De Castro',NULL,'2025-11-15'),
(18,'Jared White',NULL,'2025-11-15'),
(18,'Mark Downey',NULL,'2025-11-15'),
(18,'Martin Kayyali',NULL,'2025-11-15'),
(18,'Max Nafura',NULL,'2025-11-15'),
(18,'Maxime Giguère',NULL,'2025-11-15'),
(18,'Roger D\'Souza',NULL,'2025-11-15'),
(19,'Chad Clarey',NULL,'2025-11-15'),
(19,'Chris Demers',NULL,'2025-11-15'),
(19,'Danny Gomboc',NULL,'2025-11-15'),
(19,'Georgios Zigopoulos',NULL,'2025-11-15'),
(19,'Jaxon Kelly',NULL,'2025-11-15'),
(19,'Jeremiah Hampton',NULL,'2025-11-15'),
(19,'John Clarke',NULL,'2025-11-15'),
(19,'Kyle Kelly',NULL,'2025-11-15'),
(19,'Peter Chiasson',NULL,'2025-11-15'),
(19,'Tyson Baudistel',NULL,'2025-11-15'),
(20,'Carl Anderson',NULL,'2025-11-15'),
(20,'Colin Anderson',NULL,'2025-11-15'),
(20,'Derek Anderson',NULL,'2025-11-15'),
(20,'James Hornby',NULL,'2025-11-15'),
(20,'Paul Beatty',NULL,'2025-11-15'),
(20,'Warren Lindland',NULL,'2025-11-15');
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

-- Dump completed on 2026-05-06 12:41:27
