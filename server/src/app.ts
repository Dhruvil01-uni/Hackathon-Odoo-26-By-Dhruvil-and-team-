import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { sendSuccess } from "./utils/api-response";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin ?? true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  return sendSuccess(res, "TransitOps API is healthy", {
    status: "ok",
    environment: env.nodeEnv,
  });
});

app.use(apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
