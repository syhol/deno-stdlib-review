import { Server } from "https://deno.land/std@0.202.0/http/server.ts";
import { handler } from "../http/handler.ts";

export async function serve() {
  const httpServer = new Server({ port: 4080, handler });
  const httpsServer = new Server({ port: 4443, handler });

  console.log("Running on http://localhost:4080");
  console.log("Running on https://localhost:4443");

  await Promise.all([
    httpServer.listenAndServe(),
    httpsServer.listenAndServeTls("tls/server.crt", "tls/server.key"),
  ]);
}
