export function greet(
  { _: args, shout, surname }: {
    _: (string | number)[];
    shout: boolean | null;
    surname?: string;
  },
) {
  const name = surname ? `${args[1]} ${surname}` : args[1];
  let message = `Hello ${name}. It's really nice. To meet you. To greet you.`;
  if (shout) {
    message = message.toUpperCase();
  }
  if (shout === false) {
    message = message.toLowerCase();
  }
  console.log(message);
}
