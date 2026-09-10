import { describe, it, expect } from "vitest";
import { reservationSchema } from "../../src/lib/validation/reservation-schema";

describe("reservationSchema", () => {
  it("accepts a valid reservation request", () => {
    const result = reservationSchema.safeParse({
      name: "Ahmed",
      phone: "+966501234567",
      partySize: 4,
      preferredDate: "2026-10-01",
      preferredTime: "19:30",
      contactMethod: "PHONE",
      locale: "ar",
    });
    expect(result.success).toBe(true);
  });

  it("defaults contactMethod and locale when omitted", () => {
    const result = reservationSchema.safeParse({
      name: "Ahmed",
      phone: "+966501234567",
      partySize: 4,
      preferredDate: "2026-10-01",
      preferredTime: "19:30",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactMethod).toBe("PHONE");
      expect(result.data.locale).toBe("en");
    }
  });

  it("rejects a party size of zero", () => {
    const result = reservationSchema.safeParse({
      name: "Ahmed",
      phone: "+966501234567",
      partySize: 0,
      preferredDate: "2026-10-01",
      preferredTime: "19:30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a party size over the 30-guest cap", () => {
    const result = reservationSchema.safeParse({
      name: "Ahmed",
      phone: "+966501234567",
      partySize: 31,
      preferredDate: "2026-10-01",
      preferredTime: "19:30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unparseable preferred date", () => {
    const result = reservationSchema.safeParse({
      name: "Ahmed",
      phone: "+966501234567",
      partySize: 2,
      preferredDate: "not-a-date",
      preferredTime: "19:30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a time not in HH:mm format", () => {
    const result = reservationSchema.safeParse({
      name: "Ahmed",
      phone: "+966501234567",
      partySize: 2,
      preferredDate: "2026-10-01",
      preferredTime: "7:30pm",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid contactMethod", () => {
    const result = reservationSchema.safeParse({
      name: "Ahmed",
      phone: "+966501234567",
      partySize: 2,
      preferredDate: "2026-10-01",
      preferredTime: "19:30",
      contactMethod: "CARRIER_PIGEON",
    });
    expect(result.success).toBe(false);
  });
});
