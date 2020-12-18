import React from 'react'
import CMS from 'netlify-cms-app'
import Client from 'shopify-buy'

const client = Client.buildClient(
  {
    storefrontAccessToken: process.env.GATSBY_SHOPIFY_ACCESS_TOKEN,
    domain: `${process.env.GATSBY_SHOPIFY_SHOP_NAME}.myshopify.com`,
  },
  fetch
)

const collections = client.collection.fetchAll()

export class Control extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collectionOptions: [] };
  }

  componentDidMount() {
    collections.then(cols => (
      cols.map(col => ({
        label: col.title,
        value: col.title
      }))
    )).then(options => {
      this.setState({
        collectionOptions: options
      })
    })
  }

  render() {
    const SelectControl = CMS.getWidget('select').control
    const selectProps = { ...this.props }
    selectProps.field = selectProps.field.set('options', this.state.collectionOptions)
    return (
      <SelectControl {...selectProps} />
    )
  }
}

export const preview = (props) => {
  return (
      <div>{props.value}</div>
  );
}