import React from "react";
import { NavLink } from "react-router-dom";

interface IBreadcrumbs {
  crumbs: { name: string; href?: string }[];
}

/**
 * Component that renders breadcrumb links based on provided "crumbs"
 * @param {IBreadcrumbs} props Component properties
 * @param {{name: string, href?: string}[]} crumbs List of links, or "crumbs" to be rendered
 */
const Breadcrumbs = (props: IBreadcrumbs) => {
  return (
    <ul className="breadcrumbs">
      {props.crumbs.map((crumb) =>
        crumb.href ? (
          <React.Fragment key = {crumb.name}>
            <li>
              <NavLink to={crumb.href} className="crumb-link">
                {crumb.name}
              </NavLink>
            </li>
            <li>/</li>
          </React.Fragment>
        ) : (
          <li>
            <p className="crumb" key={crumb.name}>{crumb.name}</p>
          </li>
        )
      )}
    </ul>
  );
};

export default Breadcrumbs;
