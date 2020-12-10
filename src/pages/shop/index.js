import React, { useState, useMemo, useEffect } from "react"
import { graphql, Link } from "gatsby"

import { Layout, ProductCarousel, ProductFilter } from "../../components"
import { useQueryParams } from "../../utilities/hooks"
import { buildQuery } from "../../utilities/utils"

import "./styles.scss"

const ProductsPage = ({ data }) => {
  const [ params ] = useQueryParams()

  const types = useMemo(() => data.allShopifyProduct.group.map((type, i) => {
    const { fieldValue: title, nodes } = type
    const handle = title.replace(/\s/g, "-").toLowerCase()
    
    // console.log("products", products)
    const filter = product => {
      const { size } = params
      
      const sizeFilter = () => {
        const checkName = op => op.name.toLowerCase() === "size"
        const checkValues = op => op.values.includes(size)
        return product.options.some(op => checkName(op) && checkValues(op))
      }
      
      const checks = []
      if (size) checks.push(sizeFilter)

      return checks.every(check => check())
    }

    const products = nodes.filter(filter)
    
    return {
      key: handle,
      products,
      label: title,
      title: <Link to={ handle + buildQuery(params) }>{ title }</Link>
    }
  }), [ params ])

  return (
    <Layout className="product-page-layout">
      <h1>Shop</h1>
      <ProductFilter options={ data.allShopifyProductOption.distinct } />
      { types.map(type => type.products.length ? (
        <ProductCarousel {...type} />
      ) : "") }
    </Layout>
  )
}

export default ProductsPage

export const query = graphql`
  {
    allShopifyProduct(sort: {fields: title}) {
      group(field: productType) {
        fieldValue
        nodes {
          ...ProductFragment
        }
      }
    }
    allShopifyProductOption {
      distinct(field: name)
    }
  }
`