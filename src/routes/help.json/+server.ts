// @migration task: Check imports
import { globbySync } from "globby";
import fm from "front-matter";
import { readFileSync } from "fs";
import { join, resolve } from "path";

const thisDir = "src/routes/help";
const thisDirSlug = (slug: string) => "src/routes/help/" + slug;
const folders = globbySync(thisDirSlug("") + "*/+page.svx").map((p) => p.replace("/+page.svx", ""));
let pages = globbySync(thisDir + "**/*/+page.svx").map(
  (s) => s.split("/help/")[1].split("/+page.svx")[0],
);
// .filter((page) => page.endsWith(".svx") && !page.startsWith("+page."));
// .filter((page) => page.endsWith(".svx"));

const pagesOrder = pages.map((page: string): number => {
  const path = join(import.meta.env.BASEPATH || "", thisDir, page, "+page.svx");
  const frontmatter = fm(readFileSync(path, "utf-8"));

  return (frontmatter.attributes as any)?.order ?? 99999;
});

pages = pages.sort((a: string, b: string): number => {
  const a_order = pagesOrder[pages.findIndex((s) => s === a)];
  const b_order = pagesOrder[pages.findIndex((s) => s === b)];
  return a_order - b_order;
});

export async function GET() {
  const result = pages.reduce(
    (prev: any, cur: string) => {
      // get id by slicing the .svx format
      const id = cur;
      const file = join(import.meta.env.BASEPATH || "", thisDir, cur, "+page.svx");
      prev.parent[id] = {
        href: `/help/${id}`,
        title: (fm(readFileSync(file, "utf-8")).attributes as any).title || id,
      };
      return prev;
    },
    {
      parent: {},
      children: {},
    },
  );
  result.children = folders.reduce((prev, cur) => {
    const childMarkdowns = globbySync(cur + "/**/+page.svx").filter(
      (p) => p !== cur + "/+page.svx",
    );
    const slug = cur.split("help/")[1];
    if (childMarkdowns.length) prev[slug] = {};
    childMarkdowns.forEach((child) => {
      const childSlug = child.split("routes/")[1].split("/+page.svx")[0];
      prev[slug][childSlug.split("/").slice(-1)] = {
        title:
          (fm(readFileSync(join(import.meta.env.BASEPATH || "", child), "utf-8")).attributes as any)
            .title || childSlug.split("/").slice(-1),
        href: "/" + childSlug.replace("+page.svx", ""),
      };
    });
    return prev;
  }, {});

  return new Response(JSON.stringify(result));
}
