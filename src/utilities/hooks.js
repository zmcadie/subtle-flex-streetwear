import { useEffect } from 'react'
import { useState } from 'react'
import { parseQuery, buildQuery } from "./utils"

let listeners = []
let params

const updateParams = (query, newState = false) => {
  const queryString = buildQuery(query)
  const update = query => newState
    ? window.history.pushState(window.history.state, "", query)
    : window.history.replaceState(window.history.state, "", query)
  
  update(queryString)
  params = query

  listeners.forEach(listener => listener(params))
}

export const useQueryParams = () => {
  const newListener = useState()[1]

  useEffect(() => {
    if (!params) params = parseQuery(window.location)
    listeners.push(newListener)
    return () => listeners = listeners.filter(listener => listener !== newListener)
  }, [ newListener ])
  
  return [ params || {}, updateParams ]
}