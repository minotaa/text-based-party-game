<script>
  import "../app.css"
  import { onMount } from 'svelte'

  /**
     * @type {WebSocket}
     */
  let socket
  onMount(() => {
    socket = new WebSocket("ws://localhost:3000")
    socket.addEventListener("open", ()=> {
      console.log("Opened")
    })
  })


  /**
     * @type {string}
     */
  let name
  /**
     * @type {string}
     */
  let code
    /**
     * @param {any} event
     */
  function handleSubmit(event) {
    socket.send(JSON.stringify({
      action: 'CHANGE_NAME',
      name: name
    }))
    socket.send(JSON.stringify({
      action: 'JOIN',
      invite: code
    }))
  }
</script>

<main class="pl-4 pt-4">
  <h1 class="font-bold text-2xl">
    text-based-party-game
  </h1>
  <h2 class='text-xl'>
    by <a rel="noreferrer" target="_blank" href="https://github.com/minotaa" class="text-sky-400">minota</a> & <a rel="noreferrer" target="_blank" href="https://github.com/Sensetsu" class="text-sky-400">sensetsu</a>
  </h2>
  <input bind:value={name} placeholder="nickname" type="username" name="username" id="username" class="mr-2 shadow-inner rounded p-2 flex-1 bg-gray-200 mt-2" />
  <input bind:value={code} placeholder="game code" type="text" name="gameCode" id="gameCode" class="mr-2 shadow-inner rounded p-2 flex-1 bg-gray-200 mt-2" />
  <button on:click={handleSubmit} type="submit" class="bg-green-600 hover:bg-green-700 duration-300 text-white shadow p-2 rounded">
    Join game!
  </button>
</main>

<style lang="postcss">
  @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;0,900;1,400;1,500;1,700&display=swap');
  * {
    font-family: 'Roboto', sans-serif;
  }
</style>