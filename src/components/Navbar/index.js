import React, { useState, useMemo, useContext, useRef, useEffect } from 'react'
import { Link, graphql, useStaticQuery, navigate } from 'gatsby'
import Image from "gatsby-image"
import StoreContext from "../../context/StoreContext"
import { BreadcrumbNav } from ".."

import "./styles.scss"

const nameToURI = name => encodeURI(name.replace(/\s/g, "-").toLowerCase())

const CurrencySelector = () => {
  const { updateCurrency, store: { selected_currency, available_currencies } } = useContext(StoreContext)
  // const [ selected, setSelected ] = useState(0)

  const updateSelected = e => {
    const { value } = e.target
    const cur = available_currencies[value]
    updateCurrency(cur)
  }

  const getSelected = useMemo(() => (
    available_currencies.findIndex(op => selected_currency && op.code === selected_currency.code)
  ), [selected_currency, available_currencies])

  return (
    // eslint-disable-next-line
    <select className="nav-currency" value={ getSelected } onChange={ updateSelected }>
      { available_currencies.map((op, i) => <option key={ i } value={ i }>{ op.code } { op.symbol }</option>) }
    </select>
  )
}

const NavSearch = ({ isMobile }) => {
  const [ isOpen, setIsOpen ] = useState(false)
  // const [ query, setQuery ] = useState("")
  const inputRef = useRef()
  
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (isOpen) inputRef.current.focus()
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [ isOpen ])

  const handleEnter = ({ key, target: { value } }) => {
    if (key === "Enter") {
      navigate(`/search?query=${encodeURI(value)}`)
    }
  }

  const handleClick = () => {
    if (isMobile) {
      navigate(`/search?query=${encodeURI(inputRef.current.value)}`)
    } else {
      setIsOpen(true)
    }
  }
  
  return (
    <div className={`search-container ${ isOpen ? "is-open" : "" }`}>
      <input
        ref={ inputRef }
        disabled={ !isOpen && !isMobile }
        onKeyDown={ handleEnter }
        onBlur={ () => setIsOpen(false) }
      />
      <button className="nav-search" onClick={ handleClick }>
        <svg height="20" width="20" strokeWidth="2">
          <circle cx="8" cy="8" r="8" />
          <line x1="15" y1="15" x2="20" y2="20" />
        </svg>
      </button>
    </div>
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

const NavItem = ({ label, path, options }) => {
  const [ open, setOpen ] = useState(false)

  const handleSpace = ({ code, key }) => {
    if (options && (code === "Space" || key === "Spacebar")) {
      setOpen(!open)
    }
  }

  return (
    <li
      className="navbar-item-container"
      {...options && {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false)
      }}
    >
      <Link
        to={ path }
        onKeyDown={ handleSpace }
        className={`navbar-item ${ options ? "drop-down desktop-only" : "" }`}
      >{ label }</Link>
      <div
        onClick={ () => setOpen(!open) }
        className={`navbar-item ${ options ? "drop-down touch-only" : "" }`}
      >{ label }</div>
      {
        options ? (
          <ul className={`navbar-item-menu ${ open ? "open" : "" }`}>
            { options.map((op, i) => <li key={i}><Link to={ op.path }>{ op.label }</Link></li>) }
          </ul>
        ) : ""
      }
    </li>
  )
}

const Navbar = () => {
  const [ active, setActive ] = useState(false)
  const navBarActiveClass = active ? "is-active" : ""

  const { allShopifyProduct, infoPages, navigationJson, imageSharp: { fluid: logo_fluid }} = useStaticQuery(
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
        infoPages: allMarkdownRemark(filter: {frontmatter: {templateKey: {eq: "info-page"}}}) {
          nodes {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
        navigationJson {
          header {
            display {
              showBlog
              showContact
            }
            labels {
              shop
              info
              blog
              contact
            }
          }
        }
      }
    `
  )

  const { header: { display: { showBlog, showContact }, labels }} = navigationJson

  const productTypes = useMemo(() => allShopifyProduct.group.map(group => ({
    label: group.fieldValue,
    path: `/shop/${nameToURI(group.fieldValue)}`
  })), [ allShopifyProduct ])

  const infoOptions = useMemo(() => infoPages.nodes.map(page => ({
    label: page.frontmatter.title,
    path: page.fields.slug
  })), [ infoPages ])

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
          <div className="navbar-mobile-actions">
            <CurrencySelector />
            <NavSearch isMobile={ true } />
          </div>
          <ul className="navbar-menu-items">
            <NavItem path="/shop" label={ labels.shop } options={ productTypes } />
            <NavItem path="/info" label={ labels.info } options={ infoOptions } />
            { showBlog && <NavItem path="/blog" label={ labels.blog } /> }
            { showContact && <NavItem path="/contact" label={ labels.contact } /> }
          </ul>
        </div>
      </nav>
      <BreadcrumbNav />
      <FloatingCart />
    </>
  )
}

export default Navbar