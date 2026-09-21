import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HOUR_HEIGHT,
  calendarEventDurationMinutes,
  calendarEventPosition,
  layoutCalendarEvents,
} from "./calendarLayout.ts";

function assertClose(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 0.0001, `${actual} should equal ${expected}`);
}

describe("calendar event positioning", () => {
  it("positions events from their exact start time", () => {
    const cases = [
      ["07:00", "08:00", 0, 84],
      ["08:00", "09:00", 84, 84],
      ["08:20", "09:21", 112, 85.4],
      ["08:30", "09:00", 126, 42],
      ["09:26", "10:11", 204.4, 63],
      ["10:45", "12:15", 315, 126],
      ["14:00", "14:30", 588, 42],
      ["17:20", "18:21", 868, 85.4],
    ] as const;

    for (const [start_time, end_time, top, height] of cases) {
      const position = calendarEventPosition({ start_time, end_time });
      assertClose(position.top, top);
      assertClose(position.height, height);
    }
  });

  it("keeps duration proportional for common appointment lengths", () => {
    const cases = [
      ["08:00", "08:15", 15],
      ["08:00", "08:30", 30],
      ["08:00", "08:45", 45],
      ["08:00", "09:00", 60],
      ["08:00", "09:30", 90],
      ["08:00", "10:00", 120],
    ] as const;

    for (const [start_time, end_time, minutes] of cases) {
      const item = { start_time, end_time };
      assert.equal(calendarEventDurationMinutes(item), minutes);
      assertClose(calendarEventPosition(item).height, (minutes / 60) * HOUR_HEIGHT);
    }
  });

  it("splits overlapping events horizontally without changing vertical position", () => {
    const events = [
      { id: "a", start_time: "08:00", end_time: "09:00" },
      { id: "b", start_time: "08:30", end_time: "09:30" },
      { id: "c", start_time: "10:00", end_time: "11:00" },
    ];
    const layouts = layoutCalendarEvents(events);

    assertClose(layouts.get(events[0])?.top ?? -1, 84);
    assertClose(layouts.get(events[1])?.top ?? -1, 126);
    assertClose(layouts.get(events[0])?.widthPercent ?? -1, 50);
    assertClose(layouts.get(events[1])?.widthPercent ?? -1, 50);
    assertClose(layouts.get(events[0])?.leftPercent ?? -1, 0);
    assertClose(layouts.get(events[1])?.leftPercent ?? -1, 50);
    assertClose(layouts.get(events[2])?.widthPercent ?? -1, 100);
  });

  it("stacks events with the same start time as full-width rows", () => {
    const events = [
      { id: "a", start_time: "11:00", end_time: "11:55" },
      { id: "b", start_time: "11:00", end_time: "11:55" },
      { id: "c", start_time: "11:00", end_time: "11:55" },
    ];
    const layouts = layoutCalendarEvents(events);

    assertClose(layouts.get(events[0])?.top ?? -1, 336);
    assertClose(layouts.get(events[1])?.top ?? -1, 364);
    assertClose(layouts.get(events[2])?.top ?? -1, 392);
    assertClose(layouts.get(events[0])?.widthPercent ?? -1, 100);
    assertClose(layouts.get(events[1])?.widthPercent ?? -1, 100);
    assertClose(layouts.get(events[2])?.widthPercent ?? -1, 100);
    assert.equal(layouts.get(events[0])?.stackedStartIndex, 0);
    assert.equal(layouts.get(events[1])?.stackedStartIndex, 1);
    assert.equal(layouts.get(events[2])?.stackedStartIndex, 2);
  });
});
