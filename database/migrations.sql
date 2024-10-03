DELIMITER //

-- Procedure to create tbl_builds if it doesn't exist
CREATE PROCEDURE create_tbl_builds_if_not_exists()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'ehms_update_service' 
    AND table_name = 'tbl_builds'
  ) THEN
    CREATE TABLE tbl_builds (
      build_id INT AUTO_INCREMENT PRIMARY KEY,
      description TEXT,
      encrypted_path VARCHAR(255),
      build_path VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  END IF;
END;
//

-- Procedure to create tbl_updates if it doesn't exist
CREATE PROCEDURE create_tbl_updates_if_not_exists()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'ehms_update_service' 
    AND table_name = 'tbl_updates'
  ) THEN
    CREATE TABLE tbl_updates (
      update_id INT AUTO_INCREMENT PRIMARY KEY,
      update_description VARCHAR(255),
      progress VARCHAR(255) NOT NULL DEFAULT 'pending',
      facility_id INT,
      build_id INT,
      status VARCHAR(255) NOT NULL DEFAULT 'active',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (facility_id) REFERENCES tbl_hospitals(facility_id), 
      FOREIGN KEY (build_id) REFERENCES tbl_builds(build_id) 
    );
  END IF;
END;
//
-- This is yet to be implemented
CREATE PROCEDURE addUUIDColumnToTBLBuilds()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'ehms_update_service' 
    AND table_name = 'tbl_builds'
  ) THEN
  ALTER TABLE tbl_builds ADD COLUMN UUID INT NULL
  END IF;
END;
//

DELIMITER ;

-- Call the stored procedures to create tables if they don't exist
CALL create_tbl_builds_if_not_exists();
CALL create_tbl_updates_if_not_exists();