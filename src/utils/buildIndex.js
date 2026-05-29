export default function buildIndex(collection, computeKey, replace = () => true) {
  const index = {};
  for (const item of collection) {
    const key = computeKey(item);
    if (!(key in index) || replace(index[key], item)) {
      index[key] = item;
    }
  }
  return index;
}
