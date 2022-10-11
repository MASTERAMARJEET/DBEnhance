import type { Component } from 'solid-js'
import LogoutBtn from './LogoutBtn'
interface NavbarProps {
  username?: string
}
const Navbar: Component<NavbarProps> = (props) => {
  return (
    <nav class="navbar flex justify-between border shadow-md sm:px-[5vw]">
      <p class="text-bold hidden text-2xl sm:block">DB ENHANCE</p>
      <p class="text-bold text-2xl">{props.username}</p>
      <LogoutBtn />
    </nav>
  )
}
export default Navbar
