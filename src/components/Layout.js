import React from 'react'
import { Helmet } from 'react-helmet'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import Cart from '../components/Cart'
import './all.scss'
import useSiteMetadata from './SiteMetadata'
import { withPrefix, useStaticQuery, graphql } from 'gatsby'
import ContextProvider from '../provider/ContextProvider'

const TemplateWrapper = ({ children, ...innerProps }) => {
  const { title, description } = useSiteMetadata()
  const heroImg = useStaticQuery(graphql`
    query HeroImage {
      markdownRemark(fields: {slug: {eq: "/"}}) {
        frontmatter {
          heroBanner {
            image {
              childImageSharp {
                fluid {
                  src
                }
              }
            }
          }
        }
      }
    }  
  `)
  return (
    <ContextProvider>
      <div {...innerProps}>
        <Helmet>
          <html lang="en" />
          <title>{title}</title>
          <meta name="description" content={description} />

          <link
            rel="apple-touch-icon"
            sizes="32x32"
            href={`${withPrefix('/')}img/favicon-32x32.png`}
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
          <meta name="theme-color" content="#fff" />

          <meta property="og:type" content="business.business" />
          <meta property="og:title" content={title} />
          <meta property="og:url" content="https://subtleflexstreetwear.com" />
          <meta
            property="og:image"
            content={`${withPrefix('https://subtleflexstreetwear.com')}${heroImg.markdownRemark.frontmatter.heroBanner.image.childImageSharp.fluid.src}`}
          />
        </Helmet>
        <Navbar />
        <div>{children}</div>
        <Footer />
      </div>
      <Cart />
    </ContextProvider>
  )
}

export default TemplateWrapper
