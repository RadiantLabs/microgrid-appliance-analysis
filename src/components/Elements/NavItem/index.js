import * as React from 'react'
import { NavLink } from 'react-router-dom'

// Integrating Semantic UI menu items with React Router
// https://github.com/Semantic-Org/Semantic-UI-React/issues/142#issuecomment-364225477
export const NavItem = props => <NavLink exact={true} {...props} activeClassName="active" />
