const _ = require('lodash')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { fmImagesToRelative } = require('gatsby-remark-relative-images')

const nameToURI = name => encodeURI(name.replace(/\s/g, "-").toLowerCase())

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              tags
              templateKey
            }
          }
        }
      }
      allShopifyProduct(sort: { fields: [title] }) {
        edges {
          node {
            title
            shopifyId
            handle
            description
            availableForSale
            priceRange {
              maxVariantPrice {
                amount
              }
              minVariantPrice {
                amount
              }
            }
            images {
              originalSrc
            }
            variants {
              presentmentPrices {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
        group(field: productType) {
          fieldValue
        }
      }
      allShopifyCollection {
        nodes {
          title
        }
      }
    }
  `)
  
  if (result.errors) {
    result.errors.forEach((e) => console.error(e.toString()))
    return Promise.reject(result.errors)
  }

  const products = result.data.allShopifyProduct.edges
  const productTypes = result.data.allShopifyProduct.group
  const collections = result.data.allShopifyCollection.nodes
  const posts = result.data.allMarkdownRemark.edges

  products.forEach(({ node }) => {
    createPage({
      path: `/shop/${node.handle}`,
      component: path.resolve(`./src/templates/product.js`),
      context: {
        product: node,
      },
    })
  })
  
  productTypes.forEach(({ fieldValue: productType }) => {
    const typeURI = nameToURI(productType)
    const typePath = `/shop/${typeURI}`
    createPage({
      path: typePath,
      component: path.resolve(`./src/templates/product-type.js`),
      context: {
        productType
      },
    })
    collections.forEach(({ title }) => {
      const collectionURI = nameToURI(title)
      const collectionPath = `/shop/${typeURI}/${collectionURI}`
      createPage({
        path: collectionPath,
        component: path.resolve(`./src/templates/product-collection.js`),
        context: {
          title,
          productType
        },
      })
    })
  })
  
  collections.forEach(({ title }) => {
    const collectionPath = `/shop/${nameToURI(title)}`
    createPage({
      path: collectionPath,
      component: path.resolve(`./src/templates/product-collection.js`),
      context: {
        title
      },
    })
  })

  posts.forEach((edge) => {
    const id = edge.node.id
    createPage({
      path: edge.node.fields.slug,
      tags: edge.node.frontmatter.tags,
      component: path.resolve(
        `src/templates/${String(edge.node.frontmatter.templateKey)}.js`
      ),
      context: {
        id,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  fmImagesToRelative(node) // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
