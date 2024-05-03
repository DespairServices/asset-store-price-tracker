export const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

export const handler = typeof browser == "undefined" ? chrome : browser;

export const apiHost = "https://scraper.despair.services";
export const apiKey = "4a2260bc-98db-42b2-ab32-2e3df5d4a2c7";

export const colorWhite = "#FFFFFF";
export const colorGray = "#AAAAAA";
export const colorGreen = "#55FF55";
export const colorYellow = "#FFFF55";
export const colorRed = "#FF5555";

export const config = {
  "enable": true,
  "mode": "dark",
  "priceColor": colorWhite,
  "gapColor": colorGray,
  "minimumColor": colorGreen,
  "intermediateColor": colorYellow,
  "maximumColor": colorRed,
};