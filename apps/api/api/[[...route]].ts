import { Hono } from "hono";
import { handle } from "hono/vercel";

import app from "../src/index";

const vercelApp = new Hono().route("/api", app);

export default handle(vercelApp);
