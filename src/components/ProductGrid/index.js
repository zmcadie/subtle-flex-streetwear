import React from "react"
import ProductPreview from "../ProductPreview"

const ProductGrid = ({ products, title, description }) => (
  <ul className="product-grid-container">
    { title ? <h2>{ title }</h2> : "" }
    { products.filter(product => product.availableForSale).map((product, i) => <ProductPreview key={ product.shopifyId } product={ product } />) }
  </ul>
)

export default ProductGrid