import React, { useMemo } from "react"
import { ProductPreview } from "../ItemPreview"

import "./styles.scss"

const ProductGrid = ({ products, title, displayState, className }) => {
  const stateDisplay = displayState && displayState()
  const productPreviews = useMemo(() => {
    const isAvailable = product => product.availableForSale
    const toPreview = (product, i) => (<ProductPreview key={ i } product={ product } />)
    return products.filter(isAvailable).map(toPreview)
  }, [ products ])
  return (
    <ul className={`product-grid-container ${className}`}>
      { title ? <h2>{ title }</h2> : "" }
      { stateDisplay
        ? stateDisplay
        : productPreviews
      }
    </ul>
  )
}

export default ProductGrid