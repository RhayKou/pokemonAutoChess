import Player from "../models/colyseus-models/player"
import PokemonFactory from "../models/pokemon-factory"
import GameRoom from "../rooms/game-room"
import { GameState } from "../rooms/states/game-state"
import { Title } from "../types"
import { NeutralStage } from "../types/Config"
import { Effect } from "../types/enum/Effect"
import { BattleResult } from "../types/enum/Game"
import { Weather } from "../types/enum/Weather"
import { TitleName } from "../types/strings/Title"
import { removeInArray } from "../utils/array"
import { logger } from "../utils/logger"
import { pickRandomIn } from "../utils/random"
import Simulation from "./simulation"

export class SimulationManager {
  state: GameState
  room: GameRoom

  constructor(state: GameState, room: GameRoom) {
    this.state = state
    this.room = room
  }

  getCurrentBattleResult(simulationId: string, playerId: string) {
    const simulation = this.state.simulations.get(simulationId)
    if (simulation) {
      const { teamSize, opponentTeamSize } =
        simulation?.bluePlayer?.id === playerId
          ? {
              teamSize: simulation.blueTeam.size,
              opponentTeamSize: simulation.redTeam.size
            }
          : {
              teamSize: simulation.redTeam.size,
              opponentTeamSize: simulation.blueTeam.size
            }

      if (teamSize === 0) {
        return BattleResult.DEFEAT
      } else if (opponentTeamSize === 0) {
        return BattleResult.WIN
      }
      return BattleResult.DRAW
    } else {
      logger.error("simulation not found", simulationId)
      return BattleResult.DRAW
    }
  }

  update(deltaTime: number) {
    let everySimulationFinished = true

    this.state.simulations.forEach((simulation) => {
      if (!simulation.finished) {
        if (everySimulationFinished) {
          everySimulationFinished = false
        }
        simulation.update(deltaTime)
      }
    })
    return everySimulationFinished
  }

  computeAchievements() {
    this.state.players.forEach((player, key) => {
      this.checkSuccess(player)
    })
  }

  checkSuccess(player: Player) {
    player.titles.add(Title.NOVICE)
    const simulation = this.state.simulations.get(player.simulationId)
    if (!simulation) {
      logger.error("simulation not found", player.simulationId)
    } else {
      const effects =
        simulation.bluePlayer?.id === player.id
          ? simulation.blueEffects
          : simulation.redEffects
      const blueHealDpsMeter =
        simulation.bluePlayer?.id === player.id
          ? simulation.blueHealDpsMeter
          : simulation.redHealDpsMeter
      effects.forEach((effect) => {
        switch (effect) {
          case Effect.PURE_POWER:
            player.titles.add(Title.POKEFAN)
            break
          case Effect.SPORE:
            player.titles.add(Title.POKEMON_RANGER)
            break
          case Effect.DESOLATE_LAND:
            player.titles.add(Title.KINDLER)
            break
          case Effect.PRIMORDIAL_SEA:
            player.titles.add(Title.FIREFIGHTER)
            break
          case Effect.OVERDRIVE:
            player.titles.add(Title.ELECTRICIAN)
            break
          case Effect.JUSTIFIED:
            player.titles.add(Title.BLACK_BELT)
            break
          case Effect.EERIE_SPELL:
            player.titles.add(Title.TELEKINESIST)
            break
          case Effect.BEAT_UP:
            player.titles.add(Title.DELINQUENT)
            break
          case Effect.STEEL_SURGE:
            player.titles.add(Title.ENGINEER)
            break
          case Effect.SANDSTORM:
            player.titles.add(Title.GEOLOGIST)
            break
          case Effect.TOXIC:
            player.titles.add(Title.TEAM_ROCKET_GRUNT)
            break
          case Effect.DRAGON_DANCE:
            player.titles.add(Title.DRAGON_TAMER)
            break
          case Effect.ANGER_POINT:
            player.titles.add(Title.CAMPER)
            break
          case Effect.POWER_TRIP:
            player.titles.add(Title.MYTH_TRAINER)
            break
          case Effect.CALM_MIND:
            player.titles.add(Title.RIVAL)
            break
          case Effect.WATER_VEIL:
            player.titles.add(Title.DIVER)
            break
          case Effect.HEART_OF_THE_SWARM:
            player.titles.add(Title.BUG_MANIAC)
            break
          case Effect.MAX_GUARD:
            player.titles.add(Title.BIRD_KEEPER)
            break
          case Effect.SUN_FLOWER:
            player.titles.add(Title.GARDENER)
            break
          case Effect.GOOGLE_SPECS:
            player.titles.add(Title.ALCHEMIST)
            break
          case Effect.DIAMOND_STORM:
            player.titles.add(Title.HIKER)
            break
          case Effect.CURSE:
            player.titles.add(Title.HEX_MANIAC)
            break
          case Effect.STRANGE_STEAM:
            player.titles.add(Title.CUTE_MANIAC)
            break
          case Effect.SHEER_COLD:
            player.titles.add(Title.SKIER)
            break
          case Effect.FORGOTTEN_POWER:
            player.titles.add(Title.MUSEUM_DIRECTOR)
            break
          case Effect.PRESTO:
            player.titles.add(Title.MUSICIAN)
            break
          case Effect.BREEDER:
            player.titles.add(Title.BABYSITTER)
            break
          default:
            break
        }
      })
      if (effects.length >= 5) {
        player.titles.add(Title.HARLEQUIN)
      }
      let shield = 0
      let heal = 0
      blueHealDpsMeter.forEach((v) => {
        shield += v.shield
        heal += v.heal
      })
      if (shield > 1000) {
        player.titles.add(Title.GARDIAN)
      }
      if (heal > 1000) {
        player.titles.add(Title.NURSE)
      }
    }
  }

