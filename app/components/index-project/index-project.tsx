import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport, faSpinner } from "@fortawesome/free-solid-svg-icons";

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

  const icon = loading ? (
    <FontAwesomeIcon icon={faSpinner} spinPulse />
  ) : (
    <FontAwesomeIcon icon={faFileImport} />
  );

  return (
    <button
      className="button--transparent"
      onClick={handleClick}
      disabled={loading}
    >
      {icon} Index
    </button>
  );
};
