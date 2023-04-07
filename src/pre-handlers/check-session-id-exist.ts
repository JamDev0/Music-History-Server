import { FastifyReply, FastifyRequest } from 'fastify';

export async function checkIfSessionIdExists(req: FastifyRequest, res: FastifyReply) {
  const session_id = req.cookies['music-history.session_id'];

  if(!session_id) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
}