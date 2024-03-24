<script>
  import { Terminal } from "@xterm/xterm";
  import { Readline } from "xterm-readline";
  import { onMount } from "svelte";
  import { evaluate } from "./evaluate.js";
  import { register } from "./register.js";
  import { live } from "./live.js";

  //let pid = "HBBhHlCo6aBiHywXLTYOEIlbA6ixqVEhXJTg1UVnly8";
  let pid = "";
  let name = "";
  let interval = null;
  let terminal = null;
  let feed = null;

  onMount(() => {
    // Create a new terminal instance
    terminal = new Terminal({
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

  async function doLive() {
    feed = new Terminal({
      theme: {
        background: "#FFF",
        foreground: "#191A19",
        cursor: "black",
      },
    });
    feed.open(document.getElementById("live"));
    let liveMsg = "";
    // turn on live update
    interval = setInterval(async () => {
      const msg = await live(pid);
      if (msg !== null && msg !== liveMsg) {
        liveMsg = msg;
        feed.write(liveMsg + "\r\n");
      }
    }, 3000);
  }

  async function doRegister() {
    pid = await register(name);
    doLive();
  }
  async function doConnect() {
    pid = prompt("PID: ");
    doLive();
  }

  async function doDisconnect() {
    pid = "";
    clearInterval(interval);
    terminal.reset();
    feed.reset();
    terminal.write("aos> ");
  }
</script>

<div class="flex my-4 justify-center my-4">
  {#if pid}
    <input
      class="border-1 p-2 w-1/2"
      type="text"
      placeholder="processid"
      bind:value={pid}
    />
    <button
      class="ml-2 inline-block rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
      on:click={doDisconnect}>Disconnect</button
    >
  {:else}
    <input
      class="border-1 px-2 mr-4"
      type="text"
      placeholder="name"
      bind:value={name}
    />
    <button
      class="inline-block rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
      on:click={doRegister}>create process</button
    >
    <button
      class="ml-2 inline-block rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
      on:click={doConnect}>Connect to Process</button
    >
  {/if}
</div>

<div class="flex display-none">
  <div id="terminal" class="mx-8 w-2/3"></div>
  <div class="w-1/3">
    <h3>Feed</h3>
    <div id="live" class=""></div>
  </div>
</div>
