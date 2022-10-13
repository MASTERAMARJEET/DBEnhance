import { useRouteData, useSearchParams } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { RouteDataArgs } from 'solid-start'
import {
  createServerAction$,
  createServerData$,
  redirect,
} from 'solid-start/server'
import { getUser, getUserId } from '~/db/session'
import { deleteItems, getItems } from '~/db/workItem'
import { CDYMWD, searchStringToPrams, RANGETYPE } from 'utils'
import ItemTile from '~/components/ItemTile'
import { formattedPrice, totalPrice } from '~/utils'
import TimeRangeSelect from '~/components/TimeRangeSelect'
import Navbar from '~/components/Navbar'
import AddItem from '~/components/AddItem'
import AiFillDelete from '~/components/icons/AiFillDelete'
import { createStore } from 'solid-js/store'

export function routeData({ location }: RouteDataArgs) {
  return createServerData$(
    async ([searchString], { request }) => {
      const user = await getUser(request)

      if (!user) {
        throw redirect('/login')
      }
      const searchParams = searchStringToPrams(searchString)
      let rangeType = RANGETYPE.week as CDYMWD
      if (searchParams?.rangeType) {
        if (searchParams.rangeType in RANGETYPE) {
          rangeType = searchParams.rangeType as CDYMWD
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
  const [selected, setSelected] = createStore<number[]>([])
  const data = useRouteData<typeof routeData>()
  const [searchParams, setSearchParams] = useSearchParams()
  const rangeType = searchParams.rangeType || 'month'
  const previous = searchParams.previous || 'false'
  const optionString = `${rangeType} ${previous}`
  const timeSelectHandler = (value: string) => {
    const values = value.split(' ')
    setSearchParams({ rangeType: values[0], previous: values[1] })
  }
  const [deletingItems, { Form: DeleteForm }] = createServerAction$(
    async (form: FormData, { request }) => {
      const userId = await getUserId(request)
      if (!userId) {
        throw redirect('/login')
      }
      const itemIds = (form.get('itemIds') as string)
        .split(',')
        .map((e) => parseInt(e))
      const count = await deleteItems({ userId, itemIds })
      return count
    },
  )
  return (
    <>
      <Navbar username={data()?.user.name} />
      <main class="my-2 mx-4 sm:mx-[10vw]">
        <AddItem
          searchString={`?${new URLSearchParams(searchParams).toString()}`}
        />
        <Show when={data()?.workItems} keyed>
          {(items) => (
            <>
              <div class="flex items-center justify-between">
                <p class="text-lg">
                  Work done in
                  <TimeRangeSelect
                    onChange={(e) => timeSelectHandler(e.currentTarget.value)}
                    optionString={optionString}
                  />
                  with total earning of {'  '}
                  <strong>{formattedPrice(totalPrice(items))}</strong>
                </p>
                <DeleteForm
                  onSubmit={() => {
                    setTimeout(() => setSelected(() => []))
                  }}
                >
                  <input
                    type="hidden"
                    name="itemIds"
                    value={selected.join(',')}
                  />
                  <button
                    type="submit"
                    class="btn btn-outline  btn-primary"
                    classList={{
                      'btn-disabled':
                        selected.length == 0 || deletingItems.pending,
                    }}
                  >
                    <AiFillDelete size={28} />
                  </button>
                </DeleteForm>
              </div>
              <For each={items}>
                {(item) => <ItemTile item={item} setSelected={setSelected} />}
              </For>
            </>
          )}
        </Show>
      </main>
    </>
  )
}
