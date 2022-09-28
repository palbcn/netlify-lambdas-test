
import crypto from 'crypto';

/*----------------------------------- crypto functions ---- */
const ALGORITHM = 'AES-128-ECB';
const KEY_ITERATIONS = 256;
const KEY_SIZE = 128;

const secret = process.env.URL_SECRET;
let key = crypto.pbkdf2Sync(secret, '', KEY_ITERATIONS, KEY_SIZE / 8, "sha256");
function encrypt(str) {
  const cipher = crypto.createCipheriv(ALGORITHM, key, null); // no iv because ecb doesn't require it
  return Buffer.concat([cipher.update(Buffer.from(str, 'utf8')), cipher.final()]).toString('base64');
}
function decrypt(str) {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, null);
  return Buffer.concat([decipher.update(Buffer.from(str, 'base64')), decipher.final()]).toString('utf8');
}


/*----------------------------------- request handler  ---- */

const DEFAULT_ID = `{ "ID": "ST", "nombre": "STAFF", "matricula": "XXXXCCC" }`

export async function getHandler(event, context) {
  // https://sablavamar.com/pk?id=O%2FxAb3kbAlXN9bPSS...GYiJDFeFYnTEw%3D%3D
  let id = event.queryStringParameters["id"];
  if (!id) return {
    statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `id parameter missing`
  }
  try {
    let decodedparms = decrypt(decodeURIComponent(id));
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: decodedparms
    }
  } catch (error) {
    return {
      statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `id parameter missing or invalid. (${error})`
    }
  }
}
export async function postHandler(event, context) {
  let parms = event.body ?? DEFAULT_ID;
  let encodedparms = encodeURIComponent(encrypt(parms));
  let relurl = `?id=${encodedparms}`;
  return {
    statusCode: 201,
    headers: {
      "Content-Type": "text/plain",
      "Location": relurl
    },
    body: encodedparms
  }
}

export async function handler(event, context) {
  if (event.httpMethod == "GET") {
    return await getHandler(event, context);
  } else if (event.httpMethod == "POST") {
    return await postHandler(event, context);
  } else {
    return { statusCode: 405, body: `${event.httpMethod} Unsupported` }
  }
}
