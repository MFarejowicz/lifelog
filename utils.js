const mysql = require('mysql');
const { dbCredentials } = require('./credentials');

// Connect to the database
const connection = mysql.createConnection({
	host: dbCredentials.host,
	user: dbCredentials.user,
	password: dbCredentials.password,
	database: dbCredentials.database
});

const noParamQuery = (dbRequest) => {
  return new Promise((resolve, reject) => {
    connection.query(dbRequest, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const paramQuery = (dbRequest, params) => {
  return new Promise((resolve, reject) => {
    connection.query(dbRequest, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  noParamQuery,
  paramQuery,
};
