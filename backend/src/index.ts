import express from 'express'
import 'dotenv/config'
import WebSocket, { WebSocketServer } from 'ws'
import { uuid } from 'uuidv4'

interface Game {
  id: string,
  invite: string,
  players: string[],
  created: number,
  owner: string
}

const port = process.env.SERVER_PORT as any || 8080
const wss = new WebSocketServer({ port: port })
const clients: Map<WebSocket.WebSocket, string> = new Map()
var games: Game[] = []

function generateInvite() {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var charactersLength = characters.length
  for (var i = 0; i < 4; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function removeFromArray<T>(array: Array<T>, item: T) {
  const arr = array
  const index = arr.indexOf(item)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

function getKeyByValue<K,V>(map: Map<K,V>, searchValue: V) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
}

wss.on('connection', (ws) => {
  const id = uuid()
  clients.set(ws, id)

  ws.send(JSON.stringify({
    id: id,
    action: "REGISTER_GAME"
  }))

  ws.on('message', (msg) => {
    try {
      // Set players name when they create/join a game.
      const data = JSON.parse(msg as any)
      const id = clients.get(ws) as string
      if (data.action == "CREATE") {
        for (const game of games) {
          if (game.players.includes(clients.get(ws) as string)) {
            return ws.send(JSON.stringify({
              error: `You're already in a game.`,
              game: game
            }))
          }
        }
        const game = {
          id: uuid(),
          invite: generateInvite(),
          players: [id],
          created: Date.now(),
          owner: id
        }
        games.push(game)
        const message = {
          action: "CREATION",
          game: game
        }
        ws.send(JSON.stringify(message))
      } else if (data.action == "JOIN") {
        if (data.invite == null) {
          return ws.send(JSON.stringify({
            error: 'Invalid invite'
          }))
        }
        if ((data.invite as string).length != 4) {
          return ws.send(JSON.stringify({
            error: 'Invalid amount of characters.'
          }))
        }
        for (const game of games) {
          if (game.players.includes(clients.get(ws) as string)) {
            return ws.send(JSON.stringify({
              error: `You're already in a game.`,
              game: game
            }))
          }
        }
        let invitedGame: Game
        for (const game of games) {
          if (game.invite == data.invite) {
            invitedGame = game
            game.players.push(clients.get(ws) as string)
            const message = {
              action: "PLAYER_JOIN",
              game: game,
              new_player: clients.get(ws) as string
            }
            game.players.forEach((player: string) => {
              (getKeyByValue(clients, player) as WebSocket.WebSocket).send(JSON.stringify(message))
            })
            return
          }
        }
        ws.send(JSON.stringify({
          error: 'Invalid invite.'
        }))
      }
    } catch (e) {
      ws.send(JSON.stringify({
        error: 'Failed to receive mesage, try again.'
      }))
      console.log(e)
    }
  })

  ws.on('close', () => {
    for (const game of games) {
      if (game.players.includes(clients.get(ws) as string) && game.players.length == 1) {
        console.log(`Removing ${game.id} from games list due to empty.`)
        games = removeFromArray(games, game)
      }
      if (game.players.includes(clients.get(ws) as string)) {
        game.players = removeFromArray(game.players, clients.get(ws) as string)
      }
      if (game.owner == clients.get(ws) && game.players.length > 0) {
        game.owner = game.players[0]

        const message = {
          action: 'OWNER_CHANGE',
          game: game,
          new_owner: game.owner,
          reason: "Previous owner left the game." // Leaving in the reason so later on we can add the ability for the owner to manually transfer ownership and have the reason
                                                  // be something like "Previous owner gave you ownership."
        }
        game.players.forEach((player: any) => {
          (getKeyByValue(clients, player) as WebSocket.WebSocket).send(JSON.stringify(message))
        })
      }
    }
    clients.delete(ws)
  })
})

/*

const message = {
  action: 'KICKED',
  reason: 'Owner leaving'
}

I'm leaving this here because this is a good format for when we inevitably add a kick feature
*/