<script lang="ts">
  import SkeletonShell from "../SkeletonShell.svelte";

  const RANDOM_WIDTH = [40, 20, 60, 30];
</script>

<section>
  {#each Array(8).fill(0) as shells, width}
    <SkeletonShell primaryColor="#EBECEF55" secondaryColor="#F5F5F766" height="9em">
      {#each Array(4).fill(0) as svg, i}
        <rect
          width={(i + 1) % 4 === 0 ? RANDOM_WIDTH[width] + "%" : "100%"}
          height="1.35em"
          x="0"
          y="{i * 2}em"
          rx="4"
          ry="4"
        />
      {/each}
    </SkeletonShell>
  {/each}
</section>

<style lang="scss">
  section {
    max-width: var(--contentMaxWidth);
    margin-top: 2em;
  }
</style>
