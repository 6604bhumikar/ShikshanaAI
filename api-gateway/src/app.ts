import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import axios from "axios";
import jwt from "jsonwebtoken";
import { verifyJWT } from "./middleware/jwt.middleware";
import { assignRequestId } from "./middleware/requestId.middleware";

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(assignRequestId);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

const proxyJson = async (
  req: any,
  res: express.Response,
  targetUrl: string
) => {
  const response = await axios({
    method: req.method,
    url: targetUrl,
    data: req.body,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": req.user?.userId,
      "x-user-role": req.user?.role,
    },
  });

  return res.status(response.status).json(response.data);
};

const proxyBinary = async (
  req: any,
  res: express.Response,
  targetUrl: string
) => {
  const response = await axios({
    method: req.method,
    url: targetUrl,
    data: req.body,
    responseType: "arraybuffer",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": req.user?.userId,
      "x-user-role": req.user?.role,
    },
  });

  if (response.headers["content-type"]) {
    res.setHeader("Content-Type", response.headers["content-type"]);
  }

  if (response.headers["content-disposition"]) {
    res.setHeader("Content-Disposition", response.headers["content-disposition"]);
  }

  return res.status(response.status).send(response.data);
};

const handleAxiosError = (res: express.Response, error: any, fallbackMessage: string) => {
  if (error.response) {
    const contentType = error.response.headers?.["content-type"];
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    return res.status(error.response.status).send(error.response.data);
  }

  return res.status(500).json({ message: fallbackMessage });
};

app.use("/api/auth", async (req: any, res) => {
  try {
    const targetPath = req.originalUrl.replace("/api/auth", "");
    const response = await axios({
      method: req.method,
      url: `http://localhost:5001${targetPath}`,
      data: req.body,
      headers: { "Content-Type": "application/json" },
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    handleAxiosError(res, error, "Auth service unavailable");
  }
});

app.use("/api/public", async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
      } catch {
        console.warn("[gateway] Ignoring invalid optional public auth token");
      }
    }

    const targetPath = req.originalUrl.replace("/api/public", "");
    const response = await axios({
      method: req.method,
      url: `http://localhost:5002${targetPath}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": req.user?.userId,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    handleAxiosError(res, error, "Public content service unavailable");
  }
});

app.use(verifyJWT);

app.use("/api/teacher", async (req: any, res) => {
  try {
    const targetPath = req.originalUrl.replace("/api/teacher", "");
    await proxyJson(req, res, `http://localhost:5002${targetPath}`);
  } catch (error: any) {
    handleAxiosError(res, error, "Content service unavailable");
  }
});

app.use("/api/student", async (req: any, res) => {
  try {
    const path = req.originalUrl.replace("/api/student", "");

    if (path.startsWith("/enroll")) {
      return await proxyJson(req, res, `http://localhost:5004${path}`);
    }

    if (
      path.startsWith("/payments") ||
      path.startsWith("/orders")
    ) {
      const targetUrl = `http://localhost:5005${path}`;
      if (path.endsWith("/invoice") || path.endsWith("/invoice/download")) {
        return await proxyBinary(req, res, targetUrl);
      }

      return await proxyJson(req, res, targetUrl);
    }

    if (path.startsWith("/certificates")) {
      const targetUrl = `http://localhost:5002${path}`;
      if (path.endsWith("/download")) {
        return await proxyBinary(req, res, targetUrl);
      }

      return await proxyJson(req, res, targetUrl);
    }

    return await proxyJson(req, res, `http://localhost:5002${path}`);
  } catch (error: any) {
    handleAxiosError(res, error, "Student route failed");
  }
});

app.use("/api/admin", async (req: any, res) => {
  try {
    const targetPath = req.originalUrl.replace("/api/admin", "");
    await proxyJson(req, res, `http://localhost:5003${targetPath}`);
  } catch (error: any) {
    handleAxiosError(res, error, "Admin service unavailable");
  }
});

app.use("/api/payment", async (req: any, res) => {
  try {
    const targetPath = req.originalUrl.replace("/api/payment", "");
    await proxyJson(req, res, `http://localhost:5005${targetPath}`);
  } catch (error: any) {
    handleAxiosError(res, error, "Payment service unavailable");
  }
});

app.use("/api/media", async (req: any, res) => {
  try {
    const targetPath = req.originalUrl;
    await proxyJson(req, res, `http://localhost:5006${targetPath}`);
  } catch (error: any) {
    handleAxiosError(res, error, "Media service unavailable");
  }
});

export default app;
