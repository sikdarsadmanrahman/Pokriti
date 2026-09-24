import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import routes from './routes/index.js';
import ApiError from './utils/ApiError.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1); // correct client IPs behind Nginx / a PaaS proxy (needed for rate limiting)
app.disable('x-powered-by');

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim());

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new ApiError(403, 'Origin not allowed by CORS')),
  })
);
app.use(compression());
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
