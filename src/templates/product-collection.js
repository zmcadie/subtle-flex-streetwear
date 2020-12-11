import React, { useMemo } from "react"
import { graphql, Link } from 'gatsby'

import { Layout, ProductGrid, ProductCarousel, ProductFilter } from "../components"
import { nameToURI, sortSize } from "../utilities/utils"
import { useQueryParams } from "../utilities/hooks"

const ProductCollectionTemplate = ({ pageContext, data }) => {
  const [ params ] = useQueryParams()
  const { title: collectionTitle, productType } = pageContext
  const { products } = data.shopifyCollection

  const collectionProducts = productType
    ? products.filter(prod => prod.productType === productType && prod.availableForSale)
    : products.reduce((acc, cur) => {
      if (!cur.availableForSale) return acc
      const productType = cur.productType
      const typeObj = acc.find(obj => obj.productType === productType)
      if (typeObj) {
        typeObj.products.push(cur)
      } else {
        acc.push({ productType, products: [ cur ] })
      }
      return acc
    }, [])

  const filters = useMemo(() => {
    const products = productType
      ? collectionProducts
      : collectionProducts.reduce((acc, { products }) => (
        [...acc, ...products]
      ), [])
    
    const names = []
    const options = products.reduce((acc, cur) => {
      cur.options.forEach(({ name, values }) => {
        if (name !== "Title") {
          names.push(name)
          acc[name] = [...acc[name] || [], ...values]
        }
      })
      
      return acc
    }, {})

    const uniqNames = [...new Set(names)]
    const uniqOptions = uniqNames.reduce((acc, cur) => {
      const ops = [...new Set(options[cur])]
        .sort(cur === "Size" ? sortSize : undefined)
        .map(op => ({ label: op, value: op }))
      
      return { ...acc, [cur]: ops }
    }, {})
    
    return { names: uniqNames, options: uniqOptions }
  }, [ collectionProducts ])

  const filteredProducts = useMemo(() => {
    const filterFunc = name => (product) => {
      const checkName = op => op.name === name
      const checkValues = op => op.values.includes(params[name])
      return product.options.some(op => checkName(op) && checkValues(op))
    }

    const checks = []
    checks.push(product => product.availableForSale)
    filters.names.forEach(name => {
      if (params[name]) checks.push(filterFunc(name))
    })

    const filtered = productType
      ? collectionProducts.filter(product => checks.every(check => check(product)))
      : collectionProducts.reduce((acc, cur) => {
        const filteredProducts = cur.products.filter(product => checks.every(check => check(product)))
        if (filteredProducts.length) acc.push({ ...cur, products: filteredProducts})
        return acc
      }, [])

    return filtered
  }, [ collectionProducts, params, filters ])

  return (
    <Layout className="product-page-layout">
      {/* { !productType && <h1>{ title }</h1> } */}
      <h1>{ collectionTitle }</h1>
      <ProductFilter filters={ filters } />
      { productType
        ? <ProductGrid {...{ products: filteredProducts }} />
        : filteredProducts.map(({ productType, products }, i) => {
          const typeURI = nameToURI(`/shop/${productType}/${collectionTitle}`)
          const title = <Link to={ typeURI }>{ productType }</Link>
          return <ProductCarousel key={ i } {...{ title, products }} />
        })
      }
    </Layout>
  )
}

export default ProductCollectionTemplate

export const productCollectionQuery = graphql`
query ProductCollectionQuery($title: String!) {
  shopifyCollection(title: {eq: $title}) {
    products {
      ...ProductFragment
    }
  }
}
`