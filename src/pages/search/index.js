import React, { useState, useEffect, useMemo, useCallback } from "react"
import Client from "shopify-buy"
import { Link } from "gatsby"

import { Layout, ProductGrid, ProductFilter } from "../../components"
import { sortSize } from "../../utilities/utils"
import { useQueryParams } from "../../utilities/hooks"

import "./styles.scss"

const client = Client.buildClient(
  {
    storefrontAccessToken: process.env.GATSBY_SHOPIFY_ACCESS_TOKEN,
    domain: `${process.env.GATSBY_SHOPIFY_SHOP_NAME}.myshopify.com`,
  },
  fetch
)

const RefineSearch = () => {
  const [{ query }, updateParams] = useQueryParams()
  const [ newQuery, setNewQuery ] = useState("")

  useEffect(() => {
    setNewQuery(query)
  }, [ query ])

  const updateQuery = () => {
    updateParams({ query: newQuery })
  }

  const handleEnter = e => {
    if (e.key === "Enter") updateQuery()
  }

  return (
    <div className="refine-search-container">
      <label htmlFor="refine-search">
        Refine search
      </label>
      <input
        id="refine-search"
        type="search"
        value={ newQuery || "" }
        onChange={ e => setNewQuery(e.target.value) }
        onKeyDown={ handleEnter }
      />
      { query === newQuery ? "" : (
        <button className="refine-action" onClick={ updateQuery }>search</button>
      ) }
    </div>
  )
}

const SearchPage = () => {
  const [{ query, ...params }] = useQueryParams()
  const [ isLoading, setIsLoading ] = useState(false)
  const [ results, setResults ] = useState({ exact: [], close: [] })

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true)
      
      const exactMatch = query.split(" ").join(" AND ")
      const closeMatch = query.split(" ").length > 1 ? query.split(" ").join("* OR ") : query + "*"

      const [ exactResults, closeResults ] = await Promise.all([
        client.product.fetchQuery({ first: 20, query: exactMatch }),
        client.product.fetchQuery({ first: 20, query: closeMatch })
      ])

      const isAvailable = product => product.availableForSale

      const exact = exactResults.filter(isAvailable)
      const close = closeResults.filter(isAvailable)

      setResults({ exact, close })
      setIsLoading(false)
    }
    
    if (query) fetchResults()
  }, [ query ])
  
  const filteredResults = useMemo(() => {
    const productFilter = product => {
      const filterFunc = name => () => {
        const checkName = op => op.name === name
        const checkValues = op => op.values.map(({ value }) => value).includes(params[name])
        return product.options.some(op => checkName(op) && checkValues(op))
      }
      const checks = []
      Object.keys(params).forEach(name => {
        if (params[name]) checks.push(filterFunc(name))
      })

      return checks.every(check => check())
    }

    const exactResultsTitles = results.exact.map(prod => prod.title)
    const closeFilter = product => {
      if (!productFilter(product)) return false
      return !exactResultsTitles.includes(product.title)
    }
    
    return {
      exact: results.exact.filter(productFilter),
      close: results.close.filter(closeFilter)
    }
  }, [ params, results ])

  const filters = useMemo(() => {
    const getOptions = products => {
      const productOptions = products.reduce((acc, cur) => {
        cur.options.forEach(op => {
          if (op.name !== "Title") {
            acc.names.push(op.name)
            acc.options[op.name] = [
              ...(acc.options[op.name] || []),
              ...op.values.map(({ value }) => value)
            ]
          }
        })
        return acc
      }, {names: [], options: {}})

      productOptions.names = [...new Set(productOptions.names)]
      productOptions.names.forEach(name => {
        const uniqOps = [...new Set(productOptions.options[name])]
        if (name === "Size") uniqOps.sort(sortSize)
        productOptions.options[name] = uniqOps.map(val => ({ value: val, label: val }))
      })

      return productOptions
    }

    const exactResultsOptions = getOptions(results.exact)
    const closeResultsOptions = getOptions(results.close)

    return {
      exact: exactResultsOptions,
      close: closeResultsOptions
    }
  }, [ results ])

  const checkState = useCallback(() => {
    const LoadingDisplay = () => (
      <div className="state-display loading-results">
        Loading results<i>.</i><i>.</i><i>.</i>
      </div>
    )

    const EmptyDisplay = () => (
      <div className="state-display">
        <p>Whoops, looks like nothing matches <b>"{ query }"</b>.</p>
        <p>Here are some things you can try:</p>
        <ul>
          <li>Refine your search above</li>
          <li><Link to="/shop">Browse all our products</Link></li>
          { filteredResults.close.length ? <li>Check out similar products below</li> : "" }
        </ul>
      </div>
    )

    const isEmpty = filteredResults.exact.length === 0
    return isEmpty
      ? isLoading
        ? <LoadingDisplay />
        : <EmptyDisplay />
      : null
  }, [ isLoading, results, filteredResults ])

  return (
    <Layout className="search-page-layout">
      <h1>Search "{ query }"</h1>
      <RefineSearch />
      <ProductFilter filters={ filters.exact } />
      <ProductGrid
        title="Search results"
        products={ filteredResults.exact }
        displayState={ checkState }
        className={ isLoading ? "loading" : "" }
      />
      { filteredResults.close.length ? (
        <ProductGrid
          title="Similar products"
          products={ filteredResults.close }
          className={ isLoading ? "loading" : "" }
        /> 
      ) : "" }
    </Layout>
  )
}

export default SearchPage