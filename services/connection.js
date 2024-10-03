const mysql = require("mysql2/promise");
const config = require("../config");

// async function query(sql, params) {
//   const connection = await mysql.createConnection(config.db);
//   const [results] = await connection.execute(sql, params);
//   connection.end();
//   return results;
// }
const pool = mysql.createPool(config.db);

async function query(sql, params) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  query,
};
