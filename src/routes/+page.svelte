<script lang="ts">
  import { onMount, setContext } from "svelte";
  import GenerateHTML from "$lib/components/_HTML.svelte";
  import HomeNovels from "$lib/components/home-page/HomeNovels.svelte";
  import HomeShortcut from "$lib/components/home-page/HomeShortcut.svelte";
  import LazyComponentsSkeletonShell from "$lib/components/home-page/_LazyComponentsSkeletonShell.svelte";
  import { loadHomepageLazyComponents } from "$lib/utils/preload.js";
  import { page, siteMetadata } from "$lib/store/states";
  import NavMobile from "$lib/components/NavMobile.svelte";
  import HomeHero from "$lib/components/home-page/HomeHero.svelte";
  import { SITE_TITLE } from "$lib/_setting";
  import { fetchSiteMetadata } from "$lib/utils/fetch-metadata";
  import type { NovelMetadata, NovelsMetadata, SiteMetadata, Bookmark } from "$typings";

  interface PreloadData {
    status: number;
    message?: string;
    fresh?: boolean;
    novels?: string[];
    bookmarkData?: Bookmark[];
  }

  export let data;

  $: novelList = data.novelList as string[];
  $: sitemetadata = data.sitemetadata as SiteMetadata & PreloadData;
  $: novelsMetadata = data.novelsMetadata as NovelsMetadata;
  $: bookmarkData = data.bookmarkData as Bookmark[];

  setContext("data_static", {
    siteMetadata: sitemetadata,
    novelsMetadata: novelsMetadata,
  });

  $: setContext("data", {
    siteMetadata: $siteMetadata,
    page: $page,
  });

  onMount(async () => {
    if (!sitemetadata.fresh) fetchSiteMetadata();
  });
</script>

<svelte:head>
  <title>Home | {SITE_TITLE}</title>
</svelte:head>
<NavMobile />
<div class="container">
  <HomeShortcut {bookmarkData} />
  <div class="page-content">
    <div class="hero-container">
      <section class="hero">
        <!-- <h1>{SITE_TITLE}</h1> -->
        <HomeHero />
        <HomeNovels {novelsMetadata} grid={"novels"} />
      </section>
    </div>
  </div>
</div>

<div class="lazy-component">
  <!-- load lazy components -->
  {#await loadHomepageLazyComponents()}
    <LazyComponentsSkeletonShell />
  {:then component}
    <svelte:component this={component} />
  {/await}
</div>

<GenerateHTML />

<style lang="scss">
  @import "style/homepage/base.scss";

  .lazy-component {
    --hero-bg: hsl(var(--primary-color-h), 85%, 35%);
    width: calc(100% - var(--shortcut-width));
    left: var(--shortcut-width);
    position: relative;

    @include screen("tablet") {
      width: 100%;
      left: 0;
      margin: 0 auto;
    }

    @include screen("small-mobile") {
      width: 100%;
      left: 0;
      margin: 0 auto;
    }
  }
</style>
