import React from 'react'
import { Helmet } from 'react-helmet'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import Cart from '../components/Cart'
import './all.scss'
import useSiteMetadata from './SiteMetadata'
import { withPrefix } from 'gatsby'
import ContextProvider from '../provider/ContextProvider'

import "./AddToCart/styles.scss"
import "./BreadcrumbNav/styles.scss"
import "./Button/styles.scss"
import "./Cart/styles.scss"
import "./Navbar/styles.scss"
import "./ProductCarousel/styles.scss"
import "./ProductFilter/styles.scss"
import "./ProductGrid/styles.scss"
import "./ProductPreview/styles.scss"

const TemplateWrapper = ({ children, ...innerProps }) => {
  const { title, description } = useSiteMetadata()
  return (
    <ContextProvider>
      <div>
        <Helmet>
          <html lang="en" />
          <title>{title}</title>
          <meta name="description" content={description} />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={`${withPrefix('/')}img/apple-touch-icon.png`}
          />
          <link
            rel="icon"
            type="image/png"
            href={`${withPrefix('/')}img/favicon-32x32.png`}
            sizes="32x32"
          />
          <link
            rel="icon"
            type="image/png"
            href={`${withPrefix('/')}img/favicon-16x16.png`}
            sizes="16x16"
          />

          <link
            rel="mask-icon"
            href={`${withPrefix('/')}img/safari-pinned-tab.svg`}
            color="#ff4400"
          />
          <meta name="theme-color" content="#fff" />

          <meta property="og:type" content="business.business" />
          <meta property="og:title" content={title} />
          <meta property="og:url" content="/" />
          <meta
            property="og:image"
            content={`${withPrefix('/')}img/og-image.jpg`}
          />
        </Helmet>
        <Navbar />
        <div {...innerProps}>{children}</div>
        <Footer />
      </div>
      <Cart />
    </ContextProvider>
  )
}

export default TemplateWrapper
