import type { Component } from 'solid-js'
import { createServerAction$ } from 'solid-start/server'
import { logout } from '~/db/session'
const LogoutBtn: Component = () => {
  const [, { Form: LogoutForm }] = createServerAction$(
    (f: FormData, { request }) => logout(request),
  )
  return (
    <LogoutForm>
      <button name="logout" type="submit" class="btn btn-outline btn-sm">
        Logout
      </button>
    </LogoutForm>
  )
}
export default LogoutBtn
