
import mysql from 'mysql';
import util from 'util';

const connectionConfig = {
  host: process.env.HEVAPPS_HOST,
  port: process.env.HEVAPPS_PORT,
  user: process.env.HEVAPPS_USER,
  password: process.env.HEVAPPS_PASSWORD,
  database: process.env.HEVAPPS_DB
}

async function makeAsyncConnection(config) {
  const connection = mysql.createConnection(config);
  await util.promisify(connection.connect.bind(connection))();
  let asyncConnection = {
    connection,
    query: function (sql, args) {
      return util.promisify(connection.query)
        .call(connection, sql, args);
    },
    end: function () {
      return util.promisify(connection.end).call(connection);
    }
  }
  return asyncConnection;
}


export async function handler(event, context) {
  let connection;
  let result;
  try {
    connection = await makeAsyncConnection(connectionConfig);
  } catch (e) {
    return { statusCode: 501, body: JSON.stringify({ message: "Connection catch", error: e }) }
  }
  try {
    let id = event.queryParameters
    let things = await connection.query('SELECT * FROM things', []);
    result = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ things })
    }
  }
  catch (e) {
    result = { statusCode: 503, body: JSON.stringify(e) }
  } finally {
    await connection.end();
  }
  return result;
}