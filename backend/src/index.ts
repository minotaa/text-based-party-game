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

function getKeyByValue(object: Map<any, any>, value: any): any {
  return Object.keys(object).find(key => object.get(key) === value);
}

wss.on('connection', (ws) => {
  const id = uuid()
  clients.set(ws, id)

  ws.send(JSON.stringify({
    id: id
  }))

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg as any)
      const id = clients.get(ws)
      if (data.action == "CREATE") {
        // Doesn't check for client already being in any games.
        const game = {
          id: uuid(),
          invite: generateInvite(),
          players: [id],
          created: Date.now()
        }
        games.push(game)
        ws.send(JSON.stringify(game))
      } else if (data.action == "JOIN") {
        if (data.invite == null) {
          return ws.send('Invalid invite.')
        }
        if ((data.invite as string).length != 4) {
          return ws.send('Invalid amount of characters.')
        }
        let invitedGame
        for (const game of games) {
          if (game.invite == data.invite) {
            invitedGame = game
            game.players.push(clients.get(ws))
            // Unfinished, supposed to send all players that new player has joined.
            return
          }
        }
        ws.send('Invalid invite')
      }
    } catch (e) {
      ws.send('Failed to receive mesage, try again.')
      console.log(e)
    }
  })

  ws.on('close', () => {
    for (const game of games) {
      if (game.players.includes(clients.get(ws)) && game.players.length == 1) {
        console.log(`Removing ${game.id} from games list.`)
        games = removeFromArray(games, game)
      }
    }
    // Make sure to remove client from any games they are in.
    clients.delete(ws)
  })
})