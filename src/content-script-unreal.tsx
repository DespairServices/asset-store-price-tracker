import { Chart, ChartConfiguration, registerables } from "chart.js";
import { apiHost } from "./constants";

import { PriceChartConfig } from "./price-chart";

// Variables
let enable: boolean;
let priceChartConfig: PriceChartConfig;

// Functions
function display() {
  const chartElement = document.getElementById("price-history-chart");
  if (chartElement !== undefined && chartElement !== null) return;

  const displayParent = document.getElementsByClassName(
    "asset-details-container offset-top ",
  )[0];
  if (displayParent === undefined || displayParent === null)
    throw Error("Failed to get unrealDisplay.");

  const newChartElement = document.createElement("canvas");
  newChartElement.id = "price-history-chart";

  let _ = new Chart(
    newChartElement,
    priceChartConfig.chartConfig as ChartConfiguration,
  );

  displayParent.insertBefore(newChartElement, displayParent.lastChild);
}

async function start() {
  // https://stackoverflow.com/questions/8376525/get-value-of-a-string-after-last-slash-in-javascript
  const assetIdUrl = /[^/]*$/.exec(window.location.href);
  if (
    assetIdUrl === undefined ||
    assetIdUrl === null ||
    assetIdUrl.length === 0
  )
    throw Error(`Failed to get assetIdUrl (${assetIdUrl}).`);

  const assetIdRaw: string = assetIdUrl[0];

  const request = {
    type: "fetch",
    content: `${apiHost}/unreal?id=${assetIdRaw}`,
  };
  let response: { ok: boolean; content: string };

  try {
    response = await browser.runtime.sendMessage(request);
  } catch (error) {
    console.error("Error:", error);
    return;
  }

  const ok = response.ok;
  const content = response.content;
  if (!ok) throw Error(content);

  const parsedContent = JSON.parse(content);

  const prices: { x: string; y: string }[] = parsedContent.map(
    (item: { Cost: number; Date: string }) => ({
      x: item.Date,
      y: item.Cost,
    }),
  );

  prices.sort((a, b) => {
    return new Date(a.x).getTime() - new Date(b.x).getTime();
  });

  const now = new Date();
  const nowParsed = now.toISOString().split("T")[0];

  prices.push({ x: nowParsed, y: prices[prices.length - 1].y });

  priceChartConfig.build(prices);

  setInterval(display, 500);
}

async function init() {
  await browser.storage.sync
    .get("enable")
    .then((result) => (enable = Boolean(result["enable"])));

  priceChartConfig = new PriceChartConfig();
  await priceChartConfig.init();
}

// Entry Point
const entryPoint = async () => {
  Chart.register(...registerables);
  await init();

  if (!enable) return;

  await start();
};
entryPoint();
