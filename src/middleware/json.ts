import { IncomingMessage, ServerResponse } from "node:http";
import { Req } from "../server";

export async function jsonMiddleware(req: Req, res: ServerResponse<IncomingMessage>) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  req.body = Buffer.concat(buffers).toString();

  res.setHeader("Content-type", "application/json");
}