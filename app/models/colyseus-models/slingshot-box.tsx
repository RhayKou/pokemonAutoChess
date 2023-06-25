import { Schema, type } from "@colyseus/schema"
import { ISlingshotBox } from "../../types"
import { nanoid } from "nanoid"
import { Pkm } from "../../types/enum/Pokemon"

export class SlingshotBox extends Schema implements ISlingshotBox {
  @type("string") id: string = nanoid()
  @type("string") name: Pkm
  @type("number") x: number
  @type("number") y: number

  constructor(name: Pkm, x: number, y: number) {
    super()
    this.name = name
    this.x = x
    this.y = y
  }
}
