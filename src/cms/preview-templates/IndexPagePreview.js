import React, { useEffect, useState } from 'react'
// import PropTypes from 'prop-types'
import IndexPageTemplate from '../../templates/index-page'
import Client from 'shopify-buy'

const client = Client.buildClient(
  {
    storefrontAccessToken: process.env.GATSBY_SHOPIFY_ACCESS_TOKEN,
    domain: `${process.env.GATSBY_SHOPIFY_SHOP_NAME}.myshopify.com`,
  },
  fetch
)

const IndexPagePreview = ({ entry, getAsset }) => {
  const entryData = entry.getIn(['data']).toJS()
  const { featuredCollections, heroBanner, templateKey } = entryData
  const [ featured, setFeatured ] = useState([])

  useEffect(() => {
    const getCollections = async () => {
      const query = featuredCollections.map(title => `title:'${title}'`).join(" OR ")
      const ids = await client.collection.fetchQuery({ query }).then(columns => columns.map(({id}) => id))
      const featured = await Promise.all(ids.map(id => client.collection.fetchWithProducts(id)))
      setFeatured(featured)
    }
    if (featuredCollections) getCollections()
  }, [ featuredCollections ])
  
  const pageContext = { featuredCollections }
  const data = {
    markdownRemark: { frontmatter: { heroBanner, templateKey }},
    allShopifyCollection: {},
    featured: { nodes: featured }
  }

  if (entryData) {
    // return <div>TEST</div>
    return <IndexPageTemplate {...{data, pageContext}} />
  } else {
    return <div>Loading...</div>
  }
}

// IndexPagePreview.propTypes = {
//   entry: PropTypes.shape({
//     getIn: PropTypes.func,
//   }),
//   getAsset: PropTypes.func,
// }

export default IndexPagePreview
