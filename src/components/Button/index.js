import React from "react"

const Button = ({ className, children, ...props }) => <button className={`custom-button ${ className }`} {...props}>{ children }</button>

export default Button