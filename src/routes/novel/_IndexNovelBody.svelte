<script lang="ts">
  import BookCover from "$lib/components/BookCover.svelte";
  import { genreFilter } from "$lib/store/novel-page";
  import { novelsData } from "$lib/store/states";

  import { siteMetadata } from "$lib/store/states";
  import { novelCoverSubtitle, novelTitles } from "$lib/utils/novel-page";

  $: novels = ($siteMetadata?.novels || []) as string[];
</script>

<article>
  <section class="grid">
    {#each novels as novel}
      {#if !$genreFilter.length || $genreFilter.some( (genre) => $novelsData[novel].genre.includes(genre), )}
        <a href="/novel/{novel}">
          <BookCover
            title={novelTitles[novel]}
            {novel}
            showTitle={true}
            showSub={true}
            sub={novelCoverSubtitle[novel]}
          />
        </a>
      {/if}
    {/each}
  </section>
</article>

<style lang="scss">
  .grid {
    grid-template-columns: repeat(4, auto);
    grid-auto-rows: max-content;
    justify-content: start;
    align-items: start;
    gap: 1em;
    display: grid;

    a {
      display: block;
      width: auto;
    }
  }
</style>
