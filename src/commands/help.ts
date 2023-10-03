export function help() {
  console.error(`Deno Stdlib Review
  
    Usage:
      deno run -A src/main.ts serve --http-port=<port> --https-port=<port>
      deno run -A src/main.ts greet <name> --shout -s --no-shout --surname=<surname> --help
      deno run -A src/main.ts help
    
    Options:
      -h --help     Show this screen.
      -s --shout    Greet in all uppercase
      --no-shout    Greet in all lowercase
      --surname     Greet you with your surname
      --http-port=<port>
      --https-port=<port>
    `);
}
