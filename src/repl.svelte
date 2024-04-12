<script>
  import { Terminal } from "@xterm/xterm";
  import { FitAddon } from "@xterm/addon-fit";
  import { Readline } from "xterm-readline";
  import { onMount } from "svelte";
  import { evaluate } from "./evaluate.js";
  import { register } from "./register.js";
  import { live } from "./live.js";
  import { splash } from "./splash.js";
  import { loadBlueprint } from "./commands/blueprints.js";
  import Wallet from "./components/wallet.svelte";
  import { prompt as aosPrompt } from "./store.js";
  import { findPid } from "./query.js";

  const fitAddon = new FitAddon();

  //let pid = "HBBhHlCo6aBiHywXLTYOEIlbA6ixqVEhXJTg1UVnly8";
  export let pid = "";
  let name = "";
  let interval = null;
  let terminal = null;
  let feed = null;
  let rl = null;
  let showEditor = false;
  let connected = false;
  let Code = "";
  let editorError = "";
  let CodeElement = null;

  onMount(async () => {
    // Create a new terminal instance
    terminal = new Terminal({
      theme: {
        background: "#FFF",
        foreground: "#191A19",
        selectionForeground: "#FFF",
        selectionBackground: "#191A19",

        cursor: "black",
      },
      cursorBlink: true,
      cursorStyle: "block",
    });
    rl = new Readline();

    // Attach the terminal to the DOM
    terminal.loadAddon(rl);
    terminal.loadAddon(fitAddon);
    terminal.open(document.getElementById("terminal"));
    fitAddon.fit();
    // terminal.resize(terminal.cols, 240);
    terminal.focus();
    terminal.writeln(splash() + "\r\n");

    rl.setCheckHandler((text) => {
      let trimmedText = text.trimEnd();
      if (trimmedText.endsWith("&&")) {
        return false;
      }
      return true;
    });
    if (globalThis.arweaveWallet) {
      const permissions = await arweaveWallet.getPermissions();
      if (
        permissions.includes("SIGN_TRANSACTION") &&
        permissions.includes("ACCESS_ADDRESS")
      ) {
        connected = true;
        doLive();
      }
    }
    readLine();
  });

  function readLine() {
    rl.read($aosPrompt).then(processLine);
  }

  async function processLine(text) {
    if (text.trim().length === 0) {
      setTimeout(readLine);
      return;
    }
    const loadBlueprintExp = /\.load-blueprint\s+(\w*)/;
    if (loadBlueprintExp.test(text)) {
      const bpName = text.match(/\.load-blueprint\s+(\w*)/)[1];
      text = await loadBlueprint(bpName);
      rl.println("loading " + bpName + "...");
    }
    const loadExp = /\.load/;
    if (loadExp.test(text)) {
      showEditor = true;
      return;
    }
    if (/\.editor/.test(text)) {
      showEditor = true;
      setTimeout(() => CodeElement.focus(), 50);
      return;
    }
    // rl.println("processing request...");
    if (pid.length === 43) {
      // evaluate
      try {
        const result = await evaluate(pid, text);
        rl.println(result);
      } catch (e) {
        terminal.writeln("ERROR: " + e.message);
      }
    } else {
      rl.println("Connect to a process to get started.");
    }

    setTimeout(readLine);
  }

  async function doLive() {
    let liveMsg = "";
    const getLiveUpdates = async () => {
      const msg = await live(pid);
      if (msg !== null && msg !== liveMsg) {
        liveMsg = msg;
        liveMsg.split("\n").map((m) => terminal.writeln("\r" + m));
        terminal.write("aos> ");
      }
      setTimeout(getLiveUpdates, 5000);
    };

    // turn on live update
    setTimeout(getLiveUpdates, 500);
  }

  async function doRegister() {
    if (name.length === 0) {
      terminal.writeln("Error: Name is required!");
      return;
    }
    if (feed) {
      terminal.writeln("Status: Connecting to ao...");
    }
    try {
      pid = await register(name);
      await evaluate(pid, "ao.id").then((res) => {
        terminal.writeln("\rAOS Process: " + res);
        terminal.write($aosPrompt);
      });

      doLive();
    } catch (e) {
      terminal.writeln("Error: " + e.message);
    }
  }
  async function doConnect() {
    let result = name;
    if (result.length === 43) {
      pid = result;
    } else {
      let address = await globalThis.arweaveWallet.getActiveAddress();
      let _pid = await findPid(result, address);
      if (_pid && _pid.length === 43) {
        pid = _pid;
      } else {
        terminal.writeln("\rSpawning Process!");
        terminal.write("aos> ");

        await doRegister();
        //alert("Could not find Process!");
        return;
      }
    }
    terminal.writeln("\rReady!");
    terminal.write("aos> ");
    doLive();
  }

  async function doDisconnect() {
    pid = "";
    clearInterval(interval);
    terminal.reset();
    name = "";
    terminal.write("aos> ");
  }

  async function doLoad() {
    try {
      const result = await evaluate(pid, Code);
      rl.println(result);
      Code = "";

      showEditor = false;
      setTimeout(readLine);
    } catch (e) {
      editorError = e.message;
    }
  }
  async function cancelEditor() {
    Code = "";
    showEditor = false;
    setTimeout(readLine);
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
      placeholder="name or pid"
      bind:value={name}
    />
    <!-- <button
      class="uppercase inline-block rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
      on:click={doRegister}>create process</button
    > -->
    <button
      class="uppercase ml-2 inline-block rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
      on:click={doConnect}>CONNECT</button
    >
  {/if}
  <!-- {#if connected}
    <button
      class="uppercase ml-2 inline-block rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
      on:click={() => {
        connected = false;
        doDisconnect();
      }}>Disconnect Wallet</button
    >
  {/if} -->
</div>

<div class="flex h-screen w-full">
  <div id="terminal" class="mx-8 w-90% h-screen"></div>
</div>
{#if showEditor}
  <!-- Modal Background -->
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    id="my-modal"
  >
    <!-- Modal -->
    <div
      class="relative top-20 mx-auto p-5 border w-96 md:w-1/2 shadow-lg rounded-md bg-white"
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center pb-3">
        <p class="text-2xl font-bold">Lua Code Editor</p>
        <div
          class="cursor-pointer z-50"
          on:click={cancelEditor}
          role="button"
          tabindex="0"
          on:keydown={(e) => {
            if (e.keyCode === 13 || e.keyCode === 32) {
              cancelEditor();
            }
          }}
        >
          <svg
            class="fill-current text-black"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path
              d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
            />
          </svg>
        </div>
      </div>
      <!-- Modal Body -->
      <div class="text-center p-5 flex-auto justify-center">
        <div>
          {#if editorError}
            <div class="text-red-400">ERROR: {editorError}</div>
          {/if}

          <textarea
            id="Code"
            class="mt-2 w-full rounded-lg border-gray-200 align-top shadow-sm sm:text-sm p-2 font-mono"
            rows="20"
            placeholder="Enter code load into process..."
            bind:value={Code}
            bind:this={CodeElement}
          ></textarea>
          <label for="Code" class="block text-sm font-medium text-gray-700">
            Code Clipboard (Enter expression and press "Load" to load your
            process.)
          </label>
        </div>
      </div>
      <!-- Modal Footer -->
      <div class="p-3 mt-2 text-center space-x-4 md:block">
        <button
          on:click={() => {
            Code = "";
            setTimeout(() => CodeElement.focus(), 50);
          }}
          class="mb-2 md:mb-0 border border-gray-300 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100"
        >
          Clear
        </button>
        <button
          class="mb-2 md:mb-0 bg-blue-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-blue-600"
          on:click={doLoad}
        >
          Load
        </button>
      </div>
    </div>
  </div>
{/if}
{#if !connected}
  <Wallet bind:connected />
{/if}
