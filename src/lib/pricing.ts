/**
 * Kuju Email pricing engine.
 *
 * Deliberately separate from the pricing page's rendering: the page's job is
 * to be honest about cost, and that is only checkable if the arithmetic can be
 * read (and tested) without a React tree around it.
 *
 * Source of truth for the rates is
 * docs/superpowers/specs/2026-03-24-pricing-restructure-design.md, as amended by
 * github-jsv8w (Enterprise) and github-j0cog (the Individual / Family cap).
 */

/** How a tier turns a seat count into a monthly bill. */
export type PricingModel =
  /**
   * Flat base covering N seats, then a per-seat rate, up to a hard maximum.
   * Individual / Family.
   *
   * `maxSeats` is load-bearing rather than cosmetic. Without it this model
   * undercuts the pure per-seat tier at EVERY size: both charge the same rate
   * per additional seat, so the base's cheaper included block becomes a
   * constant discount that never erodes (measured: $15/mo at 5 seats and still
   * $15/mo at 500). A cap is the only fix that does not require the two tiers'
   * marginal rates to diverge.
   */
  | {
      kind: "base-plus-seat";
      base: number;
      annualBase: number;
      includedSeats: number;
      seatRate: number;
      annualSeatRate: number;
      maxSeats: number;
    }
  /** Pure per-seat with a seat floor. Small Business. */
  | {
      kind: "per-seat";
      seatRate: number;
      annualSeatRate: number;
      minSeats: number;
    }
  /**
   * Fixed platform fee plus a per-seat rate, with a seat floor. Professional
   * and Enterprise.
   *
   * The platform fee buys infrastructure whose cost does not move with
   * headcount (archiving, retention engine, analytics, SSO, audit logging).
   * That is why this is the only model whose effective per-seat cost actually
   * falls as a team grows — see hasVolumeCurve below, which the UI keys on.
   */
  | {
      kind: "platform-plus-seat";
      platformFee: number;
      annualPlatformFee: number;
      seatRate: number;
      annualSeatRate: number;
      minSeats: number;
    };

/**
 * What a tier costs at a given seat count, or why it cannot be bought there.
 *
 * A discriminated union rather than a price plus an "unavailable" flag, so a
 * caller cannot read `.monthly` off a tier that is not for sale at this size:
 * TypeScript forces the narrowing. The illegal state is unrepresentable rather
 * than merely discouraged.
 */
export type Quote =
  | {
      available: true;
      /** Monthly total in dollars. */
      monthly: number;
      /** Seats actually billed — may exceed the request when a floor applies. */
      billedSeats: number;
      /** Monthly total divided by billed seats. */
      perSeat: number;
      /** Human-readable sum, e.g. "$75 platform + 10 seats x $5". */
      breakdown: string;
      /**
       * Set when the requested seat count could not be billed as asked, so the
       * UI can say why the number is higher than the arithmetic suggests. Null
       * when the quote is a straight calculation.
       */
      floorNote: string | null;
    }
  | {
      available: false;
      /** Shown in place of a price. */
      reason: string;
    };

const money = (n: number): string =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

/** Round to cents. Float sums of rates like 4.15 drift otherwise. */
const cents = (n: number): number => Math.round(n * 100) / 100;

/**
 * Price `seats` under `model`.
 *
 * `annual` selects the discounted rates.
 */
export function quote(
  model: PricingModel,
  seats: number,
  annual: boolean,
): Quote {
  switch (model.kind) {
    case "base-plus-seat": {
      if (seats > model.maxSeats) {
        return {
          available: false,
          reason: `Not available above ${model.maxSeats} mailboxes`,
        };
      }
      const base = annual ? model.annualBase : model.base;
      const rate = annual ? model.annualSeatRate : model.seatRate;
      const billedSeats = Math.max(seats, model.includedSeats);
      const extra = billedSeats - model.includedSeats;
      const monthly = cents(base + extra * rate);
      const breakdown =
        extra > 0
          ? `${money(base)} base (${model.includedSeats} seats) + ${extra} x ${money(rate)}`
          : `${money(base)} base, covers ${model.includedSeats} seats`;
      return {
        available: true,
        monthly,
        billedSeats,
        perSeat: cents(monthly / billedSeats),
        breakdown,
        floorNote:
          seats < model.includedSeats
            ? `${model.includedSeats} seats included, so fewer costs the same`
            : null,
      };
    }

    case "per-seat": {
      const rate = annual ? model.annualSeatRate : model.seatRate;
      const billedSeats = Math.max(seats, model.minSeats);
      const monthly = cents(billedSeats * rate);
      return {
        available: true,
        monthly,
        billedSeats,
        perSeat: rate,
        breakdown: `${billedSeats} seats x ${money(rate)}`,
        floorNote:
          seats < model.minSeats ? `${model.minSeats}-seat minimum` : null,
      };
    }

    case "platform-plus-seat": {
      const fee = annual ? model.annualPlatformFee : model.platformFee;
      const rate = annual ? model.annualSeatRate : model.seatRate;
      const billedSeats = Math.max(seats, model.minSeats);
      const monthly = cents(fee + billedSeats * rate);
      return {
        available: true,
        monthly,
        billedSeats,
        perSeat: cents(monthly / billedSeats),
        breakdown: `${money(fee)} platform + ${billedSeats} x ${money(rate)}`,
        floorNote:
          seats < model.minSeats ? `${model.minSeats}-seat minimum` : null,
      };
    }
  }
}

/**
 * True when a model's effective per-seat cost genuinely falls as seats grow.
 *
 * Only the platform-fee model does: its fixed component amortises. Showing an
 * "effective per seat" figure on the others would be misleading in two
 * different directions at once — flat for the pure per-seat tier, and actually
 * RISING for base-plus-seat, where the cheap included block is diluted by every
 * seat added past it. The UI shows that figure only where this is true.
 *
 * Both Professional and Enterprise use this model, so both legitimately show
 * the falling curve.
 */
export function hasVolumeCurve(model: PricingModel): boolean {
  return model.kind === "platform-plus-seat";
}

/** Cost of one more seat beyond the anchors, for the overflow note. */
export function marginalSeatRate(model: PricingModel, annual: boolean): number {
  return annual ? model.annualSeatRate : model.seatRate;
}

/** The hard seat ceiling for a tier, or null when it scales without limit. */
export function seatCap(model: PricingModel): number | null {
  return model.kind === "base-plus-seat" ? model.maxSeats : null;
}

export { money as formatMoney };
