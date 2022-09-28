
import sqlite from 'sqlite3';

const connectionConfig = {
  verbose: true,
  db: null
}

async function makeAsyncConnection(config) {
  if (config.verbose) sqlite.verbose();
  let db = new sqlite.Database(config.db || './.data/things.db');
  db.getAsync = function (...args) {
    let that = this;
    return new Promise(function (resolve, reject) {
      that.get(...args, function (err, res) {
        if (err)
          reject(err);
        else
          resolve(res);
      });
    });
  }
  db.allAsync = function (...args) {
    let that = this;
    return new Promise(function (resolve, reject) {
      that.all(...args, function (err, res) {
        if (err)
          reject(err);
        else
          resolve(res);
      });
    });
  }
  db.runAsync = function (...args) {
    let that = this;
    return new Promise(function (resolve, reject) {
      that.run(...args, function (err, res) {
        if (err)
          reject(err);
        else
          resolve(res);
      });
    });
  }
  db.prepareAndRunAsync = function (sql, ...parms) {
    let stmt = this.prepare(sql);
    return new Promise(function (resolve, reject) {
      stmt.run(...args, function (err, res) {
        if (err)
          reject(err);
        else
          resolve(stmt.lastID);
      });
    });
  }

  db.lastID = async function () {
    let row = await this.getAsync('SELECT last_insert_rowid()'); return row["last_insert_rowid()"];
  }

  // Database initialization 
  let rows = await db.getAsync('SELECT name FROM sqlite_master WHERE type="table" AND name="things"');
  if (!rows)
    await db.runAsync(`CREATE TABLE things (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT UNIQUE, 
      value TEXT,
      at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
  return db;
}


async function getHandler(event, context, connection) {
  try {
    let id = event.queryStringParameters["id"];
    let things;
    if (!id)
      things = await connection.allAsync('SELECT * FROM things');
    else
      things = await connection.getAsync('SELECT * FROM things WHERE id=?', [id]);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ things })
    }
  }
  catch (e) {
    return { statusCode: 404, body: JSON.stringify(e) }
  }
}

async function postHandler(event, context, connection) {
  let { name, value } = JSON.parse(event.body);
  try {
    let result = await connection.runAsync(`INSERT INTO things (name,value) VALUES (?,?)`, [name, value]);
    let lastRowId = await connection.lastID();
    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Location": event.rawUrl + '?id=' + lastRowId
      },
      body: JSON.stringify({ id: lastRowId, name, value })
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ indicator: "POST catch", error }) }
  }
}


export async function handler(event, context) {
  let connection;
  try {
    connection = await makeAsyncConnection(connectionConfig);
  } catch (e) {
    return { statusCode: 501, body: JSON.stringify({ message: "Connection catch", error: e }) }
  }

  if (event.httpMethod == "GET") {
    return await getHandler(event, context, connection);
  } else if (event.httpMethod == "POST") {
    return await postHandler(event, context, connection);
  } else {
    return { statusCode: 405, body: `${event.httpMethod} Unsupported` }
  }
}