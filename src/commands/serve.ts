import { Server } from "std/http/server.ts";
import { handler } from "../http/handler.ts";
import { parse } from "std/flags/mod.ts";

export async function serve(args: string[]) {
  const options = parse(args, {
    default: {
      "http-port": 4080,
      "https-port": 4443,
    },
    string: ["http-port", "https-port"],
  });
  const httpPort = Number(options["http-port"]);
  const httpsPort = Number(options["https-port"]);

  const httpServer = new Server({ port: httpPort, handler });
  const httpsServer = new Server({ port: httpsPort, handler });

  console.log(`Running on http://localhost:${httpPort}`);
  console.log(`Running on https://localhost:${httpsPort}`);

  await Promise.all([
    httpServer.listenAndServe(),
    httpsServer.listenAndServeTls("tls/server.crt", "tls/server.key"),
  ]);
}
