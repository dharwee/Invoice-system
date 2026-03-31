import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import documentsRouter from './routes/document.routes.js';
import promptsRouter from './routes/prompts.routes.js';
import errorsRouter from './routes/errors.routes.js';
import analyticsRouter from './routes/analystics.routes.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/documents', documentsRouter);
app.use('/prompts', promptsRouter);
app.use('/errors', errorsRouter);
app.use('/analytics', analyticsRouter);

app.use(errorMiddleware);
export default app;