export async function jsonMiddleware(req, res) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  req.body = Buffer.concat(buffers).toString();

  res.setHeader("Content-type", "application/json");
}