import { db } from '.'

interface WorkItem {
  name: string
  price: number
  userId: string
}
export async function getItems(userId: string) {
  const items = await db.workItem.findMany({
    where: { userId },
  })
  return items
}
export async function addItem({ name, price, userId }: WorkItem) {
  const item = await db.workItem.create({
    data: {
      name,
      price,
      userId,
    },
  })
  return item
}
