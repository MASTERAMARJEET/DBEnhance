import { useParams, useRouteData } from '@solidjs/router'
import { Show } from 'solid-js'
import { FormError } from 'solid-start/data'
import {
  createServerAction$,
  createServerData$,
  redirect,
} from 'solid-start/server'
import { db } from '~/db'
import { createUserSession, getUser, register } from '~/db/session'

function validateName(name: unknown) {
  if (typeof name !== 'string' || name.length < 3) {
    return `Names must be at least 3 characters long`
  }
}

export function routeData() {
  return createServerData$(async (_, { request }) => {
    if (await getUser(request)) {
      throw redirect('/')
    }
    return {}
  })
}

export default function Login() {
  const data = useRouteData<typeof routeData>()
  const params = useParams()

  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const name = form.get('name')
    const redirectTo = form.get('redirectTo') || '/'
    if (typeof name !== 'string' || typeof redirectTo !== 'string') {
      throw new FormError(`Form not submitted correctly.`)
    }

    const fields = { name }
    const fieldErrors = {
      name: validateName(name),
    }
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError('Fields invalid', { fieldErrors, fields })
    }
    const userExists = await db.user.findUnique({ where: { name } })
    if (userExists) {
      throw new FormError(`User with name ${name} already exists`, {
        fields,
      })
    }
    const user = await register({ name })
    if (!user) {
      throw new FormError(`Something went wrong trying to create a new user.`, {
        fields,
      })
    }
    return createUserSession(`${user.id}`, redirectTo)
  })

  return (
    <div class="flex h-[80vh] items-center justify-center">
      <main class="card card-bordered w-96 p-4 shadow-xl">
        <h1 class="card-title px-1 py-4">Register</h1>
        <Form class="form-control bg-white">
          <input
            type="hidden"
            name="redirectTo"
            value={params.redirectTo ?? '/'}
          />
          <div>
            <label for="name-input" class="label">
              Name
            </label>
            <input
              name="name"
              placeholder="Enter Name"
              class="input input-bordered w-full"
            />
          </div>
          <Show when={loggingIn.error?.fieldErrors?.name}>
            <p role="alert">{loggingIn.error.fieldErrors.name}</p>
          </Show>
          <Show when={loggingIn.error}>
            <p role="alert" id="error-message">
              {loggingIn.error.message}
            </p>
          </Show>
          <p class="px-1 py-4">
            Already have an account? <a href="/login">Login</a>
          </p>
          <button class="btn btn-primary" type="submit">
            {data() ? 'Register' : ''}
          </button>
        </Form>
      </main>
    </div>
  )
}
