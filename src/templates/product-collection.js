import React from "react"
import { graphql, Link } from 'gatsby'

import { Layout, ProductGrid, ProductCarousel } from "../components"
import { nameToURI } from "../utilities/utils"

const ProductCollectionTemplate = ({ pageContext, data }) => {
  const { title, productType } = pageContext
  const { products } = data.shopifyCollection

  const collectionProducts = productType
    ? products.filter(prod => prod.productType === productType)
    : products.reduce((acc, cur) => {
      const productType = cur.productType
      const typeObj = acc.find(obj => obj.productType === productType)
      if (typeObj) {
        typeObj.products.push(cur)
      } else {
        acc.push({ productType, products: [ cur ] })
      }
      return acc
    }, [])

  return (
    <Layout className="product-page-layout">
      {/* { !productType && <h1>{ title }</h1> } */}
      <h1>{ title }</h1>
      { productType
        ? <ProductGrid {...{ products: collectionProducts }} />
        : collectionProducts.map(({ productType, products }, i) => {
          const typeURI = nameToURI(productType)
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