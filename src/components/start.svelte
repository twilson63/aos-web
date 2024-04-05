<script>
</script>

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
      <p class="text-2xl font-bold">Connect Wallet</p>
      <!-- <button
        class="cursor-pointer z-50"
        on:click={() => {
          show = true;
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
      </button> -->
    </div>
    <!-- Modal Body -->
    <div class="text-center p-5 flex-auto justify-center">
      <div>
        <label
          for="nameOrPid"
          class="block text-sm font-medium text-gray-700 mb-16"
        >
          Connect or Create AOS Process
        </label>
        <input
          type="nameOrPid"
          id="nameOrPid"
          placeholder="process name or pid"
          class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
        />
        <button
          on:click={() => null)}
          class="mb-2 md:mb-0 bg-blue-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-blue-600"
        >
          CONNECT
        </button>
        <button
        class="mb-2 md:mb-0 bg-blue-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-blue-600"
        >
          ADVANCED OPTIONS
        </button>
      </div>
    </div>
  </div>
</div>
