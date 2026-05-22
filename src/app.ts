import express, { type Application } from 'express';
import CookieParser from 'cookie-parser';
import logger from './middleware/logger';
import cors from 'cors';
import globalErrorHandler from './middleware/globalErrorHandler';

const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(cors())

app.get("/", (req, res) => {
  res.status(200).json(
    {
      message: "Welcome to DevPulse API",
      timestamp: new Date().toUTCString()
    }
  );
});


app.use(globalErrorHandler);

export default app;