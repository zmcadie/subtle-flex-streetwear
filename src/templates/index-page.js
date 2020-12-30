import React from 'react'
import { Link, graphql } from 'gatsby'

import { Layout, ProductCarousel, CollectionCarousel } from '../components'
import { nameToURI } from '../utilities/utils'

import './index-page.scss'

const IndexPageTemplate = ({ data, pageContext }) => {
  const { markdownRemark, allShopifyCollection, featured } = data
  const { frontmatter: {
    heroBanner: {
      image,
      navLeft,
      navRight
    }
  }} = markdownRemark

  const featuredCollections = featured.nodes.sort((a, b) => {
    const indexA = pageContext.featuredCollections.findIndex(el => el === a.title)
    const indexB = pageContext.featuredCollections.findIndex(el => el === b.title)
    return indexA - indexB
  })

  return (
    <Layout className="index-page">
      <div
        className="full-width-image margin-top-0 hero-img"
        style={{
          backgroundImage: `url(${
            !!image.childImageSharp ? image.childImageSharp.fluid.src : image
          })`,
        }}
      >
        <Link to={`/shop/${nameToURI(navLeft.collection)}`} className="landing-img-button">{ navLeft.label }</Link>
        <Link to={`/shop/${nameToURI(navRight.collection)}`} className="landing-img-button">{ navRight.label }</Link>
      </div>
      { featuredCollections.map(collection => {
        const { products, handle, title: colTitle } = collection
        const title = <Link to={`/shop/collections/${handle}`}>{ colTitle }</Link>
        return (
          <ProductCarousel
            key={ handle }
            from={ `/shop/collections/${handle}` }
            {...{ title, products }}
          />
        )
      }) }
      <CollectionCarousel
        collections={ allShopifyCollection.nodes }
        title="Other Collections"
      />
    </Layout>
  )
}

export default IndexPageTemplate

export const query = graphql`
  fragment ProductFragment on ShopifyProduct {
    availableForSale
    title
    shopifyId
    handle
    productType
    tags
    options {
      name
      values
    }
    priceRange {
      minVariantPrice {
        amount
      }
    }
    images {
      id
      originalSrc
      localFile {
        childImageSharp {
          fluid(maxWidth: 910) {
            ...GatsbyImageSharpFluid_withWebp_tracedSVG
          }
        }
      }
    }
    variants {
      shopifyId
      selectedOptions {
        name
        value
      }
      presentmentPrices {
        edges {
          node {
            compareAtPrice {
              amount
              currencyCode
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

export const pageQuery = graphql`
  query IndexPageTemplate($id: String!, $featuredCollections: [String!]) {
    featured: allShopifyCollection(filter: { title: { in: $featuredCollections }}) {
      nodes {
        title,
        handle,
        products {
          ...ProductFragment
        }
      }
    }
    allShopifyCollection(filter: { title: { nin: $featuredCollections }}) {
      nodes {
        title,
        handle,
        image {
          localFile {
            childImageSharp {
              fluid(maxWidth: 910) {
                ...GatsbyImageSharpFluid_withWebp_tracedSVG
              }
            }
          }
        }
      }
    }
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        heroBanner {
          image {
            childImageSharp {
              fluid(maxWidth: 2048, quality: 100) {
                ...GatsbyImageSharpFluid
              }
            }
          }
          navLeft {
            label
            collection
          }
          navRight {
            label
            collection
          }
        }
      }
    }
  }
`
