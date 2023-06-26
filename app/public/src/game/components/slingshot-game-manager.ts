import Pokemon from "./pokemon"
import {
  ISlingshotBox,
  IPokemonAvatar,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "../../../../types"
import AnimationManager from "../animation-manager"
import GameScene from "../scenes/game-scene"
import {
  transformMiniGameXCoordinate,
  transformMiniGameYCoordinate
} from "../../pages/utils/utils"
import { SlingshotBox } from "./slingshot-box"
import PokemonAvatar from "./pokemon-avatar"

export default class MinigameManager {
  pokemons: Map<string, Pokemon>
  boxes: Map<string, SlingshotBox>
  uid: string
  scene: GameScene
  display: boolean
  animationManager: AnimationManager

  constructor(
    scene: GameScene,
    animationManager: AnimationManager,
    uid: string,
    avatars: Map<string, IPokemonAvatar>,
    items: Map<string, ISlingshotBox>
  ) {
    this.pokemons = new Map<string, Pokemon>()
    this.boxes = new Map<string, SlingshotBox>()
    this.uid = uid
    this.scene = scene
    this.display = false
    this.animationManager = animationManager
    this.buildPokemons(avatars)
    this.buildBoxes(items)
  }

  buildPokemons(avatars: Map<string, IPokemonAvatar>) {
    this.scene.add.rectangle(WORLD_WIDTH / 2, 0, WORLD_WIDTH, 50, 0xff0000, 1)
    this.scene.add.rectangle(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT,
      WORLD_WIDTH,
      50,
      0xff0000,
      1
    )
    this.scene.add.rectangle(
      WORLD_WIDTH,
      WORLD_HEIGHT / 2,
      50,
      WORLD_HEIGHT,
      0xff0000,
      1
    )
    this.scene.add.rectangle(0, WORLD_HEIGHT / 2, 50, WORLD_HEIGHT, 0xff0000, 1)
    avatars.forEach((pkm) => {
      this.addPokemon(pkm)
    })
  }

  buildBoxes(boxes: Map<string, ISlingshotBox>) {
    boxes.forEach((box) => {
      this.addbox(box)
    })
  }

  getVector(x: number, y: number) {
    const avatar = this.pokemons.get(this.uid)
    if (avatar) {
      return {
        x: x - avatar.x,
        y: y - avatar.y
      }
    } else {
      return { x: 0, y: 0 }
    }
  }

  addbox(box: ISlingshotBox) {
    const it = new SlingshotBox(this.scene, box.id, box.x, box.y, box.name)
    this.boxes.set(it.id, it)
  }

  removebox(boxToRemove: ISlingshotBox) {
    const boxUI = this.boxes.get(boxToRemove.id)
    if (boxUI) {
      boxUI.destroy(true)
    }
    this.boxes.delete(boxToRemove.id)
  }

  changebox(box: ISlingshotBox, field: string, value: any) {
    const boxUI = this.boxes.get(box.id)
    if (boxUI) {
      switch (field) {
        case "x":
          boxUI.x = value
          break

        case "y":
          boxUI.y = value
          break
      }
    }
  }

  addPokemon(pokemon: IPokemonAvatar) {
    const pokemonUI = new PokemonAvatar(
      this.scene,
      pokemon.x,
      pokemon.y,
      pokemon,
      pokemon.id
    )

    if (pokemonUI.isCurrentPlayerAvatar) {
      const arrowIndicator = this.scene.add
        .sprite(
          pokemonUI.x + pokemonUI.width / 2 - 8,
          pokemonUI.y - 70,
          "arrowDown"
        )
        .setDepth(10)
        .setScale(2)
      this.scene.tweens.add({
        targets: arrowIndicator,
        y: pokemonUI.y - 50,
        duration: 500,
        ease: Phaser.Math.Easing.Sine.InOut,
        loop: 3,
        yoyo: true,
        onComplete() {
          arrowIndicator.destroy()
        }
      })
    }

    this.animationManager.animatePokemon(pokemonUI, pokemon.action)
    this.pokemons.set(pokemonUI.playerId, pokemonUI)
  }

  removePokemon(pokemonToRemove: IPokemonAvatar) {
    const pokemonUI = this.pokemons.get(pokemonToRemove.id)
    if (pokemonUI) {
      pokemonUI.destroy(true)
    }
    this.pokemons.delete(pokemonToRemove.id)
  }

  changePokemon(pokemon: IPokemonAvatar, field: string, value: any) {
    const pokemonUI = this.pokemons.get(pokemon.id)
    if (pokemonUI) {
      switch (field) {
        case "orientation":
          pokemonUI.orientation = value
          this.animationManager.animatePokemon(pokemonUI, pokemonUI.action)
          break

        case "action":
          pokemonUI.action = value
          this.animationManager.animatePokemon(pokemonUI, value)
          break

        case "x":
          pokemonUI.x = value
          break

        case "y":
          pokemonUI.y = value
          break

        case "timer":
          if (pokemonUI instanceof PokemonAvatar) {
            pokemonUI.updateCircleTimer(value)
          }
          break
      }
    }
  }
}
