-- ============================================================================
-- Employee Management System - Database Setup Script
-- Database: employee_db
-- Compatible with: MySQL 8.0+, MariaDB, MySQL Workbench, phpMyAdmin
-- ============================================================================

-- 1. Create and Select Database
CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

-- ============================================================================
-- 2. Create employees table
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) DEFAULT 'Staff',
    salary DOUBLE DEFAULT 50000.0,
    manager_name VARCHAR(255) DEFAULT 'Unassigned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_email ON employees(email);
CREATE INDEX idx_department ON employees(department);
CREATE INDEX idx_first_name ON employees(first_name);
CREATE INDEX idx_last_name ON employees(last_name);

-- ============================================================================
-- 3. Create attendance table (Daily attendance tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Present', 'Absent', 'Half-Day'
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_employee (employee_id)
);

-- ============================================================================
-- 4. Create leave_requests table (Leave application and approvals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    leave_type VARCHAR(100) NOT NULL, -- 'Sick Leave', 'Casual Leave', 'Vacation'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    INDEX idx_leave_employee (employee_id),
    INDEX idx_leave_status (status)
);

-- ============================================================================
-- 5. Sample Data Insertion: Employees
-- ============================================================================
INSERT INTO employees (first_name, last_name, email, department, designation, salary, manager_name) VALUES
('Aarav', 'Sharma', 'aarav.sharma@example.com', 'IT', 'Senior Software Engineer', 75000.0, 'Rajesh Menon'),
('Ananya', 'Iyer', 'ananya.iyer@example.com', 'HR', 'HR Manager', 65000.0, 'Rajesh Menon'),
('Rohan', 'Mehta', 'rohan.mehta@example.com', 'Finance', 'Senior Accountant', 58000.0, 'Ananya Iyer'),
('Priya', 'Nair', 'priya.nair@example.com', 'IT', 'Software Developer', 68000.0, 'Aarav Sharma'),
('Vikram', 'Singh', 'vikram.singh@example.com', 'Sales', 'Sales Executive', 55000.0, 'Rajesh Menon'),
('Kavya', 'Reddy', 'kavya.reddy@example.com', 'HR', 'Talent Acquisition', 52000.0, 'Ananya Iyer'),
('Arjun', 'Patel', 'arjun.patel@example.com', 'Operations', 'Operations Lead', 64000.0, 'Rajesh Menon'),
('Sneha', 'Desai', 'sneha.desai@example.com', 'Finance', 'Financial Analyst', 62000.0, 'Rohan Mehta');

-- ============================================================================
-- 6. Sample Data Insertion: Attendance
-- ============================================================================
INSERT INTO attendance (employee_id, employee_name, date, status) VALUES
(1, 'Aarav Sharma', CURDATE(), 'Present'),
(2, 'Ananya Iyer', CURDATE(), 'Present'),
(3, 'Rohan Mehta', CURDATE(), 'Absent'),
(4, 'Priya Nair', CURDATE(), 'Present'),
(5, 'Vikram Singh', CURDATE(), 'Present'),
(6, 'Kavya Reddy', CURDATE(), 'Present'),
(7, 'Arjun Patel', CURDATE(), 'Present'),
(8, 'Sneha Desai', CURDATE(), 'Half-Day');

-- ============================================================================
-- 7. Sample Data Insertion: Leave Requests
-- ============================================================================
INSERT INTO leave_requests (employee_id, employee_name, leave_type, start_date, end_date, reason, status) VALUES
(3, 'Rohan Mehta', 'Sick Leave', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Viral fever and doctor recommended bed rest', 'Pending'),
(1, 'Aarav Sharma', 'Casual Leave', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Attending family reunion', 'Approved'),
(6, 'Kavya Reddy', 'Casual Leave', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'Personal errand', 'Pending');

-- ============================================================================
-- 8. Update Existing Sample Records Without Deleting Employees
-- ============================================================================
UPDATE employees SET first_name = 'Aarav', last_name = 'Sharma', email = 'aarav.sharma@example.com', manager_name = 'Rajesh Menon' WHERE id = 1;
UPDATE employees SET first_name = 'Ananya', last_name = 'Iyer', email = 'ananya.iyer@example.com', manager_name = 'Rajesh Menon' WHERE id = 2;
UPDATE employees SET first_name = 'Rohan', last_name = 'Mehta', email = 'rohan.mehta@example.com', manager_name = 'Ananya Iyer' WHERE id = 3;
UPDATE employees SET first_name = 'Priya', last_name = 'Nair', email = 'priya.nair@example.com', manager_name = 'Aarav Sharma' WHERE id = 4;
UPDATE employees SET first_name = 'Vikram', last_name = 'Singh', email = 'vikram.singh@example.com', manager_name = 'Rajesh Menon' WHERE id = 5;
UPDATE employees SET first_name = 'Kavya', last_name = 'Reddy', email = 'kavya.reddy@example.com', manager_name = 'Ananya Iyer' WHERE id = 6;
UPDATE employees SET first_name = 'Arjun', last_name = 'Patel', email = 'arjun.patel@example.com', manager_name = 'Rajesh Menon' WHERE id = 7;
UPDATE employees SET first_name = 'Sneha', last_name = 'Desai', email = 'sneha.desai@example.com', manager_name = 'Rohan Mehta' WHERE id = 8;

UPDATE attendance SET employee_name = 'Aarav Sharma' WHERE employee_id = 1;
UPDATE attendance SET employee_name = 'Ananya Iyer' WHERE employee_id = 2;
UPDATE attendance SET employee_name = 'Rohan Mehta' WHERE employee_id = 3;
UPDATE attendance SET employee_name = 'Priya Nair' WHERE employee_id = 4;
UPDATE attendance SET employee_name = 'Vikram Singh' WHERE employee_id = 5;
UPDATE attendance SET employee_name = 'Kavya Reddy' WHERE employee_id = 6;
UPDATE attendance SET employee_name = 'Arjun Patel' WHERE employee_id = 7;
UPDATE attendance SET employee_name = 'Sneha Desai' WHERE employee_id = 8;

UPDATE leave_requests SET employee_name = 'Rohan Mehta' WHERE employee_id = 3;
UPDATE leave_requests SET employee_name = 'Aarav Sharma' WHERE employee_id = 1;
UPDATE leave_requests SET employee_name = 'Kavya Reddy' WHERE employee_id = 6;

-- ============================================================================
-- 9. Useful Queries for Testing & Viva Demonstrations
-- ============================================================================

-- View all employees
SELECT * FROM employees;

-- Get employees by department
SELECT * FROM employees WHERE department = 'IT';

-- Get employee by email
SELECT * FROM employees WHERE email = 'aarav.sharma@example.com';

-- Count employees per department
SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department;

-- View today's attendance
SELECT * FROM attendance WHERE date = CURDATE();

-- View all pending leave requests
SELECT * FROM leave_requests WHERE status = 'Pending';

-- Calculate average and total company payroll
SELECT COUNT(*) as total_employees, SUM(salary) as total_payroll, AVG(salary) as average_salary FROM employees;

-- Delete all records (use with caution)
-- DELETE FROM employees;

-- Drop tables (use with caution)
-- DROP TABLE IF EXISTS leave_requests;
-- DROP TABLE IF EXISTS attendance;
-- DROP TABLE IF EXISTS employees;
