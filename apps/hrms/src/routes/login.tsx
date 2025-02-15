import { useParams, useRouteData } from '@solidjs/router'
import { Show } from 'solid-js'
import { FormError } from 'solid-start/data'
import {
  createServerAction$,
  createServerData$,
  redirect,
} from 'solid-start/server'
import { createUserSession, getUser, login } from '~/db/session'

function validateName(name: unknown) {
  if (typeof name !== 'string' || name.length < 3) {
    return `Names must be at least 3 characters long`
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password !== 'locked') {
    return 'Invalid Password'
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
    const password = form.get('password')
    const redirectTo = form.get('redirectTo') || '/'
    if (
      typeof name !== 'string' ||
      typeof password !== 'string' ||
      typeof redirectTo !== 'string'
    ) {
      throw new FormError(`Form not submitted correctly.`)
    }

    const fields = { name, password }
    const fieldErrors = {
      name: validateName(name),
      password: validatePassword(password),
    }
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError('Fields invalid', { fieldErrors, fields })
    }

    const user = await login({ name })
    if (!user) {
      throw new FormError(`Name combination is incorrect`, {
        fields,
      })
    }
    return createUserSession(`${user.id}`, redirectTo)
  })

  return (
    <div class="flex h-[80vh] items-center justify-center">
      <main class="card card-bordered w-96 p-4 shadow-xl">
        <h1 class="card-title px-1 py-4">Login</h1>
        <Form class="form-control bg-white">
          <input
            type="hidden"
            name="redirectTo"
            value={params.redirectTo ?? '/'}
          />
          <div>
            <label for="name" class="label">
              <span class="label-text">Name</span>
            </label>
            <input
              name="name"
              placeholder="Enter Name"
              class="input input-bordered w-full"
            />
            <Show when={loggingIn.error?.fieldErrors?.name}>
              <label class="label">
                <span role="alert" class="label-text text-error">
                  {loggingIn.error.fieldErrors.name}
                </span>
              </label>
            </Show>
          </div>
          <div>
            <label for="password" class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              class="input input-bordered w-full"
            />
            <Show when={loggingIn.error?.fieldErrors?.password}>
              <label class="label">
                <span role="alert" class="label-text text-error">
                  {loggingIn.error.fieldErrors.password}
                </span>
              </label>
            </Show>
          </div>
          <p class="px-1 py-4">
            Do not have an account? <a href="/register">Register</a>
          </p>
          <button class="btn btn-primary" type="submit">
            {data() ? 'Login' : ''}
          </button>
        </Form>
      </main>
    </div>
  )
}
