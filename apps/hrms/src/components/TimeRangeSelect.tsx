import { Component, For, JSX } from 'solid-js'
const options: { title: string; value: string }[] = [
  { value: 'day false', title: 'Today' },

  { value: 'day true', title: 'Yesterday' },

  { value: 'month false', title: 'This Month' },

  { value: 'month true', title: 'Last Month' },

  { value: 'year false', title: 'This year' },
]

interface TimeRangeSelectProps {
  onChange: JSX.EventHandlerUnion<HTMLSelectElement, Event>
  optionString: string
}
const TimeRangeSelect: Component<TimeRangeSelectProps> = (props) => {
  return (
    <select
      onChange={props.onChange}
      class="select select-sm select-bordered select-primary mx-2 my-2"
    >
      <For each={options}>
        {(opt) => (
          <option selected={props.optionString === opt.value} value={opt.value}>
            {opt.title}
          </option>
        )}
      </For>
    </select>
  )
}
export default TimeRangeSelect
