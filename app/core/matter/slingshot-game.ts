import { Bodies, Engine, Body, Composite, Composites } from "matter-js"
import { PokemonAvatarModel } from "../../models/colyseus-models/pokemon-avatar"
import { MapSchema } from "@colyseus/schema"
import Player from "../../models/colyseus-models/player"
import { Pkm } from "../../types/enum/Pokemon"
import { SlingshotBox } from "../../models/colyseus-models/slingshot-box"
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../types"
import { pickNRandomIn, pickRandomIn } from "../../utils/random"

export class SlingshotGame {
  engine = Engine.create()
  avatars: MapSchema<PokemonAvatarModel> | undefined
  boxes: MapSchema<SlingshotBox> | undefined
  alivePlayers = new Array<Player>()
  bodies = new Map<string, Body>()
  boxesPerColumn = 10
  boxSize = 40
  width = WORLD_WIDTH
  height = WORLD_HEIGHT

  create(
    avatars: MapSchema<PokemonAvatarModel>,
    boxes: MapSchema<SlingshotBox>
  ) {
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
    players.forEach((player) => {
      if (player.alive) {
        this.alivePlayers.push(player)
      }
    })
    this.alivePlayers.forEach((player, i) => {
      const y = i * 100 + 70
      const x = 250

      const avatar = new PokemonAvatarModel(
        player.id,
        player.avatar,
        x,
        y,
        3000
      )

      this.avatars!.set(avatar.id, avatar)
      const body = Bodies.circle(x, y, 30, { isStatic: true })
      body.label = avatar.id
      this.bodies.set(avatar.id, body)
      Composite.add(this.engine.world, body)
    })

    // pkms.forEach((pkm, i) => {
    //   const x = WORLD_WIDTH - 200 + Math.abs(i / 10) * this.boxSize
    //   const y = WORLD_HEIGHT - (i % 10) * this.boxSize
    //   const slingShotBox = new SlingshotBox(pkm, x, y)
    //   this.boxes?.set(slingShotBox.id, slingShotBox)
    //   const body = Bodies.rectangle(x, y, this.boxSize, this.boxSize, {
    //     restitution: 0,
    //     frictionAir: 0.01,
    //     frictionStatic: 0.5,
    //     friction: 0.1,
    //     density: 0.001
    //   })
    //   body.label = slingShotBox.id
    //   this.bodies.set(slingShotBox.id, body)
    //   Composite.add(this.engine.world, body)
    // })

    const base = 13
    const pyramid = Composites.pyramid(
      (2 * WORLD_WIDTH) / 3,
      WORLD_HEIGHT - (Math.abs(base / 2) + 1) * this.boxSize,
      base,
      10,
      1,
      1,
      (x, y) => {
        const slingShotBox = new SlingshotBox(
          pickRandomIn(additionalPokemons),
          x,
          y
        )
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
