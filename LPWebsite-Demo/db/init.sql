-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 28, 2024 at 05:33 AM
-- Server version: 11.5.2-MariaDB-ubu2404
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Billiards-Site`
--

-- --------------------------------------------------------

--
-- Table structure for table `Admin`
--

CREATE TABLE `Admin` (
  `admin_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `EventReservation`
--

CREATE TABLE `EventReservation` (
  `event_id` int(11) NOT NULL,
  `event_type_id` int(11) NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FAQ`
--

CREATE TABLE `FAQ` (
  `faq_id` int(11) NOT NULL,
  `topic` varchar(100) NOT NULL DEFAULT 'Other',
  `question` text NOT NULL,
  `answer` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Food`
--

CREATE TABLE `Food` (
  `item_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `League`
--

CREATE TABLE `League` (
  `league_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `max_teams` int(11) DEFAULT NULL,
  `fargo_cap` int(11) DEFAULT NULL,
  `play_night` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `play_time` time NOT NULL,
  `tables_reserved` int(11) DEFAULT NULL,
  `table_type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Playoffs`
--

CREATE TABLE `Playoffs` (
  `playoff_id` int(11) NOT NULL,
  `league_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `start_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SeasonalEvent`
--

CREATE TABLE `SeasonalEvent` (
  `event_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_capacity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Team`
--

CREATE TABLE `Team` (
  `team_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `captain_name` varchar(100) DEFAULT NULL,
  `captain_email` varchar(255) DEFAULT NULL,
  `accepting_new_players` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TeamLeagueRegistration`
--

CREATE TABLE `TeamLeagueRegistration` (
  `registration_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `league_id` int(11) NOT NULL,
  `registration_date` date NOT NULL,
  `deposit_paid` tinyint(1) DEFAULT 0,
  `registration_status` enum('tentative','confirmed','cancelled') DEFAULT 'tentative',
  `payment_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TeamPlayer`
--

CREATE TABLE `TeamPlayer` (
  `team_id` int(11) NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `join_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Tournament`
--

CREATE TABLE `Tournament` (
  `tournament_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `entry_fee` decimal(10,2) DEFAULT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `tables_reserved` int(11) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TournamentSchedule`
--

CREATE TABLE `TournamentSchedule` (
  `schedule_id` int(11) NOT NULL,
  `tournament_id` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Admin`
--
ALTER TABLE `Admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `EventReservation`
--
ALTER TABLE `EventReservation`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `event_id` (`event_type_id`);

--
-- Indexes for table `FAQ`
--
ALTER TABLE `FAQ`
  ADD PRIMARY KEY (`faq_id`);

--
-- Indexes for table `Food`
--
ALTER TABLE `Food`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `League`
--
ALTER TABLE `League`
  ADD PRIMARY KEY (`league_id`),
  ADD KEY `idx_league_play_night` (`play_night`);

--
-- Indexes for table `Playoffs`
--
ALTER TABLE `Playoffs`
  ADD PRIMARY KEY (`playoff_id`),
  ADD KEY `league_id` (`league_id`);

--
-- Indexes for table `SeasonalEvent`
--
ALTER TABLE `SeasonalEvent`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_seasonal_event_date` (`event_date`);

--
-- Indexes for table `Team`
--
ALTER TABLE `Team`
  ADD PRIMARY KEY (`team_id`);

--
-- Indexes for table `TeamLeagueRegistration`
--
ALTER TABLE `TeamLeagueRegistration`
  ADD PRIMARY KEY (`registration_id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `league_id` (`league_id`),
  ADD KEY `idx_team_registration_status` (`registration_status`);

--
-- Indexes for table `TeamPlayer`
--
ALTER TABLE `TeamPlayer`
  ADD PRIMARY KEY (`team_id`,`player_name`);

--
-- Indexes for table `Tournament`
--
ALTER TABLE `Tournament`
  ADD PRIMARY KEY (`tournament_id`);

--
-- Indexes for table `TournamentSchedule`
--
ALTER TABLE `TournamentSchedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `tournament_id` (`tournament_id`),
  ADD KEY `idx_tournament_date` (`event_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Admin`
--
ALTER TABLE `Admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `EventReservation`
--
ALTER TABLE `EventReservation`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `FAQ`
--
ALTER TABLE `FAQ`
  MODIFY `faq_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Food`
--
ALTER TABLE `Food`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `League`
--
ALTER TABLE `League`
  MODIFY `league_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Playoffs`
--
ALTER TABLE `Playoffs`
  MODIFY `playoff_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SeasonalEvent`
--
ALTER TABLE `SeasonalEvent`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Team`
--
ALTER TABLE `Team`
  MODIFY `team_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TeamLeagueRegistration`
--
ALTER TABLE `TeamLeagueRegistration`
  MODIFY `registration_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Tournament`
--
ALTER TABLE `Tournament`
  MODIFY `tournament_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TournamentSchedule`
--
ALTER TABLE `TournamentSchedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `EventReservation`
--
ALTER TABLE `EventReservation`
  ADD CONSTRAINT `EventReservation_ibfk_1` FOREIGN KEY (`event_type_id`) REFERENCES `SeasonalEvent` (`event_id`);

--
-- Constraints for table `Playoffs`
--
ALTER TABLE `Playoffs`
  ADD CONSTRAINT `Playoffs_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `League` (`league_id`);

--
-- Constraints for table `TeamLeagueRegistration`
--
ALTER TABLE `TeamLeagueRegistration`
  ADD CONSTRAINT `TeamLeagueRegistration_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`),
  ADD CONSTRAINT `TeamLeagueRegistration_ibfk_2` FOREIGN KEY (`league_id`) REFERENCES `League` (`league_id`);

--
-- Constraints for table `TeamPlayer`
--
ALTER TABLE `TeamPlayer`
  ADD CONSTRAINT `TeamPlayer_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`team_id`);

--
-- Constraints for table `TournamentSchedule`
--
ALTER TABLE `TournamentSchedule`
  ADD CONSTRAINT `TournamentSchedule_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `Tournament` (`tournament_id`);
COMMIT;

-- Create table for contact requests
CREATE TABLE ContactRequest (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

-- Add index for faster lookups
CREATE INDEX idx_team_status ON ContactRequest(team_id, status);

-- Create table for individual players looking for teams
CREATE TABLE PlayerFinder (
    player_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Added this line
    bio TEXT,
    play_nights JSON NOT NULL, -- Store available nights as JSON array
    skill_level VARCHAR(50), -- Optional field for player's skill level
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY unique_email (email)
);

-- Add index for faster lookups
CREATE INDEX idx_player_active ON PlayerFinder(active);
CREATE INDEX idx_player_email ON PlayerFinder(email);
CREATE TABLE DealPricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tableType VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE TablePricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tableType VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial pricing data
INSERT INTO DealPricing (tableType, price) VALUES
('7ft Valley Tables', 15.00),
('7ft Diamond Tables', 20.00),
('9ft Diamond Tables', 25.00);

INSERT INTO TablePricing (tableType, price) VALUES
('7ft Valley Tables', 12.00),
('7ft Diamond Tables', 13.00),
('9ft Diamond Tables', 14.00);


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
