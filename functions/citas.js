
import citas from "../citas.json";

const DAYMS = 1000 * 60 * 60 * 24;   // 24 hours in milliseconds

export async function handler(event, context) {
  let daynum = Math.floor(Date.now() / DAYMS);
  let wantRandom = event.queryStringParameters.random;  // is "random" in the query parameters

  let todayidx = wantRandom ? Math.floor(Math.random() * citas.length) : daynum % citas.length;
  let todaycitatxt = citas[todayidx];
  let [_, cita, autor] = /(.*)\((.*)\)$/.exec(todaycitatxt);

  let citahtml = `<h1>"${cita}"</h1><h2>${autor}</h2><p>PA for JI at ${todayidx} for ${wantRandom ? "a random day" : "today"}.</p>`;
  let responsehtml = {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    },
    body: citahtml
  }
  let responsejson = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cita,
      autor,
      meta: {
        src: "PA for JI",
        at: todayidx,
        for: wantRandom ? "a random day" : "today"
      }
    })
  }
  let accept = event.headers?.accept ?? "text/html";
  return accept.includes("json") ? responsejson : responsehtml;
}
