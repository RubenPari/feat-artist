import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { callback, login, logout } from './controllers/authController';
import authMiddleware from './middlewares/authMiddleware';

new Elysia()
  .use(swagger())
  .use(authMiddleware)
  .get('/auth/login', login)
  .get('/auth/callback', callback)
  .get('/auth/logout', logout)
  .listen(8080);
