import debug from "debug";
import axios from "axios";

export const log = debug("gpp:tools:google");

const { GOOGLE_API_KEY, SEARCH_ENGINE_ID } = process.env;

export type GoogleResult = {
  kind: string; // customsearch#result
  title: string; // Athol, ID | Weather Forecasts Now, Live Radar Maps & News ...
  htmlTitle: string; // <b>Athol</b>, <b>ID</b> | <b>Weather</b> Forecasts Now, Live Radar Maps &amp; News ...
  link: string; // https://www.weatherbug.com/weather-forecast/now/athol-id-83801
  displayLink: string; // www.weatherbug.com
  snippet: string; // Want to know what the weather is now? Check out our current live radar and weather forecasts for Athol, Idaho to help plan your day.
  htmlSnippet: string; // Want to know <b>what the weather</b> is now? Check out our <b>current</b> live radar and <b>weather</b> forecasts for <b>Athol</b>, <b>Idaho</b> to help plan your day.
  cacheId: string; // H8kS-_t6BD0J
  formattedUrl: string; // https://www.weatherbug.com/weather-forecast/now/athol-id-83801
  htmlFormattedUrl: string; // https://www.<b>weather</b>bug.com/<b>weather</b>-forecast/now/<b>athol</b>-<b>id</b>-83801
};

export type GoogleResultForGPT = {
  title: string;

  snippet: string;
  link: string;
};

const formatResultForGPT = (result: GoogleResult): GoogleResultForGPT => {
  const { title, link, snippet } = result;
  const formatted = { title, snippet, link };

  log("formatResultForGPT", formatted);

  return formatted;
};

export const google = async (query: string) => {
  log("google", query);

  if (!GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY environment variable.");
  }

  if (!SEARCH_ENGINE_ID) {
    throw new Error("Missing SEARCH_ENGINE_ID environment variable.");
  }

  if (!query) {
    throw new Error("Missing query.");
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: { key: GOOGLE_API_KEY, cx: SEARCH_ENGINE_ID, q: query },
      },
    );

    if (response.status === 200) {
      const items = response.data.items;
      const results = items.map(formatResultForGPT);

      log("results", results);

      return results;
    } else {
      return [
        `Failed to retrieve search results: ${response.status} ${response.statusText}`,
      ];
    }
  } catch (error) {
    return [
      `An error occurred while making the request: ${(
        error as Error
      ).toString()}`,
    ];
  }
};
