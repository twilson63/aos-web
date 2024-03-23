<script>
  import { Terminal } from "@xterm/xterm";
  import { Readline } from "xterm-readline";
  import { onMount } from "svelte";
  import { evaluate } from "./evaluate.js";
  import { live } from "./live.js";

  let pid = "HBBhHlCo6aBiHywXLTYOEIlbA6ixqVEhXJTg1UVnly8";

  onMount(() => {
    const t = new Terminal({
      theme: {
        background: "#FFF",
        foreground: "#191A19",
        cursor: "black",
      },
    });
    t.open(document.getElementById("live"));
    let liveMsg = "";
    // turn on live update
    const interval = setInterval(async () => {
      const msg = await live(pid);
      if (msg !== liveMsg) {
        liveMsg = msg;
        t.write(liveMsg + "\r\n");
      }
    }, 3000);
    // Create a new terminal instance
    const terminal = new Terminal({
      theme: {
        background: "#FFF",
        foreground: "#191A19",
        cursor: "black",
      },
      cursorBlink: true,
      cursorStyle: "block",
    });

    const rl = new Readline();

    // Attach the terminal to the DOM
    terminal.loadAddon(rl);
    terminal.open(document.getElementById("terminal"));
    terminal.focus();

    rl.setCheckHandler((text) => {
      let trimmedText = text.trimEnd();
      if (trimmedText.endsWith("&&")) {
        return false;
      }
      return true;
    });

    function readLine() {
      rl.read("aos> ").then(processLine);
    }

    async function processLine(text) {
      // rl.println("processing request...");
      // evaluate
      const result = await evaluate(pid, text);
      rl.println(result);
      setTimeout(readLine);
    }

    readLine();
  });
</script>

<div class="flex my-4 justify-center">
  <input
    class="border-1 p-2 w-1/2"
    type="text"
    placeholder="processid"
    bind:value={pid}
  />
</div>
<div class="flex">
  <div id="terminal" class="mx-8 w-2/3"></div>
  <div class="w-1/3">
    <h3>Feed</h3>
    <div id="live" class=""></div>
  </div>
</div>
