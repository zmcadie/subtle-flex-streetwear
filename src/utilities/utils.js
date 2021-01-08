// Polyfill from MDN to check if localStorage or sessionStorage is available for the user
export function storageAvailable(type) {
  var storage;
  try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
  }
  catch(e) {
      return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
          (storage && storage.length !== 0);
  }
}

// given a location object returns the search params as an object
// processes array params in the format ?key[]=value1&key[]=value2 etc...
export const parseQuery = location => {
  if (!location.search) return {}
  
  const params = location.search.slice(1).split("&")
  return params.reduce((res, param) => {
    const [key, value] = param.split("=")
    const isArray = key.slice(-2) === "[]"
    const parsedKey = isArray ? key.slice(0, -2) : key
    const parsedValue = decodeURIComponent(value)
    if (isArray) {
      return {
        ...res,
        [parsedKey]: res[parsedKey]
          ? [ ...res[parsedKey], parsedValue ]
          : [ parsedValue ]
      }
    }
    return { ...res, [key]: parsedValue }
  }, {})
}

export const buildQuery = params => (
  Object.keys(params).reduce((queryString, key, i) => {
    const value = params[key]
    const encodedValue = Array.isArray(value)
      ? value.map(val => {
          const uriValue = encodeURIComponent(val)
          return `${key}[]=${uriValue}`
        }).join("&")
      : `${key}=${encodeURIComponent(value)}`
    return `${queryString}${i ? "&" : ""}${encodedValue}`
  }, "?")
)

export const nameToURI = name => (
  encodeURI(name.replace(/\s/g, "-").toLowerCase())
)

const sizeOrder = ["P","XS","S","M","L","XL","XXL","3XL","4XL","5XL"]

export const sortSize = (a, b) => {
	const indexA = sizeOrder.findIndex(el => el === a)
	const indexB = sizeOrder.findIndex(el => el === b)
	if ([indexA, indexB].includes(-1)) return indexB - indexA
  return indexA - indexB
}

export const getCurrencySymbol = (locale, currency) => {
  const symbol = (0).toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace(/\d/g, '').trim()

  return symbol.slice(-1) === "$" ? "$" : symbol
}