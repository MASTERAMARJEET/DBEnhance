import { Component, ComponentProps } from 'solid-js'

type ButtonProps = ComponentProps<'button'>

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button {...props} class={`btn ${props.class}`}>
      Hi
    </button>
  )
}
