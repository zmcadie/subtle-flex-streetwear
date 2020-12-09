import { useEffect } from 'react'
import { useState } from 'react'
import { parseQuery, buildQuery } from "./utils"

let listeners = []

const updateParams = (query, newState = false) => {
  const queryString = buildQuery(query)
  const update = query => newState
    ? window.history.pushState(window.history.state, "", query)
    : window.history.replaceState(window.history.state, "", query)
  
  update(queryString)

  listeners.forEach(listener => listener(query))
}

export const useQueryParams = () => {
  const [params, newListener] = useState(parseQuery(window.location))

  useEffect(() => {
    listeners.push(newListener)
    return () => listeners = listeners.filter(listener => listener !== newListener)
  }, [ newListener ])
  
  return [ params, updateParams ]
}