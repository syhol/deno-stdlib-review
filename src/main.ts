import { parse } from "std/flags/mod.ts";
import { serve } from "./commands/serve.ts";
import { help } from "./commands/help.ts";
import { greet } from "./commands/greet.ts";

type Handler = (args: string[]) => void | Promise<void>;
const commands: Record<string, Handler> = {
  serve,
  help,
  greet,
};

export async function dispatch(args: string[]): Promise<number> {
  const parsedArgs = parse(args, {
    boolean: ["help"],
    alias: { h: "help" },
  });

  if (parsedArgs.help) {
    help();
    return 0;
  }

  const commandName = String(parsedArgs._[0] ?? "");
  const command = commands[commandName] ?? fail;

  try {
    await command(args);
    return 0;
  } catch (error) {
    console.error(error);
    return 1;
  }
}

function fail(args: string[]): number {
  const error = args.length > 0
    ? `Unknown command "${args[0]}"`
    : "Please provide a command";
  console.error(error + "\n");
  help();
  throw Error(error);
}

if (import.meta.main) {
  Deno.exit(await dispatch(Deno.args));
}
