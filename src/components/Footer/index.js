import React from 'react'
import { Link, graphql, useStaticQuery } from 'gatsby'

import amex from "../../../static/img/payment/amex.svg"
import apple_pay from "../../../static/img/payment/apple_pay.svg"
import discover from "../../../static/img/payment/discover.svg"
import google_pay from "../../../static/img/payment/google_pay.svg"
import mastercard from "../../../static/img/payment/mastercard.svg"
import shopify_pay from "../../../static/img/payment/shopify_pay.svg"
import visa from "../../../static/img/payment/visa.svg"

import "./styles.scss"

const Footer = () => {
  const { allShopifyShopPolicy, socialsJson: { socials }} = useStaticQuery(
    graphql`
      {
        socialsJson {
          socials {
            image
            url
          }
        }
        allShopifyShopPolicy {
          nodes {
            title
            handle
          }
        }
      }
    `
  )

  return (
    <footer className="custom-footer">
      <div className="socials-container">
        { socials.map(({ image, url }, i) => (
          <a key={ i } className="social-icon" target="_blank" rel="noreferrer" href={ url }>
            <img src={ image } alt={ url } />
          </a>
        )) }
      </div>
      <nav className="footer-nav">
        <ul>
          <li>
            <h1>Info</h1>
            <ul>
              { allShopifyShopPolicy.nodes.map(({ title, handle }) => (
                <li key={ handle }>
                  <Link to={ `/${ handle }` } data-content={ title }>{ title }</Link>
                </li>
              )) }
            </ul>
          </li>
        </ul>
      </nav>
      <div className="payments-container" aria-label="available payment methods">
        <img className="payments-icon" src={ visa } alt="Visa" />
        <img className="payments-icon" src={ mastercard } alt="Mastercard" />
        <img className="payments-icon" src={ amex } alt="American Express" />
        <img className="payments-icon" src={ discover } alt="Discover" />
        <img className="payments-icon" src={ apple_pay } alt="Apple Pay" />
        <img className="payments-icon" src={ google_pay } alt="Google Pay" />
        <img className="payments-icon" src={ shopify_pay } alt="Shopify Pay" />
      </div>
    </footer>
  )
}

export default Footer
