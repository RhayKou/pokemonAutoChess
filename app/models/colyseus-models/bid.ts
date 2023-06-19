import { Schema, type } from "@colyseus/schema"

export interface IBid {
  id: string
  price: number
  avatar: string
  name: string
}

export class Bid extends Schema implements IBid {
  @type("string") id: string
  @type("number") price: number
  @type("string") avatar: string
  @type("string") name: string

  constructor(id: string, price: number, avatar: string, name: string) {
    super()
    this.id = id
    this.price = price
    this.avatar = avatar
    this.name = name
  }
}
