import {
  ChartConfiguration,
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  LegendItem,
  ScriptableLineSegmentContext,
  TooltipItem,
} from "chart.js";

export class PriceChartConfig {
  // Variables
  chartConfig: ChartConfiguration | undefined;

  dataMin: number | undefined;
  dataMax: number | undefined;

  priceColor: string | undefined;
  gapColor: string | undefined;
  minimumColor: string | undefined;
  intermediateColor: string | undefined;
  maximumColor: string | undefined;

  async init() {
    await browser.storage.sync
      .get("priceColor")
      .then((result) => (this.priceColor = result["priceColor"]));
    await browser.storage.sync
      .get("gapColor")
      .then((result) => (this.gapColor = result["gapColor"]));
    await browser.storage.sync
      .get("minimumColor")
      .then((result) => (this.minimumColor = result["minimumColor"]));
    await browser.storage.sync
      .get("intermediateColor")
      .then((result) => (this.intermediateColor = result["intermediateColor"]));
    await browser.storage.sync
      .get("maximumColor")
      .then((result) => (this.maximumColor = result["maximumColor"]));
  }

  build(prices: { x: string; y: string }[]) {
    const chartLabels: string[] = [];
    for (const element of prices) {
      chartLabels.push(element.x);
    }

    const dataFirst = prices.map((o: any) => o.y);
    this.dataMin = Math.min(...dataFirst);
    this.dataMax = Math.max(...dataFirst);

    let data: { x: string; y: string }[] = [];
    for (let i = 0; i < prices.length; i++) {
      data.push(prices[i]);
      if (i < prices.length - 1) {
        let stepData = { x: prices[i].x, y: prices[i + 1].y };
        if (JSON.stringify(prices[i]) !== JSON.stringify(stepData)) {
          data.push(stepData);
        }
      }
    }
    const dataPlain: { x: any; y: any }[] = data.map((value) => value);

    const chartDatasets: ChartDataset[] = [
      {
        label: "Price",
        data: dataPlain,
        borderColor: this.priceColor,
        stepped: true,
        segment: {
          borderColor: (ctx: ScriptableLineSegmentContext) =>
            this.segmentColor(ctx),
          borderDash: (ctx: ScriptableLineSegmentContext) =>
            this.segmentDash(ctx),
        },
      },
      {
        label: "Gap",
        data: [],
        backgroundColor: this.gapColor,
        segment: {
          borderColor: this.gapColor,
        },
      },
      {
        label: "Minimum",
        data: [],
        backgroundColor: this.minimumColor,
        segment: {
          borderColor: this.minimumColor,
        },
      },
      {
        label: "Intermediate",
        data: [],
        backgroundColor: this.intermediateColor,
        segment: {
          borderColor: this.intermediateColor,
        },
      },
      {
        label: "Maximum",
        data: [],
        backgroundColor: this.maximumColor,
        segment: {
          borderColor: this.maximumColor,
        },
      },
    ];

    const chartType: ChartType = "line";

    const chartData: ChartData = {
      labels: chartLabels,
      datasets: chartDatasets,
    };

    const chartPlugins = {
      title: {
        display: true,
        text: "Price History",
      },
      legend: {
        labels: {
          filter: (item: LegendItem, _data: ChartData) =>
            !item.text.includes("Price") && !item.text.includes("Gap"),
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<typeof chartType>) =>
            context.dataset.label + " $ " + context.formattedValue,
        },
      },
      radius: 0,
    };

    const chartOptions: ChartOptions = {
      responsive: true,
      scales: {
        y: {
          min: 0,
          ticks: {
            callback: (tickValue, _index, _ticks) => "$ " + tickValue,
          },
        },
      },
      plugins: chartPlugins,
    };

    this.chartConfig = {
      type: chartType,
      data: chartData,
      options: chartOptions,
    };
  }

  segmentColor(ctx: ScriptableLineSegmentContext): string | undefined {
    if (ctx.p0.parsed.y === ctx.p1.parsed.y) {
      if (ctx.p0.parsed.y === this.dataMax && this.dataMax !== this.dataMin) {
        return this.maximumColor;
      } else if (ctx.p0.parsed.y === this.dataMin) {
        return this.minimumColor;
      } else {
        return this.intermediateColor;
      }
    } else {
      return this.gapColor;
    }
  }

  segmentDash(ctx: ScriptableLineSegmentContext): number[] | undefined {
    if (ctx.p0.parsed.y === ctx.p1.parsed.y) {
      return undefined;
    } else {
      return [6, 6];
    }
  }
}
