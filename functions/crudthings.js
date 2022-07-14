
import mysql from 'mysql';
import util from 'util';

const thingsTable = 'things';
const sqlStatements = {
  selectAll: `SELECT * FROM ${thingsTable} ORDER BY id`,
  selectOne: `SELECT * FROM ${thingsTable} WHERE id=?`,
  insertOne: `INSERT INTO ${thingsTable} (name,value) VALUES (?,?)`,
  updateOne: `UPDATE ${thingsTable} SET name=?, value=? WHERE ID=?`,
  updateCoalesceOne: `UPDATE ${thingsTable} SET name=COALESCE(?, name), value=COALESCE(?, value), WHERE ID=?`,
  deleteOne: `DELETE FROM ${thingsTable} WHERE id=?`
}

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


/*----------------------------------------------------------------------*/
export async function handler(event, context) {
  let connection;

  /*-----------------------------------------*/
  async function getHandler() {
    try {
      let id = Number(event.queryStringParameters["id"]);
      let thing = await connection.query(sqlStatements.selectOne, [id]);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(thing[0])
      }
    }
    catch (e) {
      return { statusCode: 500, body: JSON.stringify({ indicator: "GET catch", error }) }
    }
  }

  /*-----------------------------------------*/
  async function postHandler() {
    let { name, value } = JSON.parse(event.body);
    try {
      let result = await connection.query(sqlStatements.insertOne, [name, value]);
      return {
        statusCode: 201,
        headers: {
          "Content-Type": "application/json",
          "Location": event.rawUrl + '?id=' + result.insertId
        },
        body: JSON.stringify({ id: result.insertId, name, value })
      }
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ indicator: "POST catch", error }) }
    }
  }

  /*-----------------------------------------*/
  async function putHandler() {
    return { statusCode: 501, body: JSON.stringify({ indicator: "PUT ", message: "Not Implemented Yet" }) }
  }
  /*-----------------------------------------*/
  async function patchHandler() {
    return { statusCode: 501, body: JSON.stringify({ indicator: "PATCH ", message: "Not Implemented Yet" }) }
  }
  /*-----------------------------------------*/
  async function deleteHandler() {
    return { statusCode: 501, body: JSON.stringify({ indicator: "DELETE ", message: "Not Implemented Yet" }) }
  }

  /*-----------------------------------------*/
  let res;
  try {
    connection = await makeAsyncConnection(connectionConfig);
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ indicator: "CONNECT catch", error: e }) }
  }

  try {
    if (event.httpMethod == "GET") {
      res = await getHandler();
    } else if (event.httpMethod == "POST") {
      res = await postHandler();
    } else if (event.httpMethod == "PUT") {
      res = await putHandler();
    } else if (event.httpMethod == "PATCH") {
      res = await patchHandler();
    } else if (event.httpMethod == "DELETE") {
      res = await deleteHandler();
    } else {
      res = { statusCode: 405, body: `${event.httpMethod} Unsupported` }
    }
  } catch (error) {
    res = { statusCode: 500, body: JSON.stringify({ indicator: "BIG catch", error }) }
  } finally {
    await connection.end();
  }
  return res;
}
