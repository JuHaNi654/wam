type PathSegment = string | number

export function setAtPath<T>(target: T, path: readonly PathSegment[], value: unknown): T {
  if (path.length === 0) return target

  const cloneAt = (current: unknown, index: number): unknown => {
    if (current === null || typeof current !== "object") return current

    const key = path[index]
    if (key === undefined || !Object.prototype.hasOwnProperty.call(current, key)) return current

    const container = Array.isArray(current) ? [...current] : { ...current }
    const next = index === path.length - 1
      ? value
      : cloneAt((current as Record<PathSegment, unknown>)[key], index + 1)

    if (index < path.length - 1 && next === (current as Record<PathSegment, unknown>)[key]) return current

      ; (container as Record<PathSegment, unknown>)[key] = next
    return container
  }

  return cloneAt(target, 0) as T
}
