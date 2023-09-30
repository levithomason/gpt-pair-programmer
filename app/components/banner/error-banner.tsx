import * as React from "react";

import "./error-banner.css";
import { classNames } from "../../utils";

export type ErrorBannerProps = { error: string };

export const ErrorBanner = (props: ErrorBannerProps) => {
  return (
    <div
      className={classNames(
        `error-banner`,
        props.error && "error-banner--show",
      )}
    >
      {props.error}
    </div>
  );
};
