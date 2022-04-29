import fs from "fs/promises";

const dayms = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
let citas = ["N/A"];
(async function () {
  citas = JSON.parse(await fs.readFile("citas.json"));
})();


	export async function handler(event, context) {
    try {  

		let daynum = Math.floor(Date.now() / dayms);
		let todayidx = daynum % citas.length;
		let cita = `at ${todayidx} for ${daynum} is "${citas[todayidx]}"`;
		return {
			statusCode: 200,
			body: cita
    }
    } catch (err) {
      return {
        statusCode: 500,
        body: "500 - Big Catch - " + JSON.stringify(err)
      }
    }
	}
