import React, { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import { useQueryParams } from "../../utilities/hooks"

// const sizeOrder = ["P","XS","S","M","L","XL","XXL","3XL","4XL","5XL"]
// const sortSize = (a, b) => {
// 	const indexA = sizeOrder.findIndex(el => el === a)
// 	const indexB = sizeOrder.findIndex(el => el === b)
// 	if ([indexA, indexB].includes(-1)) return indexB - indexA
//   return indexA - indexB
// }

const ProductFilter = ({ filters }) => {
  const [ open, setOpen ] = useState(false)
  const [ params, updateParams ] = useQueryParams()

  // const filters = useMemo(() => {
  //   if (!Object.keys(productOptions).length) return
    
  //   const { distinct, group } = productOptions
    
  //   const names = distinct.filter(type => type !== "Title")
  //   const options = group.reduce((acc, cur) => {
  //     const { fieldValue: name, nodes } = cur
  //     if (name === "Title") return acc
      
  //     const uniqValues = [...new Set(nodes.reduce((arr, node) => [...arr, ...node.values], []))]
  //     if (name === "Size") uniqValues.sort(sortSize)

  //     const options = uniqValues.map(el => ({ value: el, label: el }))
      
  //     return { ...acc, [name]: options }
  //   }, {})
  //   return { names, options }
  // }, [ productOptions ])
  
  const updateFilter = name => newValue => {
    const newParams = { ...params }
    const { value } = newValue || {}
    
    if (value == newParams[name]) return
    if (!value) {
      delete newParams[name]
    } else {
      newParams[name] = value
    }
    updateParams(newParams)
  }

  return filters ? (
    <>
      <button className="filter-toggle-button" onClick={ () => setOpen(!open) }>
        Filter products
        { Object.keys(params).length ? <span>({ Object.keys(params).length })</span> : "" }
      </button>
      { Object.keys(params).length ? (
        <button className="filter-clear-button" onClick={ () => updateParams({}) }>
          clear
        </button>
      ) : "" }
      <div className={`product-filter-container ${ open ? "open" : "" }`}>
        { filters.names.map((name, i) => (
          <div className="product-filter-item" key={ i }>
            <label htmlFor={`${ name }-filter`}>{ name }</label>
            <Select
              id={`${ name }-filter`}
              className="filter-select"
              options={ filters.options[name] }
              value={ params[name] ? { value: params[name], label: params[name] } : null }
              onChange={ updateFilter(name) }
              isClearable={ true }
              styles={{
                control: prov => ({
                  ...prov,
                  // border: "none",
                  // borderBottom: "1px solid #ddd",
                  minHeight: '30px',
                  height: '30px',
                  borderRadius: '1px'
                }),
                valueContainer:       prov => ({ ...prov, height: '30px', padding: '0 6px' }),
                input:                prov => ({ ...prov, margin: '0px' }),
                indicatorsContainer:  prov => ({ ...prov, height: '30px' }),
                dropdownIndicator:    prov => ({ ...prov, paddingLeft: "4px" }),
                clearIndicator:       prov => ({ ...prov, paddingRight: "4px" }),
                indicatorSeparator:   prov => ({ display: 'none' })
              }}
            />
          </div>
        )) }
      </div>
    </>
  ) : ""
}

export default ProductFilter