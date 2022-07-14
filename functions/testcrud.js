
async function getHandler(event, context) {
  let name = event.queryStringParameters["name"] ?? process.env.MY_NAME ?? "World";
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Hello, ${name}!`
    })
  }
}

async function postHandler(event, context) {
  let name = JSON.parse(event.body ?? "{}")?.name ?? "World";
  return {
    statusCode: 201,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Hello, ${name}!`
    })
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
