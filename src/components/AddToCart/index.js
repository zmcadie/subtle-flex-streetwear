import React, { useContext, useState, useEffect } from "react"
import Button from "../Button"
import StoreContext from "../../context/StoreContext"

const AddToCart = ({ productId, className, children, ...props }) => {
  const { addItemToCart, removeLineItem, store: { client, checkout }} = useContext(StoreContext)
  const [ lineItemId, setLineItemId ] = useState()
  const [ transition, setTransition ] = useState(false)

  useEffect(() => {
    const lineItem = checkout.lineItems
      .find(item => item.variant && item.variant.id === productId)
    setLineItemId(lineItem ? lineItem.id : null)
    setTransition(false)
  }, [checkout, productId])

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (lineItemId) {
      setTransition(true)
      removeLineItem(client, checkout.id, lineItemId)
    } else {
      setTransition(true)
      addItemToCart(productId)
    }
  }

  return (
    <Button
      disabled={ transition }
      onClick={ handleAddToCart }
      className={`add-to-cart-button ${ lineItemId ? "remove-from-cart" : "" } ${ className }`}
      { ...props }
    >
      { lineItemId ? "Remove from cart" : "Add to cart"}
    </Button>
  )
}

export default AddToCart