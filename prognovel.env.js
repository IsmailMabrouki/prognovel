import { readFileSync } from "fs";
import { join } from "path";
import sass from "sass";
import EnvironmentPlugin from "vite-plugin-environment";

export default () => {
  const CACHE_PATH = ".cache";
  const SITE_METADATA = JSON.parse(
    readFileSync(join(CACHE_PATH, "/assets/publish/sitemetadata.json"), "utf-8"),
  );
  const NOVELS_METADATA = (SITE_METADATA?.novels || []).reduce((result, novel) => {
    result[novel] = JSON.parse(
      readFileSync(join(CACHE_PATH, "/assets/publish", novel, "metadata.json"), "utf-8"),
    );
    return result;
  }, {});
  return EnvironmentPlugin(
    {
      BASE_PATH: process.cwd(),
      CACHE_PATH,
      SITE_TITLE: SITE_METADATA?.site_title || "ProgNovel App",
      IMAGE_RESIZER_SERVICE: SITE_METADATA?.image_resizer_service || "",
      BACKEND_API: process.env.BACKEND_API || "http://localhost",
      GA_TRACKING_ID: process.env.GA_TRACKING_ID || "",
      NOVEL_LIST: SITE_METADATA?.novels || [],

      // app vars from build time
      SITE_METADATA,
      // chunks of novels metadata
      NOVEL_TITLES: Object.keys(NOVELS_METADATA).reduce((list, novel) => {
        list[novel] = NOVELS_METADATA[novel].title;
        return list;
      }, {}),
      NOVEL_GENRES: Object.keys(NOVELS_METADATA).reduce((list, novel) => {
        list[novel] = NOVELS_METADATA[novel].genre;
        return list;
      }, {}),
      NOVEL_DEMOGRAPHICS: Object.keys(NOVELS_METADATA).reduce((list, novel) => {
        list[novel] = NOVELS_METADATA[novel].demographic;
        return list;
      }, {}),
      NOVEL_AUTHORS: Object.keys(NOVELS_METADATA).reduce((list, novel) => {
        list[novel] = NOVELS_METADATA[novel].author;
        return list;
      }, {}),
      NOVEL_TAGS: Object.keys(NOVELS_METADATA).reduce((list, novel) => {
        list[novel] = NOVELS_METADATA[novel].tags;
        return list;
      }, {}),
      NOVEL_SYNOPSISES: Object.keys(NOVELS_METADATA).reduce((list, novel) => {
        list[novel] = NOVELS_METADATA[novel].synopsis;
        return list;
      }, {}),
      CSS_VARIABLES: readCSSVariables(),
    },
    {
      defineOn: "import.meta.env",
    },
  );
};

function readCSSVariables() {
  const css = sass.renderSync({ file: "style/build-plugin/cssVariables.scss" }).css.toString();
  return {
    headerHeight: find("--header-height"),
    sidebarWidth: find("--sidebar-width"),
    foregroundColor: find("--foreground-color"),
    backgroundColor: find("--background-color"),
    foregroundColorAlpha: find("--foreground-color-alpha"),
    backgroundColorAlpha: find("--background-color-alpha"),
    textBodyColor: find("--text-body-color"),
    textHeadColor: find("--text-head-color"),
    primaryColorHue: find("--primary-color-h"),
    primaryColorSaturate: find("--primary-color-s"),
    primaryColorLight: find("--primary-color-l"),
    primaryColor: find("--primary-color"),
    primaryColorDarken1: find("--primary-color-darken-1"),
    primaryColorDarken2: find("--primary-color-darken-2"),
    primaryColorDarken3: find("--primary-color-darken-3"),
    primaryColorDarken4: find("--primary-color-darken-4"),
    primaryColorLighten1: find("--primary-color-lighten-1"),
    primaryColorLighten2: find("--primary-color-lighten-2"),
    primaryColorLighten3: find("--primary-color-lighten-3"),
    primaryColorLighten4: find("--primary-color-lighten-4"),
    mobileBodySideMargin: find("--mobile-body-side-margin"),
    mobileMenuHeight: find("--mobile-menu-height"),
    // light theme
    light_foregroundColor: find("--foreground-color", false),
    light_backgroundColor: find("--background-color", false),
    light_foregroundColorAlpha: find("--foreground-color-alpha", false),
    light_backgroundColorAlpha: find("--background-color-alpha", false),
    light_textBodyColor: find("--text-body-color", false),
    light_textHeadColor: find("--text-head-color", false),
  };

  function find(str, darkTheme = true) {
    const rawCss = darkTheme ? css : css.split("html.light")[1].split("}")[0];
    const regexResult = new RegExp(str + ":(.*)" + ";", "gm").exec(rawCss) || [];
    // if (!darkTheme) console.log(regexResult);
    return (regexResult[1] || "").trim();
  }
}
