import { Bodies, Engine, Body, Composite, World, Composites } from "matter-js"
import { PokemonAvatar } from "../../models/colyseus-models/pokemon-avatar"
import { MapSchema } from "@colyseus/schema"
import Player from "../../models/colyseus-models/player"
import { Pkm } from "../../types/enum/Pokemon"
import { SlingshotBox } from "../../models/colyseus-models/slingshot-box"
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../types"

export class SlingshotGame {
  engine = Engine.create()
  avatars: MapSchema<PokemonAvatar> | undefined
  boxes: MapSchema<SlingshotBox> | undefined
  alivePlayers = new Array<Player>()
  bodies = new Map<string, Body>()
  slingShotBoxStartX = 1000
  boxesPerColumn = 10
  boxSize = 40
  width = WORLD_WIDTH
  height = WORLD_HEIGHT

  create(avatars: MapSchema<PokemonAvatar>, boxes: MapSchema<SlingshotBox>) {
    this.avatars = avatars
    this.boxes = boxes

    Composite.add(this.engine.world, [
      // walls
      Bodies.rectangle(this.width / 2, 0, this.width, 50, { isStatic: true }),
      Bodies.rectangle(this.width / 2, this.height, this.width, 50, {
        isStatic: true
      }),
      Bodies.rectangle(this.width, this.height / 2, 50, this.height, {
        isStatic: true
      }),
      Bodies.rectangle(0, this.height / 2, 50, this.height, { isStatic: true })
    ])
  }

  initialize(players: MapSchema<Player>, additionalPokemons: Pkm[]) {
    const pkms = additionalPokemons.slice()
    players.forEach((player) => {
      if (player.alive) {
        this.alivePlayers.push(player)
      }
    })
    this.alivePlayers.forEach((player, i) => {
      const y = i * 100 + 70
      const x = 250

      const avatar = new PokemonAvatar(player.id, player.avatar, 0, x, y)

      this.avatars!.set(avatar.id, avatar)
      const body = Bodies.circle(x, y, 30, { isStatic: true })
      body.label = avatar.id
      this.bodies.set(avatar.id, body)
      Composite.add(this.engine.world, body)
    })

    const pyramid = Composites.pyramid(
      WORLD_WIDTH - 200,
      50,
      8,
      6,
      0,
      0,
      (x, y) => {
        const name = pkms.pop()
        const pkm = name ? name : Pkm.MAGIKARP
        const slingShotBox = new SlingshotBox(pkm, x, y)
        this.boxes?.set(slingShotBox.id, slingShotBox)
        const body = Bodies.rectangle(x, y, this.boxSize, this.boxSize)
        body.label = slingShotBox.id
        this.bodies.set(slingShotBox.id, body)
        return body
      }
    )
    Composite.add(this.engine.world, pyramid)
  }

  update(dt: number) {
    Engine.update(this.engine, dt)
    this.avatars?.forEach((a) => {
      if (a.timer > 0) {
        a.timer = a.timer - dt
      }
    })
    this.bodies.forEach((body, id) => {
      const avatar = this.avatars?.get(id)
      if (avatar) {
        avatar.x = body.position.x
        avatar.y = body.position.y
      }
      const box = this.boxes?.get(id)
      if (box) {
        box.x = body.position.x
        box.y = body.position.y
      }
    })
  }

  stop(players: MapSchema<Player>) {
    this.bodies.forEach((body, key) => {
      Composite.remove(this.engine.world, body)
      this.bodies.delete(key)
    })
    this.boxes?.forEach((box, key) => {
      this.bodies.delete(key)
    })
  }
}
