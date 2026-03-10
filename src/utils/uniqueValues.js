// Mildly faster than doing set expansion
export default function uniqueValues (collection) {
  return collection.filter((value, index, self) =>
    index === self.findIndex((t) => (t === value))
  )
}
