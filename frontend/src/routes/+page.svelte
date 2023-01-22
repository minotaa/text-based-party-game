<script>
// @ts-nocheck

  import "../app.css"
  import { onMount } from 'svelte'

  /**
     * @type {WebSocket}
     */
  let socket
    /**
     * @type {Boolean}
     */
  let disconnected
  onMount(() => {
    socket = new WebSocket("ws://localhost:3000")
    socket.addEventListener("open", ()=> {
      console.log("Opened")
    })
    socket.addEventListener("message", (message) => {
      const data = JSON.parse(message.data)
      console.log(data)
      if (data.action == 'CREATION') {
        game = data.game
      } else if (data.action == 'PLAYER_JOIN') {
        game = data.game
      } else if (data.action == 'PLAYER_LEAVE') {
        game = data.game
      }
    })
    socket.addEventListener("close", (e) => {
      disconnected = true
    })
  })

  /**
     * @type {object}
     */
  let game 

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
  function handleJoinGame(event) {
    socket.send(JSON.stringify({
      action: 'CHANGE_NAME',
      name: name
    }))
    socket.send(JSON.stringify({
      action: 'JOIN',
      invite: code
    }))
  }


    /**
     * @param {any} event
     */
  function handleCreateGame(event) {
    socket.send(JSON.stringify({
      action: 'CHANGE_NAME',
      name: name
    }))
    socket.send(JSON.stringify({
      action: 'CREATE'
    }))
  }
</script> 

<main class="pt-4 container mx-auto">
  <h1 class="font-bold text-2xl">
    text-based party game
  </h1>
  <h2 class='text-xl'>
    by <a rel="noreferrer" target="_blank" href="https://github.com/minotaa" class="text-sky-400">minota</a> & <a rel="noreferrer" target="_blank" href="https://github.com/Sensetsu" class="text-sky-400">sensetsu</a>
  </h2>
  {#if disconnected == null}
    {#if game == null}
      <h3 class="mt-6 font-bold">
        join game
      </h3>
      <input bind:value={name} required placeholder="nickname" type="username" name="username" id="username" class="mr-2 shadow-inner rounded p-2 flex-1 bg-gray-200 mt-2" />
      <input bind:value={code} required placeholder="game code" type="text" name="gameCode" id="gameCode" class="mr-2 shadow-inner rounded p-2 flex-1 bg-gray-200 mt-2" />
      <button on:click={handleJoinGame} type="submit" class="bg-green-600 hover:bg-green-700 duration-300 text-white shadow p-2 rounded">
        Join game!
      </button>
      <h3 class="mt-4 font-bold">
        create game
      </h3>
      <input bind:value={name} required placeholder="nickname" type="username" name="username" id="username" class="mr-2 shadow-inner rounded p-2 flex-1 bg-gray-200 mt-2" />
      <button on:click={handleCreateGame} type="submit" class="bg-green-600 hover:bg-green-700 duration-300 text-white shadow p-2 rounded">
        Create game!
      </button>
    {:else} 
      <h2 class="text-xl mt-2">invite code: <code class="font-mono font-bold">{game.invite}</code></h2>
      <h2 class="text-xl mb-2">players:</h2>
      <ul>
        {#each game.players as player}
          <li class="font-bold font-mono text-base rounded-lg list-disc list-inside">{player.name}</li>
        {/each}
        <li></li>
      </ul>
    {/if}
  {:else}
    <h2 class="text-xl mt-6">
      you've been disconnected from the server, reload this page to try again.
    </h2>
  {/if}
</main>

<style lang="postcss">
  @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;0,900;1,400;1,500;1,700&display=swap');
</style>