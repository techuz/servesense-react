import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);

// Module routes will be mounted here as they ship:
// app.use('/api/restaurant', restaurantRouter); // M2
// app.use('/api/outlets', outletsRouter);       // M2
// ...

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[server] ServeSense API listening on http://localhost:${env.PORT}`);
  console.log(`[server] CORS origin: ${env.CORS_ORIGIN}`);
});
