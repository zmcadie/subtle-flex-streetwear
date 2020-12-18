import React from 'react'
import PropTypes from 'prop-types'
import { InfoPageTemplate } from '../../templates/info-page'

const InfoPagePreview = ({ entry, widgetFor }) => (
  <InfoPageTemplate
    title={entry.getIn(['data', 'title'])}
    content={widgetFor('body')}
  />
)

InfoPagePreview.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func,
  }),
  widgetFor: PropTypes.func,
}

export default InfoPagePreview
