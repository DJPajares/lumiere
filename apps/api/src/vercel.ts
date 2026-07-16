import { Hono } from "hono";
import { handle } from "hono/vercel";

import app from "./index";

const vercelApp = new Hono().route("/api", app);

export default handle(vercelApp);
