
export function handler(event, context, callback) {
  callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: `{
      "message":"No worries, all is working fine!"
    }`
  })
}