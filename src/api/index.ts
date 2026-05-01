import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth";
import { reviewRoutes } from "./routes/reviews";

const app = new Hono().basePath("api");

app.use(
  cors({
    origin: "*",
  })
);

// Auth routes
app.on(["POST", "GET"], "/auth/**", (c) => {
  const url = new URL(c.req.url);
  const baseURL = `${url.protocol}//${url.host}`;
  const auth = createAuth(baseURL);
  return auth.handler(c.req.raw);
});

// Review routes
app.route("/reviews", reviewRoutes);

// Health check
app.get("/ping", (c) => c.json({ message: `Pong! ${Date.now()}` }));

export default app;
