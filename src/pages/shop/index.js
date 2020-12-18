import React, { useMemo } from "react"
import { graphql, Link } from "gatsby"

import { Layout, ProductCarousel, ProductFilter } from "../../components"
import { useQueryParams } from "../../utilities/hooks"
import { buildQuery, sortSize } from "../../utilities/utils"

import "./styles.scss"

const ProductsPage = ({ data }) => {
  const [ params ] = useQueryParams()

  const types = useMemo(() => {
    const productTypes = data.allShopifyProduct.group.map(type => {
      const { fieldValue: title, nodes } = type
      const handle = title.replace(/\s/g, "-").toLowerCase()
      
      const filter = product => {
        const filters = data.allShopifyProductOption.distinct.filter(name => name !== "Title")
        
        const filterFunc = name => () => {
          const checkName = op => op.name === name
          const checkValues = op => op.values.includes(params[name])
          return product.options.some(op => checkName(op) && checkValues(op))
        }
        
        const checks = []
        checks.push(() => product.availableForSale)
        filters.forEach(name => {
          if (params[name]) checks.push(filterFunc(name))
        })

        return checks.every(check => check())
      }

      const products = nodes.filter(filter)
      
      return products.length ? {
        key: handle,
        products,
        label: title,
        title: <Link to={ handle + buildQuery(params) }>{ title }</Link>
      } : null
    })
    return productTypes.filter(el => !!el)
  }, [ params, data ])

  const filters = useMemo(() => {
    const { distinct, group } = data.allShopifyProductOption
    
    const names = distinct.filter(type => type !== "Title")
    const options = group.reduce((acc, cur) => {
      const { fieldValue: name, nodes } = cur
      if (name === "Title") return acc
      
      const uniqValues = [...new Set(nodes.reduce((arr, node) => [...arr, ...node.values], []))]
      if (name === "Size") uniqValues.sort(sortSize)

      const options = uniqValues.map(el => ({ value: el, label: el }))
      
      return { ...acc, [name]: options }
    }, {})
    return { names, options }
  }, [ data ])

  return (
    <Layout className="product-page-layout">
      <h1>Shop</h1>
      <ProductFilter filters={ filters } />
      { types.length ? (
          types.map(type => <ProductCarousel {...type} />)
        ) : ""
      }
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
      group(field: name) {
        fieldValue
        nodes {
          values
        }
      }
    }
  }
`