import { WorkItem } from '@prisma/client'
import { useRouteData, useSearchParams } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { FormError, RouteDataArgs } from 'solid-start'
import {
  createServerAction$,
  createServerData$,
  redirect,
} from 'solid-start/server'
import { getUser, getUserId, logout } from '~/db/session'
import { addItem, getItems } from '~/db/workItem'
import { CDYMD, searchStringToPrams, RANGETYPE } from 'utils'

function validateName<T>(name: T) {
  if (typeof name !== 'string') {
    return 'Name must be string'
  } else if (!name.trim()) {
    return 'Name must not be empty'
  }
  return
}

function validatePrice(price: number) {
  if (isNaN(price)) {
    return 'Price must be a number'
  } else if (!price) {
    return 'Price should be more that 0'
  }
  return
}
function validatedItemForm(form: FormData) {
  const name = form.get('name')
  const price = Number(form.get('price'))
  const fields = { name, price }
  const fieldErrors = {
    name: validateName(name),
    price: validatePrice(price),
  }
  if (fieldErrors.name || fieldErrors.price) {
    throw new FormError('Form not submitted correctly.', {
      fieldErrors,
      fields,
    })
  }
  return { name: name as string, price }
}
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: 'numeric',
})
function formatedDateTime(date: Date | string) {
  return dateTimeFormatter.format(new Date(date))
}
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})
function formattedPrice(price: number) {
  return currencyFormatter.format(price)
}
function totalPrice(items: WorkItem[]) {
  return items
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0)
}
export function routeData({ location }: RouteDataArgs) {
  return createServerData$(
    async ([searchString], { request }) => {
      const user = await getUser(request)

      if (!user) {
        throw redirect('/login')
      }
      const searchParams = searchStringToPrams(searchString)
      let rangeType = RANGETYPE.month as CDYMD
      if (searchParams?.rangeType) {
        if (searchParams.rangeType in RANGETYPE) {
          rangeType = searchParams.rangeType as CDYMD
        }
      }
      let previous = false
      if (searchParams?.previous === 'true') {
        previous = true
      }
      const workItems = await getItems(user.id, rangeType, previous)
      return { user, workItems }
    },
    {
      key: () => [location.search],
    },
  )
}
export default function Home() {
  const data = useRouteData<typeof routeData>()
  const [searchParams, setSearchParams] = useSearchParams()
  const rangeType = searchParams.rangeType || 'month'
  const previous = searchParams.previous || 'false'
  const optionString = `${rangeType} ${previous}`
  const [, { Form: LogoutForm }] = createServerAction$(
    (f: FormData, { request }) => logout(request),
  )
  const [itemAction, { Form: ItemForm }] = createServerAction$(
    async (form: FormData, { request }) => {
      const userId = await getUserId(request)
      if (!userId) {
        throw redirect('/login')
      }
      const { name, price } = validatedItemForm(form)
      await addItem({ name, price, userId })
      throw redirect('/')
    },
  )
  const selectHandler = (value: string) => {
    const values = value.split(' ')
    setSearchParams({ rangeType: values[0], previous: values[1] })
  }
  let itemFormRef: HTMLFormElement
  return (
    <>
      <nav class="navbar flex justify-between border shadow-md">
        <p class="text-bold hidden text-2xl sm:block">DB ENHANCE</p>
        <p class="text-bold text-2xl">{data()?.user.name}</p>
        <LogoutForm>
          <button name="logout" type="submit" class="btn btn-outline btn-sm">
            Logout
          </button>
        </LogoutForm>
      </nav>
      <main>
        <ItemForm
          class="m-8 flex flex-col items-center justify-evenly gap-4 sm:flex-row sm:items-end"
          ref={itemFormRef!}
          onSubmit={() => {
            setTimeout(() => itemFormRef.reset())
          }}
        >
          <label for="name" class="w-full">
            <span>Item Name</span>
            <p class="text-error my-1">
              {(itemAction.error as any)?.fieldErrors?.name}
            </p>
            <input
              name="name"
              type="text"
              class="input input-bordered w-full"
            />
          </label>
          <label for="price" class="w-full">
            <span>Item Price</span>
            <p class="text-error my-1">
              {(itemAction.error as any)?.fieldErrors?.price}
            </p>
            <input
              step={0.01}
              min={0}
              name="price"
              type="number"
              class="input input-bordered w-full"
            />
          </label>
          <button
            type="submit"
            name="add"
            class="btn btn-primary"
            classList={{ 'btn-disabled': itemAction.pending }}
          >
            Add
          </button>
        </ItemForm>
        <Show when={data()?.workItems} keyed>
          {(items) => (
            <div class="m-2 overflow-x-auto sm:m-8">
              <p class="inline text-lg">Work done</p>
              <select
                onChange={(e) => selectHandler(e.currentTarget.value)}
                class="select select-sm select-bordered select-primary mx-2 my-2"
              >
                <option
                  selected={optionString === 'day false'}
                  value="day false"
                >
                  Today
                </option>
                <option selected={optionString === 'day true'} value="day true">
                  Yesterday
                </option>
                <option
                  selected={optionString === 'month false'}
                  value="month false"
                >
                  This Month
                </option>
                <option
                  selected={optionString === 'month true'}
                  value="month true"
                >
                  Last Month
                </option>
                <option
                  selected={optionString === 'year false'}
                  value="year false"
                >
                  This year
                </option>
              </select>
              <table class="w-full">
                <thead>
                  <tr>
                    <th class="bg-base-200 border text-lg font-bold">Time</th>
                    <th class="bg-base-200 border text-lg font-bold">Name</th>
                    <th class="bg-base-200 border text-lg font-bold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={items}>
                    {(item) => {
                      return (
                        <tr>
                          <td class="whitespace-nowrap border py-1 px-4">
                            {formatedDateTime(item.date)}
                          </td>
                          <td class="border py-1 px-4">{item.name}</td>
                          <td class="whitespace-nowrap border py-1 px-4 text-right">
                            {formattedPrice(Number(item.price))}
                          </td>
                        </tr>
                      )
                    }}
                  </For>
                  <tr>
                    <td class="border py-1 px-4" />
                    <td class="border py-1 px-4" />
                    <td class="border py-1 px-4 text-right">
                      {formattedPrice(totalPrice(items))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Show>
      </main>
    </>
  )
}
