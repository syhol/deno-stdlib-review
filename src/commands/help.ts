export function help() {
  console.error(`Deno Stdlib Review
  
    Usage:
      deno run -A src/main.ts serve
      deno run -A src/main.ts greet <name> --shout --no-shout --surname
      deno run -A src/main.ts help
    
    Options:
      -h --help     Show this screen.
      --shout       Greet in all uppercase
      --no-shout    Greet in all lowercase
      --surname     Greet you with your surname
    `);
}
