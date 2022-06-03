import citas from "../citas.json";
const dayms = 1000 * 60 * 60 * 24;   // 24 hours in milliseconds

export async function handler(event, context) {
  let daynum = Math.floor(Date.now() / dayms);
  let todayidx = daynum % citas.length;

  let wantRandom = event.queryStringParameters.random;
  if (wantRandom)
    todayidx = Math.floor(Math.random() * citas.length);

  let todaycita = citas[todayidx];
  let citahtml = `<h1>"${todaycita}"</h1><p>PA for JI at ${todayidx} for ${wantRandom ? "a random day" : "today"}.</p>`;
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
      cita: todaycita,
      meta: {
        src: "PA for JI",
        at: todayidx,
        for: wantRandom ? "a random day" : "today"
      }
    })
  }
  return event.headers.accept.includes("json") ? responsejson : responsehtml;
}
