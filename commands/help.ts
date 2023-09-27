export function help() {
  console.error(`Deno Stdlib Review
  
    Usage:
      deno run -A main.ts serve
      deno run -A main.ts hello <name> --shout --no-shout --surname
    
    Options:
      -h --help     Show this screen.
      --shout       Greet in all uppercase
      --no-shout    Greet in all lowercase
      --surname     Greet you with your surname
    `);
}
