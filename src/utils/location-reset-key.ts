/** Location key used to reset QueryErrorBoundary and GA page_path. */
export function locationResetKey(location: {
  pathname: string
  search: string
  hash: string
}): string {
  return `${location.pathname}${location.search}${location.hash}`
}
