import fetch from "node-fetch";
let citas = ["N/A"];
const dayms = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
console.log("main");

  (async () {
    let citasjson = process.env.CITASJSON || "/citas.json";
    citas = JSON.parse(await fetch(citasjson));  
    console.log(`read ${citas.length} citas`);    
  })();
  
	export async function handler(event, context) {
		let daynum = Math.floor(Date.now() / dayms);
		let todayidx = daynum % citas.length;
		let cita = `at ${todayidx} for ${daynum} is "${citas[todayidx]}"`;
		return {
			statusCode: 200,
			body: cita
		};
	}
