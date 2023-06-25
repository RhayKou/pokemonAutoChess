import { GameObjects } from "phaser"
import GameScene from "../scenes/game-scene"
import { getPortraitSrc } from "../../utils"
import { Pkm, PkmIndex } from "../../../../types/enum/Pokemon"

export class SlingshotBox extends GameObjects.Container {
  sprite: GameObjects.DOMElement
  id: string
  name: Pkm

  constructor(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    name: Pkm
  ) {
    super(scene, x, y)
    this.name = name
    this.id = id

    const avatar = document.createElement("img")
    avatar.className = "slingshot-box"
    avatar.src = getPortraitSrc(PkmIndex[name])

    this.sprite = new GameObjects.DOMElement(scene, 0, 0, avatar)
    this.add(this.sprite)
    this.scene.add.existing(this)
  }
}
