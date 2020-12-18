import React, { useMemo } from "react"
import { graphql, Link } from 'gatsby'

import { Layout, ProductCarousel, ProductFilter } from "../components"
import { useQueryParams } from "../utilities/hooks"
import { nameToURI, sortSize } from "../utilities/utils"

const ProductTypeTemplate = ({ pageContext, data }) => {
  const [ params ] = useQueryParams()

  const collections = useMemo(() => data.allShopifyCollection.group.map((collection, i) => {
    const { fieldValue: title, nodes: [{ products }] } = collection
    const collectionProducts = products.filter(prod => prod.productType === pageContext.productType && prod.availableForSale)
    
    return {
      key: i,
      title: <Link to={ nameToURI(title) }>{ title }</Link>,
      products: collectionProducts
    }
  }), [ data, pageContext ])

  const filters = useMemo(() => {
    const names = []
    const options = collections.reduce((acc, cur) => {
      cur.products.forEach(({ options }) => {
        options.forEach(({ name, values }) => {
          if (name !== "Title") {
            names.push(name)
            acc[name] = [...acc[name] || [], ...values]
          }
        })
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
  }, [ collections ])

  const filteredCollections = useMemo(() => {
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

    return collections.reduce((acc, cur) => {
      const filteredProducts = cur.products.filter(product => checks.every(check => check(product)))
      if (filteredProducts.length) acc.push({ ...cur, products: filteredProducts})
      return acc
    }, [])
  }, [ collections, params, filters ])

  return (
    <Layout className="product-page-layout">
      <h1>{ pageContext.productType }</h1>
      <ProductFilter filters={ filters } />
      { filteredCollections.map(col => {
        return <ProductCarousel {...col} />
      }) }
    </Layout>
  )
}

export default ProductTypeTemplate

export const productTypeQuery = graphql`
query ProductTypeQuery($productType: String!) {
  allShopifyCollection(filter: { products: { elemMatch: { productType: { eq: $productType }}}}) {
    group(field: title){
      fieldValue
      nodes {
        products {
          ...ProductFragment
        }
      }
    }
  }
}
`