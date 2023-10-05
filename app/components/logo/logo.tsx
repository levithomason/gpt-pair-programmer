import * as React from "react";

import logo from "../../../public/logo-on-dark.png";
import "./logo.css";

export const Logo = () => {
  return (
    <span className="logo">
      <img src={logo} alt="Logo" className="logo__image" />
      <span className="logo__text">Pair Programmer</span>
    </span>
  );
};
