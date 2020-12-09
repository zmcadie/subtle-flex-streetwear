import React, { useState, useMemo, useContext } from 'react'
import { Link, graphql, useStaticQuery } from 'gatsby'
import Image from "gatsby-image"
import StoreContext from "../../context/StoreContext"
import { BreadcrumbNav } from ".."

const currencyOptions = [
  { label: "CAD $", value: { code: "CAD", symbol: "$" }},
  { label: "USD $", value: { code: "USD", symbol: "$" }},
  { label: "GBP £", value: { code: "GBP", symbol: "£" }},
  { label: "EUR €", value: { code: "EUR", symbol: "€" }}
]

const CurrencySelector = () => {
  const { updateCurrency, store: { selected_currency } } = useContext(StoreContext)
  // const [ selected, setSelected ] = useState(0)

  const updateSelected = e => {
    const { value } = e.target
    const cur = currencyOptions[value].value
    updateCurrency(cur)
  }

  const getSelected = useMemo(() => (
    currencyOptions.findIndex(op => selected_currency && op.value.code === selected_currency.code)
  ), [selected_currency])

  return (
    <select className="nav-currency" value={ getSelected } onChange={ updateSelected }>
      { currencyOptions.map((op, i) => <option key={ i } value={ i }>{ op.label }</option>) }
    </select>
  )
}

const NavSearch = () => {
  return (
    <button className="nav-search">
      <svg height="20" width="20" strokeWidth="2">
        <circle cx="8" cy="8" r="8" />
        <line x1="15" y1="15" x2="20" y2="20" />
      </svg>
    </button>
  )
}

// alternate icons at https://jsfiddle.net/spu7j6hL/1/
const FloatingCart = () => {
  const { toggleCartOpen, store: { checkout } } = useContext(StoreContext)
  return (
    <button className={`floating-cart ${checkout.lineItems.length ? "" : "empty"}`} onClick={ toggleCartOpen }>
      {/* Cart ({ checkout.lineItems.length }) */}
      <svg height="35" width="45" strokeWidth="2">
        <path d="M 0 0 L 7 0 L 15 24 L 35 24 L 15 24 L 14 20 L 36 18 L 39 4 L 9 3 L 7 0 "/>
        <circle cx="17" cy="28" r="1.5" />
        <circle cx="32" cy="28" r="1.5" />
        <text x="24" y="16.5">{ checkout.lineItems.length }</text>
      </svg>
    </button>
  )
}

const NavCart = () => {
  const { toggleCartOpen, store: { checkout } } = useContext(StoreContext)
  return (
    <button className={`nav-cart ${checkout.lineItems.length ? "" : "empty"}`} onClick={ toggleCartOpen }>
      Cart ({ checkout.lineItems.length })
    </button>
  )
}

const NavItem = ({ label, path, options }) => (
  <li className="navbar-item-container">
    <Link className={`navbar-item ${ options ? "drop-down" : "" }`} to={ path }>{ label }</Link>
    {
      options ? (
        <ul className="navbar-item-menu">
          { options.map((op, i) => <li key={i}><Link to={ op.path }>{ op.label }</Link></li>) }
        </ul>
      ) : ""
    }
  </li>
)

const Navbar = ({ hideBreadcrumb = false }) => {
  const { toggleCartOpen, store: { checkout } } = useContext(StoreContext)
  const [ active, setActive ] = useState(false)
  const navBarActiveClass = active ? "is-active" : ""

  const { allShopifyProduct, imageSharp: { fluid: logo_fluid }} = useStaticQuery(
    graphql`
      {
        allShopifyProduct {
          group(field: productType) {
            fieldValue
          }
        }
        imageSharp(fixed: {originalName: {eq: "logo_wordmark.png"}}) {
          fluid(maxHeight: 75) {
            presentationHeight
            presentationWidth
            ...GatsbyImageSharpFluid_withWebp_tracedSVG
          }
        }
      }
    `
  )

  const productTypes = useMemo(() => allShopifyProduct.group.map(group => ({
    label: group.fieldValue,
    path: `/shop/${encodeURI(group.fieldValue.toLowerCase())}`
  })), [ allShopifyProduct ])

  const toggleHamburger = () => {
    setActive(!active)
  }

  return (
    <>
      <nav
        className="custom-navbar is-transparent"
        role="navigation"
        aria-label="main-navigation"
      >
        <div className="navbar-left">
          <CurrencySelector />
        </div>
        <Link to="/" className="navbar-logo-container" title="Logo">
          <Image
            className="navbar-logo-image"
            fluid={ logo_fluid }
            alt="Subtle Flex Streetwear"
            style={{
              maxHeight: logo_fluid.presentationHeight,
              maxWidth: logo_fluid.presentationWidth
            }}
          />
        </Link>
        <div className="navbar-right">
          <NavSearch />
          <NavCart />
          <button
            className={`navbar-burger burger ${ navBarActiveClass }`}
            data-target="navMenu"
            onClick={ toggleHamburger }
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <div
          id="navbar-menu"
          className={`custom-navbar-menu ${ navBarActiveClass }`}
        >
          <ul className="navbar-menu-items">
            <NavItem path="/shop"     label="Shop" options={ productTypes } />
            <NavItem path="/about"    label="About" />
            <NavItem path="/blog"     label="Blog"  />
            <NavItem path="/contact"  label="Contact"  />
          </ul>
        </div>
      </nav>
      <BreadcrumbNav />
      <FloatingCart />
    </>
  )
}

export default Navbar