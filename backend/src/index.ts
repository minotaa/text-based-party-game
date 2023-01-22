import express from 'express'
import 'dotenv/config'
import WebSocket, { WebSocketServer } from 'ws'
import { uuid } from 'uuidv4'

const port = process.env.SERVER_PORT as any || 8080
const wss = new WebSocketServer({ port: port })
const clients = new Map()
var games: any[] = []

function generateInvite() {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var charactersLength = characters.length
  for (var i = 0; i < 4; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function removeFromArray(array: Array<any>, item: any) {
  const arr = array
  const index = arr.indexOf(item)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

function getByValue(map: any, searchValue: any) {
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
      const data = JSON.parse(msg as any)
      const id = clients.get(ws)
      if (data.action == "CREATE") {
        for (const game of games) {
          if (game.players.includes(clients.get(ws))) {
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
          created: Date.now()
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
          if (game.players.includes(clients.get(ws))) {
            return ws.send(JSON.stringify({
              error: `You're already in a game.`,
              game: game
            }))
          }
        }
        let invitedGame
        for (const game of games) {
          if (game.invite == data.invite) {
            invitedGame = game
            game.players.push(clients.get(ws))
            const message = {
              action: "PLAYER_JOIN",
              game: game,
              new_player: clients.get(ws)
            }
            game.players.forEach((player: any) => {
              (getByValue(clients, player)).send(JSON.stringify(message))
            })
            return
          }
        }
        ws.send('Invalid invite')
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
      if (game.players.includes(clients.get(ws)) && game.players.length == 1) {
        console.log(`Removing ${game.id} from games list.`)
        games = removeFromArray(games, game)
      }
      if (game.players.includes(clients.get(ws))) {
        game.players = removeFromArray(game.players, clients.get(ws))
      }
    }
    clients.delete(ws)
  })
})