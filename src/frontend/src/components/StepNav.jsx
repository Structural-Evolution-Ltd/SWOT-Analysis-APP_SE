import { NavLink } from 'react-router-dom'

import { STEP_ROUTES } from '../constants'

export default function StepNav() {
  return (
    <nav className="step-nav" aria-label="Workflow step navigator">
      {STEP_ROUTES.map((step) => (
        <NavLink key={step.path} to={step.path}>
          {step.label}
        </NavLink>
      ))}
    </nav>
  )
}
