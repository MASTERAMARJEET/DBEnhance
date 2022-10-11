import { WorkItem } from '@prisma/client'
import { getPreviousStart, getRange, getStart } from 'utils'
import db from '.'

export async function getItems(
  userId: string,
  dateRange: Parameters<typeof getStart>[0],
  previous?: boolean,
) {
  const rangeFunc = previous ? getPreviousStart : getStart
  const dates = getRange(dateRange, rangeFunc(dateRange, new Date()))
  const items = await db.workItem.findMany({
    where: {
      userId,
      date: {
        gte: dates[0],
        lte: dates[1],
      },
    },
    orderBy: {
      date: 'desc',
    },
  })
  return items
}
type AddItemProps = Pick<WorkItem, 'name' | 'userId'> & {
  price: number
}
export async function addItem({ name, price, userId }: AddItemProps) {
  const item = await db.workItem.create({
    data: {
      name,
      price,
      userId,
    },
  })
  return item
}
type DeleteItemsProps = {
  userId: WorkItem['userId']
  itemIds: WorkItem['id'][]
}
export async function deleteItems({ userId, itemIds }: DeleteItemsProps) {
  const { count } = await db.workItem.deleteMany({
    where: {
      id: {
        in: itemIds,
      },
      userId,
    },
  })
  return count
}
