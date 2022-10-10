export const urlToPrams = (url: string) => {
  // @ts-expect-error TS is stupid
  return Object.fromEntries(new URL(url).searchParams)
}
export const searchStringToPrams = (searchString: string) => {
  // @ts-expect-error TS is stupid
  return Object.fromEntries(new URLSearchParams(searchString))
}
