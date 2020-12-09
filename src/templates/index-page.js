import React from 'react'
import PropTypes from 'prop-types'
import { Link, graphql } from 'gatsby'

import { Layout, Features, BlogRoll, ProductCarousel } from '../components'

import './index-page.scss'

export const IndexPageTemplate = ({
  image,
  title,
  heading,
  subheading,
  mainpitch,
  description,
  intro,
  ourPicks
}) => (
  <div>
    <div
      className="full-width-image margin-top-0 hero-img"
      style={{
        backgroundImage: `url(${
          !!image.childImageSharp ? image.childImageSharp.fluid.src : image
        })`,
      }}
    >
      <Link to="/shop/mens" className="landing-img-button">Shop Men's Vintage</Link>
      <Link to="/shop/womens" className="landing-img-button">Shop Women's Vintage</Link>
    </div>
    <ProductCarousel products={ ourPicks } title="Our Picks" />
  </div>
)

IndexPageTemplate.propTypes = {
  image: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  title: PropTypes.string,
  heading: PropTypes.string,
  subheading: PropTypes.string,
  mainpitch: PropTypes.object,
  description: PropTypes.string,
  intro: PropTypes.shape({
    blurbs: PropTypes.array,
  }),
}

const IndexPage = ({ data }) => {
  const { frontmatter } = data.markdownRemark
  const { products: ourPicks } = data.shopifyCollection

  return (
    <Layout className="index-page">
      <IndexPageTemplate
        image={frontmatter.image}
        title={frontmatter.title}
        heading={frontmatter.heading}
        subheading={frontmatter.subheading}
        mainpitch={frontmatter.mainpitch}
        description={frontmatter.description}
        intro={frontmatter.intro}
        ourPicks={ ourPicks }
      />
    </Layout>
  )
}

IndexPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
}

export default IndexPage

export const query = graphql`
  fragment ProductFragment on ShopifyProduct {
    availableForSale
    title
    shopifyId
    handle
    productType
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
`

export const pageQuery = graphql`
  query IndexPageTemplate {
    shopifyCollection(title: {eq: "Our Picks"}) {
      products {
        ...ProductFragment
      }
    }
    markdownRemark(frontmatter: { templateKey: { eq: "index-page" } }) {
      frontmatter {
        title
        image {
          childImageSharp {
            fluid(maxWidth: 2048, quality: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        heading
        subheading
        mainpitch {
          title
          description
        }
        description
        intro {
          blurbs {
            image {
              childImageSharp {
                fluid(maxWidth: 240, quality: 64) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
            text
          }
          heading
          description
        }
      }
    }
  }
`
