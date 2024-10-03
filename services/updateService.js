const { query } = require("./connection");
const helper = require("../helper");
const config = require("../config");

async function getHospitalUpdates(page = 1) {
  let limit = 1;
  if (page) {
    limit = page;
  }
  const offset = helper.getOffset(limit, config.listPerPage);
  const rows = await query(
    `SELECT up.update_id,up.update_description,up.progress,up.facility_id,up.status,up.created_at,up.updated_at,ho.facility_code,ho.facility_name FROM tbl_updates  as up LEFT JOIN tbl_hospitals as ho ON up.facility_id = ho.facility_id  LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data: data,
    ...meta,
  };
}

async function getHospitalSpecifiedUpdates(page = 1, facility_code) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await query(
    `SELECT * FROM tbl_updates LEFT JOIN tbl_hospitals ON tbl_updates.facility_id = tbl_hospitals.facility_id WHERE facility_code='${facility_code}' AND progress='pending' LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data: data,
    ...meta,
  };
}

// async function getHospitalSpecifiedUpdates(page = 1, facility_code) {
//   const offset = helper.getOffset(page, config.listPerPage);
//   const rows = await query(
//     `SELECT * FROM tbl_updates LEFT JOIN tbl_hospitals ON tbl_updates.facility_id = tbl_hospitals.facility_id WHERE facility_code='${facility_code}' LIMIT ${offset},${config.listPerPage}`
//   );
//   const data = helper.emptyOrRows(rows);
//   const meta = { page };

//   return {
//     data: data,
//     ...meta,
//   };
// }

async function updateHospitalSpecificUpdate(facility, payload) {
  const fetchFacility = await query(
    `SELECT facility_id FROM tbl_hospitals WHERE facility_code='${facility}'`
  );
  if (fetchFacility.length) {
    let facility_id = fetchFacility[0]?.facility_id;
    const result = await query(
      `UPDATE tbl_updates 
    SET progress='${payload.progress}', status='${payload.status}'
    WHERE facility_id=${facility_id} AND status='active'`
    );
    return {
      ...result,
    };
  } else {
    throw new Error(`FACILITY CODE ${facility} NOT FOUND`);
  }
}

async function addHospitalUpdate(facility, res) {
  const fetchFacility = await query(
    `SELECT facility_id FROM tbl_hospitals WHERE facility_code='${facility}'`
  );
  let result = { message: `FACILITY CODE ${facility} NOT FOUND` };
  console.log(fetchFacility.length);
  console.log(facility);

  if (fetchFacility.length) {
    let facility_id = fetchFacility[0]?.facility_id;
    console.log(new Date().toISOString());
    res.json(
      await query(
        `INSERT INTO tbl_updates(facility_id) VALUES (${facility_id});`
      )
    );
  } else {
    res.status(404).send(`FACILITY CODE ${facility} NOT FOUND`);
  }

  // const result = await query(
  //   `UPDATE tbl_updates
  //   SET progress='${payload.progress}', status='${payload.status}'
  //   WHERE update_id=${id}`
  // );
}

async function uploadEncryptedzip(res, body, filePath) {
  const currentDate = helper.formatDateTimeForDb(new Date());

  try {
    let insertQuery = `INSERT INTO tbl_builds(uuid,encrypted_path,created_at,updated_at) VALUES ('${Date.now()}','${filePath}','${currentDate}','${currentDate}')`;
    const insertEncrypted = await query(insertQuery);
    if (insertEncrypted.affectedRows > 0) {
      res.status(200).send({ message: "File uploaded successfully!" });
    } else {
      res.status(500).json({ error: "Insertion failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Query Failed", error: error });
  }
}

async function uploadBuildzip(res, body = null, filePath) {
  const currentDate = helper.formatDateTimeForDb(new Date());

  try {
    const fetchBuild = await query(
      `SELECT build_id FROM tbl_builds ORDER BY build_id DESC LIMIT 1`
    );
    if (fetchBuild.length) {
      let build = fetchBuild[0];
      let queryBuild = `UPDATE tbl_builds set build_path='${filePath}', updated_at='${currentDate}' `;
      if (body?.description) {
        queryBuild += `, description=${body?.description} `;
      }
      queryBuild += `WHERE build_id=${build.build_id}`;
      const insertBuild = await query(queryBuild);
      if (insertBuild.affectedRows > 0) {
        res.status(200).send({ message: "File uploaded successfully!" });
      } else {
        res.status(500).json({ error: "Build Insertion failed" });
      }
    } else {
      res.status(500).json({ error: "Please upload encrypted first" });
    }
  } catch (error) {
    res.status(500).json({ message: "Query Failed", error: error });
  }
}

async function bulkInsert(res) {
  const fetchFacility = await query(`SELECT facility_id FROM tbl_hospitals;`);

  let bulkInsertquery = "INSERT INTO tbl_updates(facility_id) VALUES";
  if (fetchFacility.length) {
    await query(`DELETE from tbl_updates where status='active';`);
    fetchFacility.forEach((val, index) => {
      bulkInsertquery += `(${val.facility_id})`;
      if (index != fetchFacility.length - 1) {
        bulkInsertquery += ", ";
      } else {
        bulkInsertquery += ";";
      }
    });
    res.json(await query(bulkInsertquery));
  } else {
    res.status(404).send(`NO FACILITIES FOUND`);
  }
}

const getBuilds = async (body, res) => {
  const { page, uuid } = body;

  const offset = helper.getOffset(page || 1, config.listPerPage);
  let queryStatement = `SELECT uuid , description,status , created_at as build_date from tbl_builds `;
  queryStatement += `WHERE uuid > ${uuid || 0}`;
  queryStatement += ` ORDER BY uuid desc`;
  queryStatement += ` LIMIT ${offset},${config.listPerPage}`;
  const rows = await query(queryStatement);
  const data = helper.emptyOrRows(rows);
  const meta = {
    page: page || 1,
    offset: offset,
    listPerPage: config.listPerPage,
  };
  return {
    data: data,
    ...meta,
  };
};

const getSingleBuild = async (body, res) => {
  const { uuid } = body;

  let queryStatement = `SELECT uuid, description,status , created_at as build_date, build_path,encrypted_path from tbl_builds `;
  queryStatement += `WHERE uuid = ${uuid}`;

  const rows = await query(queryStatement);
  const data = helper.emptyOrRows(rows);

  return data;
};

module.exports = {
  getHospitalUpdates,
  getHospitalSpecifiedUpdates,
  updateHospitalSpecificUpdate,
  addHospitalUpdate,
  bulkInsert,
  uploadEncryptedzip,
  uploadBuildzip,
  getBuilds,
  getSingleBuild,
};
