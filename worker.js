import serverless from "serverless-http";
import app from "./app.js";

const handler = serverless(app);

export default {
  async fetch(request, env, ctx) {
    // Inject Cloudflare Worker environment secrets into process.env dynamically
    if (env) {
      for (const key in env) {
        if (typeof env[key] === "string") {
          process.env[key] = env[key];
        }
      }
    }
    return handler(request, env, ctx);
  },
};
