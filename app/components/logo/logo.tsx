import * as React from "react";

import logo from "../../../public/logo-on-dark.png";
import "./logo.css";

type LogoProps = {
  hideText?: boolean;
};

export const Logo = ({ hideText }: LogoProps) => {
  return (
    <span className="logo">
      <img src={logo} alt="Logo" className="logo__image" />
      {!hideText && <span className="logo__text">Pair Programmer</span>}
    </span>
  );
};
