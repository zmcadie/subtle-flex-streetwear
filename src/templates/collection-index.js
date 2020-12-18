import React from 'react'
import { graphql } from 'gatsby'

import { Layout, CollectionPreview } from '../components'

import "./collection-index.scss"

const CollectionIndex = ({ data }) => {
  return (
    <Layout>
      <ul className="collection-grid-container">
        { data.allShopifyCollection.nodes.map((collection, i) => (
          <CollectionPreview {...{ collection }} />
        )) }
      </ul>
    </Layout>
  )
}

export default CollectionIndex

export const pageQuery = graphql`
  query CollectionIndex {
    allShopifyCollection {
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
  }
`
