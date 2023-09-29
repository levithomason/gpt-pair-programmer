import axios from "axios";
import { ToolError, ToolFunction } from "../../utils";
import { formatSearchResult, FormattedSearchResult } from "./utils";

type Args = { query: string };

type Return = FormattedSearchResult[];

const googleSearch: ToolFunction<Args, Return> = async ({ query }) => {
  const { GOOGLE_API_KEY, SEARCH_ENGINE_ID } = process.env;

  if (!GOOGLE_API_KEY) {
    throw new ToolError({
      tool: "googleSearch",
      message: "Missing GOOGLE_API_KEY environment variable.",
    });
  }

  if (!SEARCH_ENGINE_ID) {
    throw new ToolError({
      tool: "googleSearch",
      message: "Missing SEARCH_ENGINE_ID environment variable.",
    });
  }

  if (!query) {
    throw new ToolError({
      tool: "googleSearch",
      message: "Missing query.",
    });
  }

  try {
    const { data, status, statusText } = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: { key: GOOGLE_API_KEY, cx: SEARCH_ENGINE_ID, q: query },
      },
    );

    if (status === 200) {
      return data.items.map(formatSearchResult);
    } else {
      return [`Failed to retrieve search results: ${status} ${statusText}`];
    }
  } catch (error) {
    const errorMessage = (error as Error).toString();
    return [`An error occurred while making the request: ${errorMessage}`];
  }
};

export default googleSearch;