  computePlayerDamage(
    playerId: string,
    simulationId: string,
    stageLevel: number
  ) {
    let damage = Math.ceil(stageLevel / 2)
    const simulation = this.state.simulations.get(simulationId)
    if (simulation) {
      const opponentTeam =
        playerId === simulation.bluePlayer?.id
          ? simulation.redTeam
          : simulation.blueTeam
      if (opponentTeam.size > 0) {
        opponentTeam.forEach((pokemon) => {
          if (!pokemon.isClone) {
            damage += pokemon.stars
          }
        })
      }
    } else {
      logger.error("simulation not found", simulationId)
    }
    return damage
  }

  getWeather(player: Player) {
    const simulation = this.state.simulations.get(player.id)
    let weather = Weather.NEUTRAL
    if (simulation) {
      weather = simulation.weather
    } else {
      logger.error("simulation not found", player.simulationId)
    }
    return weather
  }

  stop() {
    this.state.simulations.forEach((simulation) => {
      simulation.stop()
    })
  }

  createPveSimulation(player: Player, stageIndex: number) {
    player.opponentName = NeutralStage[stageIndex].name
    player.opponentAvatar = NeutralStage[stageIndex].avatar
    player.opponentTitle = "Wild"
    const pveBoard = PokemonFactory.getNeutralPokemonsByLevelStage(
      this.state.stageLevel,
      this.state.shinyEncounter
    )
    const weather = Simulation.getWeather(player.board, pveBoard)
    const simulation = new Simulation(this.room)
    simulation.initialize(
      player.board,
      pveBoard,
      player,
      null,
      this.state.stageLevel,
      weather
    )
    player.simulationId = simulation.id
    this.state.simulations.set(simulation.id, simulation)
  }

  computePairings() {
    this.state.players.forEach((player) => {
      if (player) {
        this.state.players.forEach((p) => {
          if (player.id !== p.id) {
            if (!player.opponents.has(p.id) && p.alive) {
              player.opponents.set(p.id, 0)
            }
            if (player.opponents.has(p.id) && !p.alive) {
              player.opponents.delete(p.id)
            }
          }
        })
      }
    })
    const playersId = new Array<string>()
    this.state.players.forEach((p) => playersId.push(p.id))
    while (playersId.length > 1) {
      const playerId = playersId.pop()
      if (playerId) {
        const player = this.state.players.get(playerId)
        if (player) {
          const sortArray = Array.from(player.opponents)
          const availableOpponents = sortArray
            .filter((o) => playerId.includes(o[0]))
            .sort((a, b) => a[1] - b[1])

          if (availableOpponents.length > 0) {
            const min = availableOpponents[0][1]
            const potentials = availableOpponents.filter((o) => o[1] === min)
            const potential = pickRandomIn(potentials)
            const id = potential[0]
            const opponent = this.state.players.get(id)
            if (opponent) {
              removeInArray(playersId, id)
              player.opponents.set(id, this.state.stageLevel)
              player.opponentName = opponent.name
              player.opponentAvatar = opponent.avatar
              player.opponentTitle = TitleName[opponent.title]

              opponent.opponents.set(playerId, this.state.stageLevel)
              opponent.opponentName = player.name
              opponent.opponentAvatar = player.avatar
              opponent.opponentTitle = TitleName[player.title]

              const weather = Simulation.getWeather(
                player.board,
                opponent.board
              )
              const simulation = new Simulation(this.room)
              simulation.initialize(
                player.board,
                opponent.board,
                player,
                opponent,
                this.state.stageLevel,
                weather
              )
              player.simulationId = simulation.id
              opponent.simulationId = simulation.id
              this.state.simulations.set(simulation.id, simulation)
            }
          } else {
            logger.error("error while computing opponents")
          }
        }
      }
    }
    if (playersId.length > 0) {
      const player = this.state.players.get(playersId[0])
      if (player) {
        const sortArray = Array.from(player.opponents)
        const availableOpponents = sortArray.sort((a, b) => a[1] - b[1])

        if (availableOpponents.length > 0) {
          const min = availableOpponents[0][1]
          const potentials = availableOpponents.filter((o) => o[1] === min)
          const potential = pickRandomIn(potentials)
          const id = potential[0]
          const opponent = this.state.players.get(id)
          if (opponent) {
            player.opponents.set(id, this.state.stageLevel)
            player.opponentName = opponent.name
            player.opponentAvatar = opponent.avatar
            player.opponentTitle = TitleName[opponent.title]

            const weather = Simulation.getWeather(player.board, opponent.board)
            const simulation = new Simulation(this.room)
            simulation.initialize(
              player.board,
              opponent.board,
              player,
              opponent,
              this.state.stageLevel,
              weather
            )
            player.simulationId = simulation.id
            this.state.simulations.set(simulation.id, simulation)
          }
        }
      }
    }
  }
}
