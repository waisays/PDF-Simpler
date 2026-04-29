-- Users
CREATE TABLE users (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(120)        NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password            VARCHAR(255)        NOT NULL,
  plan                ENUM('free','pro')  DEFAULT 'free',
  tasks_today         INT                 DEFAULT 0,
  last_reset          DATE                DEFAULT (CURDATE()),
  stripe_customer_id  VARCHAR(255)        NULL,
  created_at          TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- Task history
CREATE TABLE tasks (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT,
  tool_slug    VARCHAR(80)  NOT NULL,
  input_file   VARCHAR(255),
  output_file  VARCHAR(255),
  status       ENUM('pending','done','error') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tool definitions (for dynamic tool page rendering)
CREATE TABLE tools (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(80)   UNIQUE NOT NULL,
  name        VARCHAR(120)  NOT NULL,
  category    ENUM('edit','convert_from','convert_to','image','audio','video','ai') NOT NULL,
  description TEXT,
  icon_svg    TEXT,
  is_active   TINYINT(1) DEFAULT 1,
  sort_order  INT DEFAULT 0
);
