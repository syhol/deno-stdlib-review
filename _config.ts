import lume from "lume/mod.ts";

const site = lume({
  dest: "docs",
  location: new URL("https://syhol.github.io/deno-stdlib-review/"), // ← Note the path /blog/
});

export default site;
