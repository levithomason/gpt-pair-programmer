export type GoogleSearchResult = {
  kind: string; // customsearch#result
  title: string; // Los Angeles, CA | Weather Forecasts Now, Live Radar Maps & News ...
  htmlTitle: string; // <b>Los Angeles</b>, <b>CA</b> | <b>Weather</b> Forecasts Now, Live Radar Maps &amp; News ...
  link: string; // https://www.weatherbug.com/weather-forecast/now/los-angeles-ca-90007
  displayLink: string; // www.weatherbug.com
  snippet: string; // Want to know what the weather is now? Check out our current live radar and weather forecasts for Los Angeles, Idaho to help plan your day.
  htmlSnippet: string; // Want to know <b>what the weather</b> is now? Check out our <b>current</b> live radar and <b>weather</b> forecasts for <b>Los Angeles</b>, <b>Idaho</b> to help plan your day.
  cacheId: string; // H8kS-_t6BD0J
  formattedUrl: string; // https://www.weatherbug.com/weather-forecast/now/los-angeles-ca-90007
  htmlFormattedUrl: string; // https://www.<b>weather</b>bug.com/<b>weather</b>-forecast/now/<b>los-angeles</b>-<b>ca</b>-90007
};

export type FormattedSearchResult = {
  title: string;
  snippet: string;
  link: string;
};

export const formatSearchResult = (
  result: GoogleSearchResult,
): FormattedSearchResult => {
  const { title, snippet, link } = result;
  return { title, snippet, link };
};
