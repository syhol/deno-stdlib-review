import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import lang_typescript from "npm:highlight.js/lib/languages/typescript";

const site = lume({
  src: "site",
  dest: "site-dist",
  location: new URL("https://syhol.github.io/deno-stdlib-review/"),
});

site.use(basePath());
site.use(codeHighlight({
  languages: {
    typescript: lang_typescript,
  },
}));

export default site;
