-- Database Schema for Daily Workout Progress Tracker

-- 1. Users Table (Supports Username + PIN authentication for cross-device access without email)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    pin_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily_Logs Table (Records daily body weight entries)
CREATE TABLE daily_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    body_weight DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_daily_log UNIQUE (user_id, date)
);

-- 3. Exercises Table (Catalog of pre-populated and custom movements)
CREATE TABLE exercises (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Chest, Back, Abs, Biceps, Triceps, Legs, Cardio
    type VARCHAR(20) NOT NULL,    -- Weight or Cardio
    is_custom BOOLEAN DEFAULT FALSE,
    created_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Workout_Records Table (Logs exercise sets, reps, weights, or cardio metrics)
CREATE TABLE workout_records (
    id VARCHAR(64) PRIMARY KEY,
    daily_log_id VARCHAR(64) REFERENCES daily_logs(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    exercise_id VARCHAR(64) NOT NULL REFERENCES exercises(id),
    category VARCHAR(50) NOT NULL,
    weight DECIMAL(5, 2),       -- For Weight Training
    sets INT,                   -- For Weight Training
    reps INT,                   -- For Weight Training
    distance DECIMAL(5, 2),     -- For Cardio
    pace VARCHAR(20),           -- For Cardio (min/km)
    calories INT,               -- For Cardio (kcal)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
