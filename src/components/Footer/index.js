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
  const { allShopifyShopPolicy, navigationJson, socialsJson: { socials }} = useStaticQuery(
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
        navigationJson {
          footer {
            columnLabel
            links {
              label
              path
            }
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
          { navigationJson.footer.map((column, i) => (
            <li>
              <h1>{ column.columnLabel }</h1>
              <ul>
                { column.links.map(({ label, path }) => (
                  <li key={ path }>
                    <Link to={ path } data-content={ label }>{ label }</Link>
                  </li>
                )) }
              </ul>
            </li>
          )) }
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
