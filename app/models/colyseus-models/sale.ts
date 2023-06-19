import { Schema, type } from "@colyseus/schema"
import { nanoid } from "nanoid"
import { Pkm } from "../../types/enum/Pokemon"

export interface ISale {
  id: string
  name: Pkm
  price: number
  purchaserAvatar: string
  purchaserId: string
  purchaserName: string
}

export class Sale extends Schema implements ISale {
  @type("string") id: string = nanoid()
  @type("string") name: Pkm
  @type("number") price = 1
  @type("string") purchaserAvatar = ""
  @type("string") purchaserId = ""
  @type("string") purchaserName = ""

  constructor(name: Pkm) {
    super()
    this.name = name
  }
}
