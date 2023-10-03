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

  console.log({ surname, shout, friend, _ });
  const name = surname ? `${_[1]} ${surname}` : _[1];
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
