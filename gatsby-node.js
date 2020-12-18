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
              featuredCollections
            }
          }
        }
      }
      allShopifyProduct(sort: { fields: [title] }) {
        edges {
          node {
            id
            handle
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
      allShopifyShopPolicy {
        nodes {
          title
          handle
          url
          body
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
  const markdown = result.data.allMarkdownRemark.edges
  const policies = result.data.allShopifyShopPolicy.nodes

  products.forEach(({ node }) => {
    createPage({
      path: `/shop/${node.handle}`,
      component: path.resolve(`./src/templates/product.js`),
      context: {
        id: node.id,
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
    const collectionPath = `/shop/collections/${nameToURI(title)}`
    createPage({
      path: collectionPath,
      component: path.resolve(`./src/templates/product-collection.js`),
      context: {
        title
      },
    })
  })

  createPage({
    path: `/shop/collections`,
    component: path.resolve(`./src/templates/collection-index.js`)
  })

  markdown.forEach((edge) => {
    const {
      id,
      fields: { slug },
      frontmatter
    } = edge.node

    const { featuredCollections } = frontmatter

    createPage({
      path: slug,
      tags: frontmatter.tags,
      component: path.resolve(
        `src/templates/${String(frontmatter.templateKey)}.js`
      ),
      context: {
        id,
        ...featuredCollections && {
          featuredCollections
        }
      },
    })
  })

  policies.forEach(policy => {
    createPage({
      path: policy.handle,
      component: path.resolve(`src/templates/policy-page.js`),
      context: policy,
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
