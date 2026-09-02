-- ========================================================================
-- SMART WATER UTILITY CONSUMPTION, BILLING & COMPLAINT MANAGEMENT SYSTEM
-- Database Management Systems Academic Project
-- Relational Schema, B+ Tree Indexes, Transactions, and Concurrency Control
-- ========================================================================

DROP DATABASE IF EXISTS water_utility;
CREATE DATABASE water_utility CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE water_utility;

-- ========================================================================
-- 1. TABLE DEFINITIONS (DDL) WITH INTEGRITY CONSTRAINTS
-- ========================================================================

-- Table: OPERATOR (Staff & Role Management)
CREATE TABLE operator (
    operator_id VARCHAR(20) PRIMARY KEY,
    operator_name VARCHAR(100) NOT NULL,
    zone ENUM('Zone A', 'Zone B', 'Zone C', 'Zone D', 'All Zones') NOT NULL DEFAULT 'All Zones',
    role ENUM('ADMIN', 'BILLING_OPERATOR', 'FIELD_ENGINEER', 'COMPLAINT_OPERATOR') NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: CONNECTION (Water Supply Accounts)
CREATE TABLE connection (
    connection_id VARCHAR(20) PRIMARY KEY,
    consumer_name VARCHAR(120) NOT NULL,
    connection_type ENUM('Household', 'Commercial', 'Industrial', 'Institutional') NOT NULL,
    zone ENUM('Zone A', 'Zone B', 'Zone C', 'Zone D') NOT NULL,
    address TEXT NOT NULL,
    meter_number VARCHAR(30) UNIQUE NOT NULL,
    status ENUM('Active', 'Suspended', 'Disconnected', 'Pending') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_conn_id CHECK (connection_id LIKE 'CON%')
) ENGINE=InnoDB;

-- Table: METER_READING (High-Frequency Telemetry / Time-Series)
CREATE TABLE meter_reading (
    reading_id VARCHAR(30) PRIMARY KEY,
    connection_id VARCHAR(20) NOT NULL,
    reading_timestamp DATETIME NOT NULL,
    consumption_litres INT UNSIGNED NOT NULL,
    meter_status ENUM('Normal', 'Leak Suspected', 'Faulty', 'Tampered', 'High Flow') NOT NULL DEFAULT 'Normal',
    zone ENUM('Zone A', 'Zone B', 'Zone C', 'Zone D') NOT NULL,
    CONSTRAINT fk_meter_conn FOREIGN KEY (connection_id) 
        REFERENCES connection(connection_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_consumption_positive CHECK (consumption_litres >= 0)
) ENGINE=InnoDB;

-- Table: BILL (Monthly Invoicing with Tiered Tariffs)
CREATE TABLE bill (
    bill_id VARCHAR(30) PRIMARY KEY,
    connection_id VARCHAR(20) NOT NULL,
    billing_month CHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    previous_reading DECIMAL(10,2) NOT NULL,
    current_reading DECIMAL(10,2) NOT NULL,
    units_consumed DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_amount DECIMAL(10,2) NOT NULL,
    bill_status ENUM('PAID', 'PARTIALLY PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(20),
    version INT UNSIGNED NOT NULL DEFAULT 1, -- Optimistic concurrency control
    CONSTRAINT fk_bill_conn FOREIGN KEY (connection_id) 
        REFERENCES connection(connection_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bill_operator FOREIGN KEY (generated_by)
        REFERENCES operator(operator_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    -- CRITICAL INTEGRITY RULE: Prevent duplicate bills for the same connection and billing month
    CONSTRAINT uq_connection_billing_month UNIQUE (connection_id, billing_month),
    CONSTRAINT chk_readings CHECK (current_reading >= previous_reading),
    CONSTRAINT chk_due_amount CHECK (due_amount >= 0)
) ENGINE=InnoDB;

-- Table: PAYMENT (Receipts & Settlements)
CREATE TABLE payment (
    payment_id VARCHAR(30) PRIMARY KEY,
    bill_id VARCHAR(30) NOT NULL,
    connection_id VARCHAR(20) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash') NOT NULL,
    transaction_reference VARCHAR(64) UNIQUE NOT NULL,
    CONSTRAINT fk_pay_bill FOREIGN KEY (bill_id) 
        REFERENCES bill(bill_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pay_conn FOREIGN KEY (connection_id) 
        REFERENCES connection(connection_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_pay_amount CHECK (amount > 0)
) ENGINE=InnoDB;

-- Table: COMPLAINT (Consumer Support & Field Work Orders)
CREATE TABLE complaint (
    complaint_id VARCHAR(30) PRIMARY KEY,
    connection_id VARCHAR(20) NOT NULL,
    complaint_type ENUM('Leak', 'Meter Fault', 'Billing Dispute', 'Low Water Pressure', 'Supply Interruption', 'Other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    assigned_to VARCHAR(100),
    version INT UNSIGNED NOT NULL DEFAULT 1, -- Optimistic concurrency control lock
    CONSTRAINT fk_comp_conn FOREIGN KEY (connection_id) 
        REFERENCES connection(connection_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ========================================================================
-- 2. B+ TREE COMPOSITE INDEXES & INDEXED-SEQUENTIAL STRATEGY
-- ========================================================================

-- Primary composite index for fast time-series consumption range queries per connection
CREATE INDEX idx_meter_connection_time 
ON meter_reading(connection_id, reading_timestamp);

-- Secondary composite index for geographical leak detection queries
CREATE INDEX idx_meter_zone_time 
ON meter_reading(zone, reading_timestamp);

-- Index for rapid bill lookup by connection and cycle
CREATE INDEX idx_bill_connection_month 
ON bill(connection_id, billing_month);

-- Index for complaint tracking by consumer
CREATE INDEX idx_complaint_connection 
ON complaint(connection_id);

-- ========================================================================
-- 3. SEED SAMPLE DATA (DML)
-- ========================================================================

INSERT INTO operator (operator_id, operator_name, zone, role, email) VALUES
('ADMIN001', 'Dr. S. K. Narayana', 'All Zones', 'ADMIN', 'admin.narayana@waterboard.gov.in'),
('BILL001', 'Ramesh Varma', 'Zone A', 'BILLING_OPERATOR', 'ramesh.billing@waterboard.gov.in'),
('ENG001', 'Mohan Kumar', 'Zone B', 'FIELD_ENGINEER', 'mohan.eng@waterboard.gov.in'),
('CMP001', 'Anita Sen', 'All Zones', 'COMPLAINT_OPERATOR', 'anita.complaints@waterboard.gov.in');

INSERT INTO connection (connection_id, consumer_name, connection_type, zone, address, meter_number, status) VALUES
('CON10001', 'Arjun Kumar', 'Household', 'Zone A', '42, Lakeview Apartments, Indiranagar', 'MTR-A-8821', 'Active'),
('CON10002', 'Priya Sharma', 'Household', 'Zone B', '108, Palm Grove Residency, Koramangala', 'MTR-B-9912', 'Active'),
('CON10003', 'Green Mall Commercial Complex', 'Commercial', 'Zone A', 'Plot 7A, MG Road Commercial Hub', 'MTR-A-1024', 'Active'),
('CON10004', 'City Hospital Healthcare Center', 'Commercial', 'Zone C', '15, Health City Boulevard, Whitefield', 'MTR-C-3309', 'Active'),
('CON10005', 'Rohan Das', 'Household', 'Zone D', '12, Sunrise Enclave, Jayanagar', 'MTR-D-5541', 'Active');

INSERT INTO meter_reading (reading_id, connection_id, reading_timestamp, consumption_litres, meter_status, zone) VALUES
('RDG9001', 'CON10001', '2026-08-31 08:00:00', 260, 'Normal', 'Zone A'),
('RDG9002', 'CON10001', '2026-08-31 12:00:00', 245, 'Normal', 'Zone A'),
('RDG9003', 'CON10002', '2026-08-31 08:00:00', 220, 'Normal', 'Zone B'),
('RDG9004', 'CON10003', '2026-08-31 08:00:00', 5400, 'Leak Suspected', 'Zone A'),
('RDG9005', 'CON10004', '2026-08-31 08:00:00', 1850, 'Normal', 'Zone C');

INSERT INTO bill (bill_id, connection_id, billing_month, previous_reading, current_reading, units_consumed, amount, due_amount, bill_status, generated_by) VALUES
('BIL-202607-001', 'CON10001', '2026-07', 1420.00, 1640.00, 220.00, 680.00, 0.00, 'PAID', 'ADMIN001'),
('BIL-202607-002', 'CON10002', '2026-07', 980.00, 1140.00, 160.00, 440.00, 0.00, 'PAID', 'ADMIN001'),
('BIL-202607-003', 'CON10003', '2026-07', 5500.00, 6350.00, 850.00, 4300.00, 2000.00, 'PARTIALLY PAID', 'ADMIN001');

INSERT INTO payment (payment_id, bill_id, connection_id, payment_date, amount, payment_method, transaction_reference) VALUES
('PAY-5001', 'BIL-202607-001', 'CON10001', '2026-08-05 11:20:30', 680.00, 'UPI', 'TXN-UPI-9920193'),
('PAY-5002', 'BIL-202607-002', 'CON10002', '2026-08-06 14:10:15', 440.00, 'Net Banking', 'TXN-NB-4482011');

INSERT INTO complaint (complaint_id, connection_id, complaint_type, description, status, priority, assigned_to) VALUES
('CMP3001', 'CON10003', 'Leak', 'Main basement supply pipeline shows abnormal water pressure and visible seepage near feeder valve.', 'In Progress', 'Critical', 'ENG002 - Rajesh Nair');

-- ========================================================================
-- 4. ACID TRANSACTIONS & CONCURRENCY DEMONSTRATIONS
-- ========================================================================

-- Transaction 1: Bill Generation with SERIALIZABLE Isolation & SAVEPOINT
DELIMITER //
CREATE PROCEDURE GenerateBillTransaction(
    IN p_conn_id VARCHAR(20),
    IN p_billing_month CHAR(7),
    IN p_curr_reading DECIMAL(10,2),
    IN p_operator_id VARCHAR(20)
)
BEGIN
    DECLARE v_prev_reading DECIMAL(10,2) DEFAULT 0;
    DECLARE v_units DECIMAL(10,2) DEFAULT 0;
    DECLARE v_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_bill_count INT DEFAULT 0;

    -- Standard error handler for rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    START TRANSACTION;

    -- Acquire exclusive row lock
    SELECT current_reading INTO v_prev_reading 
    FROM bill 
    WHERE connection_id = p_conn_id 
    ORDER BY billing_month DESC LIMIT 1 
    FOR UPDATE;

    SAVEPOINT bill_check;

    -- Check for duplicate bill in cycle
    SELECT COUNT(*) INTO v_bill_count 
    FROM bill 
    WHERE connection_id = p_conn_id AND billing_month = p_billing_month;

    IF v_bill_count > 0 THEN
        ROLLBACK TO bill_check;
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Bill already exists for this connection and billing cycle.';
    END IF;

    -- Tiered Tariff Calculation:
    -- First 100 units = Rs 2/unit, 101-300 = Rs 4/unit, Above 300 = Rs 6/unit
    SET v_units = GREATEST(0, p_curr_reading - v_prev_reading);
    IF v_units <= 100 THEN
        SET v_amount = v_units * 2.00;
    ELSEIF v_units <= 300 THEN
        SET v_amount = (100 * 2.00) + ((v_units - 100) * 4.00);
    ELSE
        SET v_amount = (100 * 2.00) + (200 * 4.00) + ((v_units - 300) * 6.00);
    END IF;

    INSERT INTO bill (
        bill_id, connection_id, billing_month, previous_reading, 
        current_reading, units_consumed, amount, due_amount, bill_status, generated_by
    ) VALUES (
        CONCAT('BIL-', REPLACE(p_billing_month, '-', ''), '-', LPAD(FLOOR(RAND()*900)+100, 3, '0')),
        p_conn_id, p_billing_month, v_prev_reading, p_curr_reading, 
        v_units, v_amount, v_amount, 'UNPAID', p_operator_id
    );

    COMMIT;
END //
DELIMITER ;

-- Transaction 2: Atomic Payment Settlement with Row Lock (SELECT ... FOR UPDATE)
DELIMITER //
CREATE PROCEDURE RecordPaymentTransaction(
    IN p_bill_id VARCHAR(30),
    IN p_pay_amount DECIMAL(10,2),
    IN p_method VARCHAR(20),
    IN p_ref VARCHAR(64)
)
BEGIN
    DECLARE v_conn_id VARCHAR(20);
    DECLARE v_due_amount DECIMAL(10,2);
    DECLARE v_new_due DECIMAL(10,2);
    DECLARE v_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Row-Level Exclusive Lock to prevent Lost Updates
    SELECT connection_id, due_amount INTO v_conn_id, v_due_amount
    FROM bill
    WHERE bill_id = p_bill_id
    FOR UPDATE;

    SAVEPOINT payment_check;

    IF p_pay_amount <= 0 OR p_pay_amount > v_due_amount THEN
        ROLLBACK TO payment_check;
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Invalid payment amount against current outstanding due.';
    END IF;

    -- Insert Payment Record
    INSERT INTO payment (payment_id, bill_id, connection_id, amount, payment_method, transaction_reference)
    VALUES (CONCAT('PAY-', FLOOR(RAND()*9000)+1000), p_bill_id, v_conn_id, p_pay_amount, p_method, p_ref);

    -- Update Bill atomically
    SET v_new_due = v_due_amount - p_pay_amount;
    SET v_status = IF(v_new_due = 0, 'PAID', 'PARTIALLY PAID');

    UPDATE bill 
    SET due_amount = v_new_due, bill_status = v_status, version = version + 1
    WHERE bill_id = p_bill_id;

    COMMIT;
END //
DELIMITER ;

-- ========================================================================
-- 5. OPTIMIZED QUERIES & EXECUTION PLAN DEMONSTRATIONS
-- ========================================================================

-- Leak Detection Range Query with Aggregate Filters:
-- EXPLAIN SELECT connection_id, AVG(consumption_litres) AS avg_c, MAX(consumption_litres) AS cur_c
-- FROM meter_reading
-- WHERE reading_timestamp >= NOW() - INTERVAL 7 DAY
-- GROUP BY connection_id
-- HAVING MAX(consumption_litres) > AVG(consumption_litres) * 1.5;

-- Consumption History Query using Composite B+ Tree Index:
-- EXPLAIN SELECT * FROM meter_reading 
-- WHERE connection_id = 'CON10001' AND reading_timestamp BETWEEN '2026-08-01' AND '2026-08-31'
-- ORDER BY reading_timestamp ASC;

-- ========================================================================
-- 6. SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)
-- ========================================================================

CREATE ROLE IF NOT EXISTS billing_operator;
CREATE ROLE IF NOT EXISTS field_engineer;
CREATE ROLE IF NOT EXISTS complaint_operator;

-- Billing Operator Permissions
GRANT SELECT ON water_utility.connection TO billing_operator;
GRANT SELECT, INSERT, UPDATE ON water_utility.bill TO billing_operator;
GRANT SELECT, INSERT ON water_utility.payment TO billing_operator;
REVOKE UPDATE ON water_utility.meter_reading FROM billing_operator;

-- Field Engineer Permissions
GRANT SELECT, UPDATE ON water_utility.meter_reading TO field_engineer;
GRANT SELECT, UPDATE ON water_utility.complaint TO field_engineer;

-- Complaint Operator Permissions
GRANT SELECT ON water_utility.connection TO complaint_operator;
GRANT SELECT, INSERT, UPDATE ON water_utility.complaint TO complaint_operator;
