import { useRouteData, useSearchParams } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { RouteDataArgs } from 'solid-start'
import { createServerData$, redirect } from 'solid-start/server'
import { getUser } from '~/db/session'
import { getItems } from '~/db/workItem'
import { CDYMD, searchStringToPrams, RANGETYPE } from 'utils'
import ItemTile from '~/components/ItemTile'
import { formattedPrice, totalPrice } from '~/utils'
import TimeRangeSelect from '~/components/TimeRangeSelect'
import Navbar from '~/components/Navbar'
import AddItem from '~/components/AddItem'
import AiFillDelete from '~/components/icons/AiFillDelete'

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
  const selectHandler = (value: string) => {
    const values = value.split(' ')
    setSearchParams({ rangeType: values[0], previous: values[1] })
  }
  return (
    <>
      <Navbar username={data()?.user.name} />
      <main>
        <AddItem
          searchString={`?${new URLSearchParams(searchParams).toString()}`}
        />
        <Show when={data()?.workItems} keyed>
          {(items) => (
            <div class="my-2 mx-4 sm:m-8">
              <div class="flex items-center justify-between">
                <p class="text-lg">
                  Work done in
                  <TimeRangeSelect
                    onChange={(e) => selectHandler(e.currentTarget.value)}
                    optionString={optionString}
                  />
                  with total earning of {'  '}
                  <strong>{formattedPrice(totalPrice(items))}</strong>
                </p>
                <button class="btn btn-outline  btn-primary btn-disabled">
                  <AiFillDelete size={28} />
                </button>
              </div>
              <For each={items}>{(item) => <ItemTile item={item} />}</For>
            </div>
          )}
        </Show>
      </main>
    </>
  )
}
