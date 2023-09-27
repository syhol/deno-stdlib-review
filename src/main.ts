import { parse } from "std/flags/mod.ts";
import { serve } from "./commands/serve.ts";
import { help } from "./commands/help.ts";
import { greet } from "./commands/greet.ts";

export async function dispatch(args: string[]): Promise<never> {
  const parsedArgs = parse(args, {
    boolean: ["help", "shout"],
    default: {
      shout: null,
    },
    string: ["surname"],
    alias: { h: "help" },
    collect: ["friend"],
    negatable: ["shout"],
  });

  if (parsedArgs.help) {
    help();
    Deno.exit(0);
  }

  type Handler = (args: typeof parsedArgs) => void | Promise<void>;
  const commands: Record<string, Handler> = {
    serve,
    help,
    greet,
  };
  const commandName = String(parsedArgs._[0] ?? "");
  const command = commands[commandName] ?? fail;

  try {
    await command(parsedArgs);
    Deno.exit(0);
  } catch (_) {
    Deno.exit(1);
  }
}

function fail(args: { _: string[] }) {
  console.error(
    args._.length > 0
      ? `Unknown command "${args._[0]}"`
      : "Please provide a command",
  );
  help();
  Deno.exit(1);
}

if (import.meta.main) {
  await dispatch(Deno.args);
}
