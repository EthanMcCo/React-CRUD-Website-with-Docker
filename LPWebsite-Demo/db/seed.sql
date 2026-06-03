USE `Billiards-Site`;

-- Disable foreign key checks for seeding
SET FOREIGN_KEY_CHECKS=0;

-- Clear existing data
TRUNCATE TABLE Team;
TRUNCATE TABLE League;
TRUNCATE TABLE TeamLeagueRegistration;
TRUNCATE TABLE TeamPlayer;
TRUNCATE TABLE Food;



-- Sample Leagues
INSERT INTO League (name, description, max_teams, fargo_cap, play_night, play_time, tables_reserved, table_type) VALUES
('Monday 8-Ball', '8-Ball league for intermediate players', 8, 600, 'Monday', '19:00:00', 4, 1),
('Wednesday 9-Ball', 'Competitive 9-Ball league', 6, 650, 'Wednesday', '19:30:00', 3, 1);

-- Sample Menu Items
INSERT INTO Food (name, description, price, type) VALUES
('Chicken Wings', 'flavors: HONEY HOT,  HONEY GARLIC, TERIYAKI, BBQ, SWEET CHILI, salt & pepper, lemon pepper, hot, medium / SERVED WITH CARROTS AND CELERY / ADD RANCH $1', 15.00, 'Appetizers'),
('BONELESS DRY RIBS', 'flavors: HONEY HOT,  HONEY GARLIC, TERIYAKI, BBQ, SWEET CHILI, salt & pepper, lemon pepper, hot, medium / SERVED WITH CARROTS AND CELERY / ADD RANCH $1', 14.00, 'Appetizers'),
('BACON, CHEDDAR BURGER', 'LETTUCE, TOMATOES, ONIONS, MAYO AND PICKLES / ADD CHEESE OR BACON $2 / MAKE IT A DOUBLE PATTY $4', 16.00, 'BurgersAndSandwiches'),
('TWO EGGS ANY STYLE', 'SERVED WITH HASH BROWNS, TOAST AND YOUR CHOICE OF SAUSAGE OR BACON / ADD EXTRA BACON OR SAUSAGE $2', 12.00, 'AllDayBreakfast'),
('GARDEN SALAD', 'LETTUCE, TOMATOES, ONIONS, CELERY, GREEN PEPPERS, CUCUMBERS, SLICED CARROTS, WITH RANCH OR ITALIAN DRESSING / ADD BREADED CHICKEN $5', 9.00, 'Salads');


INSERT INTO `FAQ` (`faq_id`, `topic`, `question`, `answer`) VALUES
(1, 'Pricing + Hours', 'What are your opening hours?', 'We are open from 11:00am - 2:00 am.  We are also open every holiday!'),
(2, 'Leagues', 'How do I join your in-house League?', 'You can utilize the team registration from our website to contact existing teams.  Alternatively, you can place your name in the player pool under the team-finder.  Teams interested in you will reach out.  You can also reach out to other players and form your own team.'),
(3, 'Leagues', 'How do I use the Team Finder?', 'You can use the team finder in two ways. Place your name in the pool and hope you get contacted by players.  You can also reach out to other players to see if they\'re interested in forming a team with you.  When you have enough players to form a team (5) you can register your team in \"Team Registration\".'),
(4, 'Leagues', 'What is the difference between Tentative and Registered for Team Registration?', 'Tentative teams mean they are interested in playing that night, however, they have not paid their $200 deposit to reserve their spot.\n\nIf a Team is registered that means they have paid their deposit and their spot in that night is reserved.'),
(5, 'Leagues', 'Why can I only contact some teams?', 'Teams with the contact button available welcome new players contacting them about joining.  If there is no contact button then they do not want new players');

-- Dumping data for table `TeamPlayer`

INSERT INTO `TeamPlayer` (`team_id`, `player_name`, `contact_info`, `join_date`) VALUES
(1, 'John Banks', NULL, '2024-12-08'),
(2, 'Jim Man', NULL, '2024-12-08'),
(3, 'Jerry', NULL, '2024-12-08'),
(4, 'Frank', NULL, '2024-12-08'),
(5, 'Always Missing', NULL, '2024-12-08');

-- Dumping data for table `Team`

INSERT INTO `Team` (`team_id`, `name`, `captain_name`, `captain_email`, `accepting_new_players`) VALUES
(1, 'HotShots', NULL, 'hotshot@pool.com', 1),
(2, 'SuperShooters', NULL, 'Captain@email.com', 1),
(3, 'Pool Dragons', NULL, 'JerryJohn@gmail.com', 0),
(4, 'Pocket Makers', NULL, 'emailMe@captain.com', 0),
(5, 'Don\'t Miss', NULL, 'dontmiss@imissed.com', 1);

-- Dumping data for table `TeamLeagueRegistration`

INSERT INTO `TeamLeagueRegistration` (`registration_id`, `team_id`, `league_id`, `registration_date`, `deposit_paid`, `registration_status`, `payment_date`) VALUES
(1, 1, 3, '2024-12-08', 0, 'confirmed', '2024-12-08'),
(2, 2, 4, '2024-12-08', 0, 'confirmed', '2024-12-08'),
(3, 3, 2, '2024-12-08', 0, 'confirmed', '2024-12-08'),
(4, 4, 2, '2024-12-08', 0, 'tentative', NULL),
(5, 5, 4, '2024-12-08', 0, 'tentative', NULL);

-- Dumping data for table `PlayerFinder`

INSERT INTO `PlayerFinder` (`player_id`, `name`, `email`, `password_hash`, `bio`, `play_nights`, `skill_level`, `created_at`, `active`) VALUES
(1, 'Melinda Showfield', 'Melinda@melinda.com', '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225', 'I like to shoot balls into a pocket', '[\"Monday\",\"Friday\"]', 'Advanced', '2024-12-08 02:19:37', 1),
(2, 'Jenny Face', 'Face@hand.com', '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225', 'I have hands. Also a face... maybe.', '[\"Tuesday\",\"Wednesday\",\"Thursday\"]', 'Professional', '2024-12-08 02:20:22', 1),
(3, 'Ludwig Von Beethoven', 'Classical@music.com', '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225', 'I am dead.', '[\"Monday\",\"Thursday\",\"Friday\"]', 'Beginner', '2024-12-08 02:21:13', 1),
(4, 'Ronald Mcdonald', 'Ronald@mcdonald.com', '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225', 'I like burgers.', '[\"Thursday\",\"Tuesday\"]', 'Intermediate', '2024-12-08 02:21:50', 1),
(5, 'John Smith', 'John@smith.ca', '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225', 'Pool is pretty fun.', '[\"Monday\"]', 'Beginner', '2024-12-08 02:22:24', 1);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;