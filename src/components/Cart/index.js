import React, { useContext, useEffect, useRef, useState } from "react"
import { Link } from 'gatsby'
import StoreContext from "../../context/StoreContext"
import { Button } from ".."

import "./styles.scss"

const X = ({ className, onClick, ...innerProps }) => (
  <button className={`x-close ${ className }`} {...{ onClick }}>
    <svg height="30" width="30" {...innerProps}>
      <circle cx="50%" cy="50%" r="50%" />
      <line x1="25%" y1="25%" x2="75%" y2="75%" />
      <line x1="75%" y1="25%" x2="25%" y2="75%" />
    </svg>
  </button>
)

const CurrencyDisplay = ({ price, showCode=false }) => {
  const { store: { selected_currency: { code, symbol }}} = useContext(StoreContext)
  const displayPrice = (Math.round(Number.parseFloat(price.amount) * 100) / 100).toFixed(2)
  return `${ showCode ? code + " " : "" }${ symbol }${ displayPrice }`
}

const LineItem = ({ item }) => {
  const [ isRemoving, setIsRemoving ] = useState(false)
  const { removeLineItem, store: { client, checkout, selected_currency } } = useContext(StoreContext)
  
  const handleRemove = () => {
    setIsRemoving(true)
    removeLineItem(client, checkout.id, item.id)
  }

  const price = item.variant.presentmentPrices.find(({price}) => price.currencyCode === selected_currency.code).price
  
  return (
    <li className="cart-item" style={{ opacity: isRemoving ? 0.5 : 1 }}>
      <Link className="item-link" to={ `/product/${item.variant.product.handle}/` }>
        <img src={ item.variant.image.src } alt={ item.handle } />
        <div className="item-details">
          <h2 className="item-title">{ item.title }</h2>
          <div className="item-price"><CurrencyDisplay {...{ price }} /></div>
        </div>
      </Link>
      <X onClick={ handleRemove } disabled={ isRemoving } />
    </li>
  )
}

const Cart = () => {
  const { isCartOpen, toggleCartOpen, store: { checkout } } = useContext(StoreContext)
  const overlayEl = useRef()

  const handleCheckout = () => {
    window.open(checkout.webUrl)
  }

  const lineItems = checkout.lineItems.map(item => (
    <LineItem key={item.id.toString()} item={item} />
  ))

  useEffect(() => {
    if (isCartOpen) {
      document.documentElement.style.overflow = "hidden"
      overlayEl.current.focus()
    } else {
      document.documentElement.style.overflow = ""
      document.getElementById("gatsby-focus-wrapper").focus()
    }
    return () => document.documentElement.style.overflow = ""
  }, [ isCartOpen ])

  useEffect(() => {
    const focusableEls = overlayEl.current.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
    const firstFocusable = focusableEls[0]
    const lastFocusable = focusableEls[focusableEls.length - 1]

    const captureFocusStart = event => {
      if (event.target !== event.currentTarget) return

      const { key, shiftKey } = event
      if (key === "Tab" && shiftKey) {
        lastFocusable.focus()
        event.preventDefault()
      }
    }
    
    const captureFocusEnd = event => {
      const { key, shiftKey } = event
      if (key === "Tab" && !shiftKey) {
        firstFocusable.focus()
        event.preventDefault()
      }
    }

    const closeOnEsc = event => {
      const { key } = event
      if (key === "Escape") toggleCartOpen()
    }

    const closeOnClick = event => {
      if (event.target === event.currentTarget) toggleCartOpen()
    }

    const overlay = overlayEl.current

    overlay.addEventListener("click", closeOnClick)
    overlay.addEventListener("keydown", closeOnEsc)
    overlay.addEventListener("keydown", captureFocusStart)
    firstFocusable.addEventListener("keydown", captureFocusStart)
    lastFocusable.addEventListener("keydown", captureFocusEnd)

    return () => {
      overlay.removeEventListener("click", closeOnClick)
      overlay.removeEventListener("keydown", closeOnEsc)
      overlay.removeEventListener("keydown", captureFocusStart)
      firstFocusable.removeEventListener("keydown", captureFocusStart)
      lastFocusable.removeEventListener("keydown", captureFocusEnd)
    }
  }, [ isCartOpen, toggleCartOpen ])

  return (
    <div className={`overlay ${isCartOpen ? "cart-visible" : ""}`} tabIndex="-1" ref={ overlayEl }>
      <div className="cart-container">
        <div className="cart-content">
          <div className="cart-header">
            <h1>Shopping cart</h1>
            <X onClick={ toggleCartOpen } />
          </div>
          <ul className="cart-line-items">
            { lineItems }
            { lineItems.length ? "" : (
              <>
                <h2 className="empty-cart-flag">It looks like your cart is empty!</h2>
                <Button className="keep-shopping" onClick={ toggleCartOpen }>Keep shopping</Button>
              </>
            ) }
          </ul>
          <div className="cart-footer">
            <div className="cart-subtotal">
              <h2>Cart Subtotal</h2>
              { checkout.subtotalPriceV2 && <CurrencyDisplay showCode={ true } price={ checkout.subtotalPriceV2 } /> }
              <p className="tax-disclaimer">Shipping & taxes calculated at checkout</p>
            </div>
            <Button
              className="cart-checkout"
              onClick={ handleCheckout }
              disabled={ checkout.lineItems.length === 0 }
            >
              Check out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart