import { parse } from "https://deno.land/std@0.202.0/flags/mod.ts";
import { serve } from "./commands/serve.ts";
import { help } from "./commands/help.ts";
import { greet } from "./commands/greet.ts";

const commandArgs = {
  boolean: ["help", "shout"],
  default: {
    shout: null,
  },
  string: ["surname"],
  alias: { h: "help" },
  negatable: ["shout"],
} as const;
const commandArgsType = parse([], commandArgs);
type CommandArgs = typeof commandArgsType;

const commands: Record<string, (args: CommandArgs) => void> = {
  serve,
  help,
  greet,
};

export function dispatch(args: string[]) {
  const parsedArgs = parse(args, commandArgs);
  const command = String(parsedArgs._[0] ?? "");
  const handler = commands[command] ?? fail;
  handler(parsedArgs);
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
  dispatch(Deno.args);
}
