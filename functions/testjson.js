
export async function handler(event, context) {
  let name = event.queryStringParameters["name"] ?? "World";
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Hello, ${name}!`,
      dice: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1],
      secret: process.env.MY_SECRET
    })
  };
}