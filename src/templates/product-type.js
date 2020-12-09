import React from "react"
import { graphql, Link } from 'gatsby'

import { Layout, ProductGrid, ProductCarousel } from "../components"
import { useQueryParams } from "../utilities/hooks"
import { nameToURI } from "../utilities/utils"

const ProductTypeTemplate = ({ pageContext, data, location }) => {
  const [ params, updateParams ] = useQueryParams()
  const { productType } = pageContext
  const { allShopifyProduct, allShopifyCollection } = data
  // const products = allShopifyProduct.edges.map(({ node }) => node)
  const collections = allShopifyCollection.group.map((collection, i) => {
    const { fieldValue: title, nodes: [{ products }] } = collection
    const collectionProducts = products.filter(prod => prod.productType === productType)
    return {
      key: i,
      title: <Link to={ nameToURI(title) }>{ title }</Link>,
      products: collectionProducts
    }
  })

  return (
    <Layout className="product-page-layout">
      <h1>{ productType }</h1>
      { collections.map(col => <ProductCarousel {...col} />) }
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