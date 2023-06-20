import React from "react"
import "./money.css"

export function Money(props: { value?: number | string; size?: number }) {
  return (
    <>
      {props.value && (
        <span
          style={{
            verticalAlign: "middle",
            flex: "1",
            fontSize: props.size !== undefined ? `${props.size}vw` : "inherit"
          }}
        >
          {props.value}
        </span>
      )}
      <img
        className="icon-money"
        style={{
          width: `${props.size !== undefined ? props.size : 1}vw`,
          height: `${props.size !== undefined ? props.size : 1}vw`
        }}
        src="/assets/ui/money.svg"
        alt="$"
      />
    </>
  )
}
