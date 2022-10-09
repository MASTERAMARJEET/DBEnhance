import { WorkItem } from '@prisma/client'
import db from '.'

export async function getItems(userId: string) {
  const items = await db.workItem.findMany({
    where: { userId },
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
