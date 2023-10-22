import * as React from "react";

import { makeDebug } from "../../utils";

const log = makeDebug("components:app");

export const IndexProject = () => {
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      await fetch(`http://localhost:5004/vector-store/index-project`, {
        method: "POST",
      });
    } catch (error) {
      log("error", error);
    }

    setLoading(false);
  };

  return (
    <button
      className="button--transparent"
      onClick={handleClick}
      disabled={loading}
    >
      Index
    </button>
  );
};
