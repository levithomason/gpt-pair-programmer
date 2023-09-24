import * as React from "react";

export type ErrorBannerProps = { error: string };

export const ErrorBanner = (props: ErrorBannerProps) => (
  <div
    style={{
      transition: "all 0.5s ease-in-out",
      position: "fixed",
      padding: "1rem 2rem",
      margin: "0 auto",
      top: "-100px",
      width: "calc(100% - 4rem)",
      minWidth: "400px",
      maxWidth: "800px",
      textAlign: "center",
      color: "white",
      backgroundColor: "#D88",
      borderRadius: "8px",
      opacity: 0,
      ...(props.error && {
        top: "16px",
        opacity: 1,
      }),
    }}
  >
    {props.error}
  </div>
);
