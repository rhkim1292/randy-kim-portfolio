import { describe, it, expect } from "vitest";
import { formatTime } from "./NowPlayingClient";

describe("Test suite for formatTime", () => {
  it("formatTime returns the correct minute value", () => {
    expect(formatTime(60000)).toBe("1:00");
  });

  it("formatTime returns padded zeroes on single digit second", () => {
    expect(formatTime(62000)).toBe("1:02");
  });

  it("formatTime returns zero minutes when input time is under a minute", () => {
    expect(formatTime(59000)).toBe("0:59");
  });

  it("formatTime returns double digit minutes properly", () => {
    expect(formatTime(2218000)).toBe("36:58");
  });

  it("formatTime formats the time in m:ss format even without a rounded ms value", () => {
    expect(formatTime(19402)).toBe("0:19");
  });
});
