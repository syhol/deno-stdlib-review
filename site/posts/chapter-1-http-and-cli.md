---
layout: post.njk
title: "Chapter 1: Setup a HTTP server and CLI command router"
tags: [post]
---

## std/http/server.ts

### Picking a HTTP server function

First thing I wanted to do was to setup a HTTP server. Now I know that
`Deno.serve()` is the recommended way to do this but std/http also has its own
way of creating servers, in fact it has 6 ways of creating a server:

- `new Server({ handler, port }).listenAndServe()`
- `new Server({ handler, port }).listenAndServeTls(certFile, keyFile)`
- `new Server({ handler }).serve(Deno.listen({ port }))`
- `serveListener(handler, Deno.listen({ port }))`
- `serve(handler, { port })` (Deprecated) (also distinct from `Deno.serve()`)
- `serveTls(handler, { port })` (Deprecated)

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

I create a key pair for tls and whip up a hello world.

```typescript
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

Great lets run it.

```console
$ deno run -A main.ts
```

The process is running successfully, lets open a new shell hit it with curl:

```console
❯ curl localhost:4080
Hello world%

❯ curl https://localhost:4443 -k
Hello world%
```

It works! And it was fairly painless.

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

Now I can run a server, I want to be able to customise it with command line
options and have the ability to run other commands too. I'll create a command
router shortly but before that lets experiment with the flags module.

### Creating a greet command

Let make something basic, a greet command will do. I'll parse a few flags and
change the output accordingly:

```typescript
import { parse } from "std/flags/mod.ts";

export function greet(args: string[]) {
  const { surname, shout, friend, _ } = parse(args, {
    boolean: ["shout"],
    default: {
      shout: null,
    },
    string: ["surname", "friend"],
    alias: { s: "shout" },
    collect: ["friend"],
    negatable: ["shout"],
  });

  const name = surname ? `${_[0]} ${surname}` : _[0];
  let message = `Hello ${name}. It's really nice. To meet you. To greet you.`;
  if (friend.length > 0) {
    message += " And your friends " + friend.join(" and ") + ".";
  }
  if (shout) {
    message = message.toUpperCase();
  }
  if (shout === false) {
    message = message.toLowerCase();
  }

  console.log(message);
}

greet(Deno.args);
```

Most of the config arguments are obvious:

- `boolean` parses `--foo` into `{ foo: true }`
- `string` parses `--foo=bar` into `{ foo: "bar" }`
- `alias` lets you map short flags to long flags, like `-f` to `--foo`
- `default` lets you override a flags default value.

Then there are the less obvious ones:

- `collect` allows for multiple occurences of the flag to be collected into an
  array
- `negatable` parses a negative `--no-` version of a boolean flag to `false`,
- `--` (not used) captures everything after -- in a new field
- `stopEarly` (not used) stops parsing everything after a non option is
  encountered
- `unknown` (not used) handle unknown values

And now I can run it with some fun variations

```console
❯ deno run -A greet.ts Bob
Hello Bob. It's really nice. To meet you. To greet you.

❯ deno run -A greet.ts Bob --shout
HELLO BOB. IT'S REALLY NICE. TO MEET YOU. TO GREET YOU.

❯ deno run -A greet.ts Bob --no-shout --friend Steve --friend=Dave --friend="Chris" --friend "Tim"
hello bob. it's really nice. to meet you. to greet you. and your friends steve and dave and chris and tim.

❯ deno run -A greet.ts Bob -s --surname Mortimer
HELLO BOB MORTIMER. IT'S REALLY NICE. TO MEET YOU. TO GREET YOU.
```

### Surprises with this API

I came across a couple of surprises with this API.

Firstly the behaviour of defaults and negatable. When I implemented --shout and
--no-shout, I expected the absence of either flag to default to undefined or
null, but unstead I got false, so I had to explicitly set the default to null so
I could have 3 different behaviours. After thinking about it some more, it makes
sense to default the boolean values to always parse to booleans. Now that I've
established that booleans are always booleans, I made the assumption that
strings are always strings... right? Wrong. The absence of a string flag gives
me undefined. Again I can see how it can be rationalized, defaulting to an empty
string would catch so many people off guard. But I can't see any reason why
collect would default to anything but an empty array, however unless I define
the field as both and string and collect, I get undefined. All of the ambiguity
could be mitigated if fields are required unless we provide explicit defaults.
This leads me to my second problem.

There is no concept of required. This API has made the design choice to never
throw an error or fail, so sensible, convenient, and obvious defaults must be
chosen for each type. Unfortunatly sensible, convenient, and obvious are
sometimes at odds with one another. It's also a shame that I need to handle
missing input error handling myself. You can do some validation with the
`unknown` and `stopEarly` options but they can't provide me with required
positional arguments.

Lets look at how we could module this with a zod like API:

```typescript
import { z } from "zod";

const GreetArgs = z.object({
  positional: z.tuple([
    z.string(), // name
    z.number(), // jersey number
  ])
  flags: z.object({
    shout: z.boolean().nullable().default(null),
    surname: z.string().nullable().default(null),
    friend: z.array(z.string()).default([]),
  }),
});
```

Everything in there is valid zod code. It does lack a few features like aliases
and short flags but that could be included in a specialized API. Personally I
find this much easier to understand what the valid inputs are and what I can
expect to receive after the args are parsed.

Now onwards to create a CLI command router.

### Creating a CLI command router
