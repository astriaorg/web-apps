import { ChartConfig, ChartTickInterval } from "./chart.types";

type DateParams = number | string | Date;

// Helper to extract item config from a payload.
export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

/**
 * Downsamples data to a maximum number of data points.
 * Useful for displaying large datasets in charts to avoid performance issues.
 */
export const getDownsampledData = <T>(
  data: T[],
  options: {
    /**
     * Threshold for the maximum number of data points to display.
     */
    maximumDataPoints: number;
  } = { maximumDataPoints: 1000 },
) => {
  if (data.length > options.maximumDataPoints) {
    const downsampled: T[] = [];
    const interval = Math.ceil(data.length / options.maximumDataPoints);

    for (let i = 0; i < data.length; i += interval) {
      downsampled.push(data[i] as T);
    }

    return downsampled;
  }

  return data;
};

/**
 *  @returns An array of data points representing the first data point of each interval.
 */
export const getTickIntervalData = <T>(
  data: T[],
  options: {
    interval: ChartTickInterval;
    /**
     * The accessor key for the date value in the data point.
     */
    key: keyof T;
  },
): (T | null)[] => {
  const result: (T | null)[] = [];

  if (!data.length) {
    return result;
  }

  switch (options.interval) {
    case "3d":
    case "1w": {
      const milliseconds = (() => {
        switch (options.interval) {
          case "3d":
            return 1000 * 60 * 60 * 24 * 3;
          case "1w":
            return 1000 * 60 * 60 * 24 * 7;
          default:
            throw new Error(
              `Invalid chart tick interval: "${options.interval}".`,
            );
        }
      })();

      let previousDate = data[0]
        ? new Date(data[0][options.key as keyof T] as DateParams).getTime()
        : 0;
      result.push(data[0] as T);

      for (let i = 1; i < data.length; i++) {
        const currentDate = new Date(
          (data[i] as T)[options.key as keyof T] as DateParams,
        ).getTime();
        if (currentDate >= previousDate + milliseconds) {
          result.push(data[i] as T);
          previousDate = currentDate;
        }
      }

      break;
    }
    case "1m": {
      let previousItem: T = data[0] as T;
      result.push(data[0] as T);

      for (let i = 1; i < data.length; i++) {
        const currentMonth = new Date(
          (data[i] as T)[options.key as keyof T] as DateParams,
        ).getUTCMonth();
        const previousMonth = previousItem
          ? new Date(
              previousItem[options.key as keyof T] as DateParams,
            ).getUTCMonth()
          : -1;

        if (currentMonth !== previousMonth) {
          result.push(data[i] as T);
          previousItem = data[i] as T;
        }
      }

      break;
    }
    default: {
      throw new Error(`Invalid chart tick interval: "${options.interval}".`);
    }
  }

  return result;
};
