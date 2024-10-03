const { query } = require("./connection");
const helper = require("../helper");
const config = require("../config");

async function getHospitals(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await query(
    `SELECT facility_id, facility_code, facility_name, created_at, updated_at 
      FROM tbl_hospitals LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data: data,
    ...meta,
  };
}

async function createHospital(payload) {
  const result = await query(
    `INSERT INTO tbl_hospitals 
      (facility_name, facility_code) 
      VALUES 
      (${payload.facility_name}, ${payload.facility_code})`
  );

  let message = "Error in creating programming language";

  if (result.affectedRows) {
    message = "Programming language created successfully";
  }

  return { message };
}

async function updateHospital(id, payload) {
  const result = await query(
    `UPDATE tbl_hospitals 
    SET facility_name="${payload.name}", facility_code=${payload.facility_code}, status=${payload.status}
    WHERE facility_id=${id}`
  );

  let message = "Error in updating hospital";

  if (result.affectedRows) {
    message = "Hospital updated successfully";
  }

  return { message };
}

module.exports = {
  getHospitals,
  createHospital,
  updateHospital,
};
