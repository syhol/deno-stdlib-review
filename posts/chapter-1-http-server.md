# Chapter 1: Setup a new http server that parses options

## std/http/server.ts

### Picking a http server function

First thing I wanted to do was to setup a HTTP server. Now I know that
`Deno.serve()` is the recommended way to do this but std/http also has its own
way of creating servers, in fact it has 6 ways of creating a server:

- `new Server({ handler, port }).listenAndServe()`
- `new Server({ handler, port }).listenAndServeTls(certFile, keyFile)`
- `new Server({ handler }).serve(Deno.listen({ port }))`
- `serveListener(handler, Deno.listen({ port }))`
- `serve(handler, { port })` (Deprecated) (also distinct from `Deno.serve()`)
- `serveTls(handler, { port })` (Deprecated)

I like to have a snoop in the code so I can figure out the difference, so I
write out some of these functions/methods in a new file and CMD+click on them,
only to see the following message in my VS Code:

> The editor could not be opened due to an unexpected error: Unable to resolve
> resource https://deno.land/std%400.202.0/http/server.ts

Weird, I can CMD+click on the import url and it takes me to the docs (great
feature by the way) but when I move focus back to the VS Code window I see the
same error again. I try to recreate this with some symbols in the the
https://deno.land/x/oak/mod.ts module and it works as expected. Seems like a
little bug with std then.

Most of these functions also take a `hostname` but since it defaults to all
interfaces (`0.0.0.0`) there is little need to change it. It looks like
`Server.prototype.serve` and `serveListener` listener are available if you want
to manually setup the TCP listener yourself, but thats not something I have much
need for right now.

All of those functions above make up the majority of the `std/http/server.ts`
module. All thats left is:

- `Server.prototype.addrs: Deno.Addr[]`
- `Server.prototype.closed: boolean`
- `Server.prototype.close: () => void`

I could see the close/closed members being useful for graceful shutdown, I might
explore that later.

So my requirements are that I want to serve over HTTP and HTTPs, I don't want to
use anything deprecated, and I don't need to do anything fancy with a TCP
listener. so I picked `Server.prototype.listenAndServe` and
`Server.prototype.listenAndServeTls`.

### Writing hello world

I create a key pair for tls and whip up a hello world

```javascript
import { Server } from "https://deno.land/std@0.202.0/http/server.ts";

const handler = (_: Request) => {
  return new Response("Hello world");
};

const httpServer = new Server({ port: 4080, handler });
const httpsServer = new Server({ port: 4443, handler });

await Promise.all([
  httpServer.listenAndServe(),
  httpsServer.listenAndServeTls("./tls/server.crt", "./tls/server.key"),
]);
```

Great lets run it

```
❯ deno run -A main.ts
```

The process is running successfully, lets open a new shell hit it with curl:

```
❯ curl localhost:4080
Hello world%

❯ curl https://localhost:4443 -k
Hello world%
```

### Review

If it weren't for the fact that `Deno.serve()` exists then this would be a fine
module with the exception of two things. Firstly there is no "onListen" handler
for the functions on the `Server` API which isn't the end of the world but its
something we've come to expect, and secondly there seems to be no reason to have
both `Server.prototype.serve` and `serveListener`. It feels like an unessassary
choice I need to make.

From a documentation point of view, each function and class is really nicely
explained with examples. However, there are no docs for the module itself, so
it's quite hard to know where to begin and which function choose for my
use-case.

Thanks to the fantastic `Deno.serve()` I doubt I'll ever use this module in
future.

## std/flag/mod.md

### 
