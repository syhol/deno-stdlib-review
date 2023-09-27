import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";

const site = lume({
  src: "site",
  dest: "site-dist",
  location: new URL("https://syhol.github.io/deno-stdlib-review/"), // ← Note the path /blog/
});

site.use(basePath());

export default site;
