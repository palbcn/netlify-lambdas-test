import citas from "../citas.json";
const dayms = 1000 * 60 * 60 * 24;   // 24 hours in milliseconds
export async function handler(event, context) {
  let daynum = Math.floor(Date.now() / dayms);
  let todayidx = daynum % citas.length;
  let cita = `<h1>"${citas[todayidx]}"</h1><p>PA for JI at ${todayidx} for ${daynum}.</p>`;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    },
    body: cita
  }
}
