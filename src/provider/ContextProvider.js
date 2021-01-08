import fetch from 'isomorphic-fetch'
import React, { useState, useEffect } from 'react'
import Client from 'shopify-buy'

import Context from '../context/StoreContext'
import { storageAvailable, getCurrencySymbol } from "../utilities/utils"

const client = Client.buildClient(
  {
    storefrontAccessToken: process.env.GATSBY_SHOPIFY_ACCESS_TOKEN,
    domain: `${process.env.GATSBY_SHOPIFY_SHOP_NAME}.myshopify.com`,
  },
  fetch
)

let initialStoreState = {
  client,
  adding: false,
  checkout: { lineItems: [] },
  products: [],
  shop: {},
  selected_currency: {"code":"CAD","symbol":"$"},
  available_currencies: [{"code":"CAD","symbol":"$"}]
}

const ContextProvider = ({ children }) => {
  const [store, updateStore] = useState(initialStoreState)
  const [isRemoved, setIsRemoved] = useState(false)

  const [isCartOpen, setIsCartOpen] = useState(false)
  const toggleCartOpen = () => setIsCartOpen(!isCartOpen)

  useEffect(() => {
    client.shop.fetchInfo().then(shop => {
      const presentment = shop.paymentSettings.enabledPresentmentCurrencies
      const formatCurrencies = presentment.map(({ key }) => ({
        code: key,
        symbol: getCurrencySymbol("en-CA", key)
      }))
      const storedCurrency = (storageAvailable("localStorage")
        && JSON.parse(localStorage.getItem("user_currency")))
        || initialStoreState.selected_currency
      
      updateStore({
        ...initialStoreState,
        selected_currency: storedCurrency,
        available_currencies: formatCurrencies
      })
    })
    const storedCurrency = storageAvailable("localStorage") && JSON.parse(localStorage.getItem("user_currency"))
    if (storedCurrency) updateStore({...initialStoreState, selected_currency: storedCurrency})
  }, [])

  useEffect(() => {
    const initializeCheckout = async () => {
      // Check for an existing cart.
      const isBrowser = typeof window !== 'undefined'
      const existingCheckoutID = isBrowser
        ? localStorage.getItem('shopify_checkout_id')
        : null

      const setCheckoutInState = checkout => {
        if (isBrowser) {
          localStorage.setItem('shopify_checkout_id', checkout.id)
        }

        updateStore(prevState => {
          return { ...prevState, checkout }
        })
      }

      const presentmentCurrencyCode = store.selected_currency.code
      const checkoutOptions = {
        ...presentmentCurrencyCode && { presentmentCurrencyCode }
      }

      const createNewCheckout = () => store.client.checkout.create(checkoutOptions)
      const fetchCheckout = id => store.client.checkout.fetch(id)

      if (existingCheckoutID) {
        try {
          const checkout = await fetchCheckout(existingCheckoutID)
          // Make sure this cart hasn’t already been purchased.
          if (!isRemoved && !checkout.completedAt) {
            setCheckoutInState(checkout)
            return
          }
        } catch (e) {
          localStorage.setItem('shopify_checkout_id', null)
        }
      }

      const newCheckout = await createNewCheckout()
      if (!isRemoved) {
        setCheckoutInState(newCheckout)
      }
    }

    initializeCheckout()
  }, [store.client.checkout, isRemoved, store.selected_currency.code])

  useEffect(
    () => () => {
      setIsRemoved(true)
    },
    []
  )

  return (
    <Context.Provider
      value={{
        store,
        updateCurrency: async (currency) => {
          if (!currency || !currency.code || !currency.symbol) return

          const setCheckoutInState = checkout => {
            if (storageAvailable("localStorage")) {
              localStorage.setItem('shopify_checkout_id', checkout.id)
              localStorage.setItem("user_currency", JSON.stringify(currency))
            }

            updateStore(prevState => {
              return { ...prevState, checkout, selected_currency: currency }
            })
          }

          const presentmentCurrencyCode = currency.code
          const lineItems = store.checkout.lineItems.length && store.checkout.lineItems.map(item => ({
            quantity: item.quantity,
            variantId: item.variant.id
          }))
          const checkoutOptions = {
            ...lineItems && { lineItems },
            ...presentmentCurrencyCode && { presentmentCurrencyCode }
          }

          const createNewCheckout = () => store.client.checkout.create(checkoutOptions)

          const newCheckout = await createNewCheckout()
          setCheckoutInState(newCheckout)
        },
        addItemToCart: (variantId) => {
          if (!variantId) {
            console.error('Must provide item ID.')
            return
          }

          updateStore(prevState => {
            return { ...prevState, adding: true }
          })

          const { checkout, client } = store

          const checkoutId = checkout.id
          const lineItemsToUpdate = [
            { variantId, quantity: 1 },
          ]

          return client.checkout
            .addLineItems(checkoutId, lineItemsToUpdate)
            .then(checkout => {
              updateStore(prevState => {
                return { ...prevState, checkout, adding: false }
              })
            })
        },
        removeLineItem: (client, checkoutID, lineItemID) => {
          return client.checkout
            .removeLineItems(checkoutID, [lineItemID])
            .then(res => {
              updateStore(prevState => {
                return { ...prevState, checkout: res }
              })
            })
        },
        updateLineItem: (client, checkoutID, lineItemID, quantity) => {
          const lineItemsToUpdate = [
            { id: lineItemID, quantity: parseInt(quantity, 10) },
          ]

          return client.checkout
            .updateLineItems(checkoutID, lineItemsToUpdate)
            .then(res => {
              updateStore(prevState => {
                return { ...prevState, checkout: res }
              })
            })
        },
        isCartOpen,
        toggleCartOpen,
      }}
    >
      {children}
    </Context.Provider>
  )
}
export default ContextProvider
