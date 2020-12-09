import React from 'react'
import Select from 'react-select'
import { useQueryParams } from "../../utilities/hooks"

const sizeOptions = ["P","XS","S","M","L","XL","XXL","3XL","4XL","5XL"].map(sz => ({ value: sz, label: sz }))

const ProductFilter = ({ options }) => {
  const [ params, updateParams ] = useQueryParams()
  
  const updateSize = newSize => {
    const newParams = { ...params }
    const { value } = newSize || {}
    
    if (value == newParams.size) return
    if (!value) {
      delete newParams.size
    } else {
      newParams.size = value
    }
    updateParams(newParams)
  }
  
  return (
    <div className="product-filter-container">
      { options.includes("Size") ? (
        <div className="product-filter-item">
          <label htmlFor="size-filter">Size</label>
          <Select
            id="size-filter"
            options={ sizeOptions }
            value={ params.size && { value: params.size, label: params.size } }
            onChange={ updateSize }
            isClearable={ true }
          />
        </div>
      ): "" }
    </div>
  )
}

export default ProductFilter