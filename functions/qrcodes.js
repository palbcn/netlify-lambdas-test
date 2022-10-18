/*

function to create and decode a QR

for POST
it generates a QRcode
it returns, depending on Accept header, either a png data url encoded or a pdf

for GET
it decodes and decrypts the url to the original object
it returns either a json or a text

*/
import fs from "fs/promises"
import { encrypt, decrypt } from "./aesecb.js";
import qrcode from 'qrcode';
import { jsPDF } from "jspdf";
import { parseURLencodedForm, parseMultipartForm } from "./forms.js"


async function generatepdf(id, qr) {
  let pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "b7" });
  let imgdata = await fs.readFile('assets/logo.png', 'binary');
  pdf.addImage(imgdata, 'png', 10, 15, 105, 12.6);
  pdf.setFontSize(102);
  pdf.text(id, 10, 50);
  pdf.setFontSize(24);
  pdf.text('2022', 96, 40);
  pdf.addImage(qr, 90, 52, 26, 26);
  let arrayBuffer = pdf.output("arraybuffer");
  let buffer = Buffer.from(arrayBuffer);
  return buffer;
}

/******************************************************************************/
async function getHandler(event, context) {
  let id = event.queryStringParameters["id"];
  if (!id) return {
    statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `id parameter missing`
  }
  let accept = event.headers?.accept ?? "application/json";

  try {
    let decodedparms = decrypt(decodeURIComponent(id));
    if (accept.includes("application/json")) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: decodedparms
      }
    } else if (accept.includes("text/plain")) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/plain"
        },
        body: decodedparms
      }

    } else if (accept.includes("text/html")) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/html"
        },
        body: `<html><body>
        <p>${id}</p>
        <code>${decodedparms}</code>
        </body></html>`
      }
    } else {
      return { statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `unsupported Accept header` }
    }

  } catch (error) {
    return {
      statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `undecipherable id parameter`
    }
  }
}

/*************************************************************************/
async function postHandler(event, context) {

  let contentType = event.headers["content-type"] ?? "application/json";
  let parms = event.body ?? '';
  if (contentType == "application/json") {
    if (typeof JSON.parse(parms) !== 'object') return {
      statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `missing or invalid body`
    }
  } else if (contentType == "application/x-www-form-urlencoded") {
    parms = await parseURLencodedForm(event);
  } else if (contentType.includes("multipart/form-data")) {
    parms = await parseMultipartForm(event);
  } else return {
    statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `uninterpretable body`
  }

  let encodedparms = encodeURIComponent(encrypt(parms));
  let relurl = `?id=${encodedparms}`;
  let origin = new URL(event.rawUrl).origin;
  let absurl = `${origin}${event.path}${relurl}`;

  let accept = event.headers?.accept ?? "text/plain";
  let response = {
    statusCode: 201,
    headers: {
      "Location": absurl,
      "Content-Type": accept
    }
  }
  if (accept.includes("text/plain")) {
    response.body = encodedparms;

  } else if (accept.includes("text/html")) {
    let qrurl = await qrcode.toDataURL(absurl);
    response.body = `<img src="${qrurl}"><p>${absurl}</p>`

  } else if (accept.includes("application/pdf")) {
    let qr = await qrcode.toBuffer(absurl);
    let pdfbuffer = await generatepdf(encodedparms.id, qr);
    response.body = pdfbuffer.toString("base64");
    response.isBase64Encoded = true;

  } else if (accept.includes("image/png")) {
    let qr = await qrcode.toBuffer(absurl);
    response.body = qr.toString("base64");
    response.isBase64Encoded = true;

    /*} else if (accept == "image/svg+xml") {
              response.body = generatesvg(encodedparms); */

  } else {
    response = { statusCode: 400, headers: { "Content-Type": "text/plain" }, body: `unsupported Accept header` }
  }
  return response;
}

/*****************************************************************************/
export async function handler(event, context) {
  if (event.httpMethod == "GET") {
    return await getHandler(event, context);
  } else if (event.httpMethod == "POST") {
    return await postHandler(event, context);
  } else {
    return { statusCode: 405, body: `${event.httpMethod} Unsupported` }
  }
}
