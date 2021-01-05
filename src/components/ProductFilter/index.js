import React, { useState, useMemo } from 'react'
import Select from 'react-select'
import { useQueryParams } from "../../utilities/hooks"

import "./styles.scss"

const ProductFilter = ({ filters }) => {
  const [ open, setOpen ] = useState(false)
  const [ params, updateParams ] = useQueryParams()

  const updateFilter = name => newValue => {
    const newParams = { ...params }
    const { value } = newValue || {}
    
    if (value === newParams[name]) return
    if (!value) {
      delete newParams[name]
    } else {
      newParams[name] = value
    }
    updateParams(newParams)
  }

  const handleClear = () => {
    const newParams = { ...params }
    filters.names.forEach(name => {
      delete newParams[name]
    })
    updateParams(newParams)
  }

  const filterCount = useMemo(() => {
    return Object.keys(params).filter(key => filters.names.includes(key)).length
  }, [ params, filters ])

  return filters && filters.names.length ? (
    <>
      <button className="filter-toggle-button" onClick={ () => setOpen(!open) }>
        Filter products
        { filterCount ? <span>({ filterCount })</span> : "" }
      </button>
      { filterCount ? (
        <button className="filter-clear-button" onClick={ handleClear }>
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