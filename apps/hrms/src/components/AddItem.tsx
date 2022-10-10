import type { Component } from 'solid-js'
import { FormError } from 'solid-start'
import { createServerAction$, redirect } from 'solid-start/server'
import { getUserId } from '~/db/session'
import { addItem } from '~/db/workItem'
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
interface AddItemProps {
  searchString: string
}
const AddItem: Component<AddItemProps> = (props) => {
  const [addingItem, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const userId = await getUserId(request)
      if (!userId) {
        throw redirect('/login')
      }
      const { name, price } = validatedItemForm(form)
      await addItem({ name, price, userId })
      throw redirect(`/${form.get('searchString') || ''}`)
    },
  )
  let itemFormRef: HTMLFormElement
  return (
    <Form
      class="m-4 flex flex-col items-center justify-evenly gap-4 sm:m-8 sm:flex-row sm:items-end"
      ref={itemFormRef!}
      onSubmit={() => {
        setTimeout(() => itemFormRef.reset())
      }}
    >
      <input name="searchString" type="hidden" value={props.searchString} />
      <label for="name" class="w-full">
        <span>Item Name</span>
        <p class="text-error my-1">
          {(addingItem.error as any)?.fieldErrors?.name}
        </p>
        <input name="name" type="text" class="input input-bordered w-full" />
      </label>
      <label for="price" class="w-full">
        <span>Item Price</span>
        <p class="text-error my-1">
          {(addingItem.error as any)?.fieldErrors?.price}
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
        classList={{ 'btn-disabled': addingItem.pending }}
      >
        Add
      </button>
    </Form>
  )
}
export default AddItem
