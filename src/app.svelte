<script>
  import { Route, router } from "tinro";
  import Repl from "./repl.svelte";

  router.mode.hash();
</script>

<Route path="/">
  <Repl />
</Route>
<Route path="/:pid" let:meta>
  <Repl pid={meta.params.pid} />
</Route>
