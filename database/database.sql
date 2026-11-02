
CREATE DATABASE IF NOT EXISTS store_rating_system;

USE store_rating_system;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'owner') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Stores Table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT,
    image_url VARCHAR(500),
    category VARCHAR(100),
    description TEXT,
    contact_number VARCHAR(20),
    opening_hours VARCHAR(100),
    website_url VARCHAR(500),
    location_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE SET NULL
);

-- 3. Ratings Table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE (user_id, store_id),

    CHECK (rating BETWEEN 1 AND 5),

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (store_id) REFERENCES stores(id)
        ON DELETE CASCADE
);

-- 4. Useful Indexes
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- 5. Verify Database Tables
SHOW TABLES;

DESCRIBE users;
DESCRIBE stores;
DESCRIBE ratings;
