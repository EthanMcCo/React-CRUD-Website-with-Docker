-- Migration to add password reset functionality
-- Add password and reset token fields to Team table

ALTER TABLE `Team` 
ADD COLUMN `password_hash` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `reset_token_hash` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `reset_token_expires` DATETIME DEFAULT NULL;

-- Add reset token fields to PlayerFinder table
ALTER TABLE `PlayerFinder` 
ADD COLUMN `reset_token_hash` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `reset_token_expires` DATETIME DEFAULT NULL;

-- Add indexes for security and performance
CREATE INDEX idx_team_reset_token ON Team(reset_token_hash);
CREATE INDEX idx_player_reset_token ON PlayerFinder(reset_token_hash);
CREATE INDEX idx_team_email ON Team(captain_email);