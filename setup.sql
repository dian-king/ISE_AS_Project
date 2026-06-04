-- ISE&AS Database Setup Script
-- Run this in your PostgreSQL Query Tool (e.g., pgAdmin or psql)

-- 1. Create the database
CREATE DATABASE ise_as_db;

-- 2. Optional: If you want to create a specific user for this app
-- CREATE USER ise_admin WITH PASSWORD 'ise_password';
-- GRANT ALL PRIVILEGES ON DATABASE ise_as_db TO ise_admin;

-- Note: The tables will be automatically created by Spring Boot 
-- when the application starts, thanks to the 'ddl-auto=update' setting.
