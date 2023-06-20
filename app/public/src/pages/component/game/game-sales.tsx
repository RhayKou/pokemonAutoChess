import React from "react"
import { useAppDispatch, useAppSelector } from "../../../hooks"
import { ISale } from "../../../../../models/colyseus-models/sale"
import PokemonFactory from "../../../../../models/pokemon-factory"
import { bidClick } from "../../../stores/NetworkStore"
import GamePokemonPortrait from "./game-pokemon-portrait"
import { Money } from "../icons/money"
import { getAvatarSrc } from "../../../utils"
import ProgressBar from "react-bootstrap/esm/ProgressBar"
import "./game-sales.css"

export function GameSales() {
  const sales = useAppSelector((state) => state.game.sales)

  if (sales.length === 0) {
    return null
  } else {
    return (
      <div className="game-sales">
        {sales.map((sale, index) => (
          <GameSale sale={sale} key={index} />
        ))}
      </div>
    )
  }
}

export function GameSale(props: { sale: ISale; key: number }) {
  const dispatch = useAppDispatch()
  const pokemonCollection = useAppSelector(
    (state) => state.game.pokemonCollection
  )
  const uid = useAppSelector((state) => state.network.uid)
  const p = PokemonFactory.createPokemonFromName(props.sale.name)
  return (
    <div
      className="nes-container game-sale"
      onClick={(e) => {
        dispatch(bidClick(props.sale.id))
      }}
    >
      <GamePokemonPortrait
        origin={props.sale.id}
        index={0}
        pokemon={p}
        pokemonConfig={pokemonCollection.get(p.index)}
        click={() => null}
      />
      <div
        style={{ display: "flex", flexFlow: "column", alignItems: "center" }}
      >
        {props.sale.purchaserId !== "" && props.sale.purchaserAvatar !== "" ? (
          <img
            src={getAvatarSrc(props.sale.purchaserAvatar)}
            className="pokemon-portrait"
          />
        ) : null}

        <span style={{ textAlign: "center" }}>{props.sale.purchaserName}</span>
        {
          <div className="game-sale-description">
            <Money
              value={props.sale.price}
              size={props.sale.purchaserId === "" ? 2 : undefined}
            />
          </div>
        }
      </div>
    </div>
  )
}
