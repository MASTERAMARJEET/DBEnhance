import { WorkItem } from '@prisma/client'
import { Component } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import { formatedDateTime, formattedPrice } from '~/utils'
interface ItemTileProps {
  item: WorkItem
  setSelected: SetStoreFunction<number[]>
}
const ItemTile: Component<ItemTileProps> = (props) => {
  return (
    <div class="my-3 flex items-center justify-between rounded-lg border-2 p-2">
      <div class="mx-4 flex-1 overflow-x-clip text-ellipsis text-2xl">
        <p>{props.item.name}</p>
        <p class="whitespace-nowrap text-sm">
          {formatedDateTime(props.item.date)}
        </p>
      </div>
      <p class="whitespace-nowrap pr-4 text-right text-lg sm:text-xl">
        {formattedPrice(Number(props.item.price))}
      </p>
      <input
        type="checkbox"
        class="checkbox checkbox-primary mx-3"
        onChange={(e) => {
          if (e.currentTarget.checked) {
            props.setSelected((prev) => [...prev, props.item.id])
          } else {
            props.setSelected((prev) =>
              prev.filter((id) => props.item.id !== id),
            )
          }
        }}
      />
    </div>
  )
}
export default ItemTile
