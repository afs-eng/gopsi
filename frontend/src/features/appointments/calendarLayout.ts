export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 19;
export const HOUR_HEIGHT = 84;
const STACKED_EVENT_GAP = 4;
const STACKED_EVENT_HEIGHT = 24;

type TimeRange = {
  end_time: string;
  start_time: string;
};

export type CalendarPosition = {
  height: number;
  top: number;
};

export type CalendarLayout = CalendarPosition & {
  leftPercent: number;
  stackedStartCount: number;
  stackedStartIndex: number;
  widthPercent: number;
};

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesFromGridStart(time: string, gridStartHour = GRID_START_HOUR) {
  return timeToMinutes(time) - gridStartHour * 60;
}

export function calendarEventDurationMinutes(item: TimeRange) {
  return timeToMinutes(item.end_time) - timeToMinutes(item.start_time);
}

export function calendarEventPosition(item: TimeRange, hourHeight = HOUR_HEIGHT): CalendarPosition {
  return {
    height: (calendarEventDurationMinutes(item) / 60) * hourHeight,
    top: (minutesFromGridStart(item.start_time) / 60) * hourHeight,
  };
}

function rangesOverlap(a: TimeRange, b: TimeRange) {
  return timeToMinutes(a.start_time) < timeToMinutes(b.end_time)
    && timeToMinutes(b.start_time) < timeToMinutes(a.end_time);
}

function layoutCluster<T extends TimeRange>(cluster: T[], hourHeight: number) {
  const lanes: T[][] = [];
  const startGroups = new Map<string, T[]>();

  for (const item of cluster) {
    startGroups.set(item.start_time, [...(startGroups.get(item.start_time) ?? []), item]);
  }

  return cluster.map((item) => {
    const startGroup = startGroups.get(item.start_time) ?? [];
    const stackedStartCount = startGroup.length;
    const stackedStartIndex = startGroup.indexOf(item);

    if (stackedStartCount > 1) {
      return {
        item,
        laneIndex: 0,
        stackedStartCount,
        stackedStartIndex,
      };
    }

    let laneIndex = lanes.findIndex((lane) => !rangesOverlap(lane[lane.length - 1], item));

    if (laneIndex === -1) {
      laneIndex = lanes.length;
      lanes.push([]);
    }

    lanes[laneIndex].push(item);

    return {
      item,
      laneIndex,
      stackedStartCount,
      stackedStartIndex,
    };
  }).map(({ item, laneIndex, stackedStartCount, stackedStartIndex }) => {
    const position = calendarEventPosition(item, hourHeight);
    const isStackedStart = stackedStartCount > 1;

    return {
      item,
      layout: {
        height: isStackedStart ? STACKED_EVENT_HEIGHT : position.height,
        leftPercent: isStackedStart ? 0 : (laneIndex / lanes.length) * 100,
        stackedStartCount,
        stackedStartIndex,
        top: isStackedStart ? position.top + stackedStartIndex * (STACKED_EVENT_HEIGHT + STACKED_EVENT_GAP) : position.top,
        widthPercent: isStackedStart ? 100 : 100 / lanes.length,
      },
    };
  });
}

export function layoutCalendarEvents<T extends TimeRange>(items: T[], hourHeight = HOUR_HEIGHT) {
  const sortedItems = [...items].sort((a, b) => {
    const startDiff = timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
    return startDiff || timeToMinutes(a.end_time) - timeToMinutes(b.end_time);
  });
  const results = new Map<T, CalendarLayout>();
  let cluster: T[] = [];
  let clusterEnd = 0;

  function flushCluster() {
    for (const { item, layout } of layoutCluster(cluster, hourHeight)) {
      results.set(item, layout);
    }
    cluster = [];
    clusterEnd = 0;
  }

  for (const item of sortedItems) {
    const start = timeToMinutes(item.start_time);
    const end = timeToMinutes(item.end_time);

    if (cluster.length && start >= clusterEnd) {
      flushCluster();
    }

    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, end);
  }

  if (cluster.length) {
    flushCluster();
  }

  return results;
}
