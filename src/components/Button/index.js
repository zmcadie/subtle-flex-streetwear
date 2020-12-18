import React from "react"
import "./styles.scss"

const Button = ({ className, children, ...props }) => <button className={`custom-button ${ className }`} {...props}>{ children }</button>

export default Button