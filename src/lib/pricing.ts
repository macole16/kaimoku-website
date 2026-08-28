/**
 * Kuju Email pricing engine.
 *
 * Deliberately separate from the pricing page's rendering: the page's job is
 * to be honest about cost, and that is only checkable if the arithmetic can be
 * read (and tested) without a React tree around it.
 *
 * Source of truth for the rates is
 * docs/superpowers/specs/2026-03-24-pricing-restructure-design.md, as amended by
 * github-jsv8w (Enterprise), github-j0cog (Individual / Family cap) and
 * github-ohzud (Small Business cap, storage and add-ons in the calculator).
 */

/** Per-seat and per-GB extras a tier sells on top of its base plan. */
export interface TierExtras {
  /** Storage included per mailbox, before any top-up. */
  includedStorageGB: number;
  /** Price per GB per month above the included allowance. */
  extraStoragePerGB: number;
  annualExtraStoragePerGB: number;
  /** Premium AI, charged per mailbox. Undefined where the tier does not sell it. */
  premiumAIPerSeat?: number;
  annualPremiumAIPerSeat?: number;
  /** Managed backups, per mailbox. Enterprise only. */
  managedBackupsPerSeat?: number;
  annualManagedBackupsPerSeat?: number;
  /**
   * Retention beyond the included 3 years, per GB per month.
   *
   * Billed against TOTAL provisioned storage (GB per mailbox x seats), not just
   * the top-up above the included allowance. That is the literal reading of the
   * published rate card and is what the calculator states; it may overstate the
   * bill for a customer whose archive is smaller than their live mail.
   */
  extendedRetentionPerGB?: number;
  annualExtendedRetentionPerGB?: number;
}

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
   * $15/mo at 500).
   */
  | {
      kind: "base-plus-seat";
      base: number;
      annualBase: number;
      includedSeats: number;
      seatRate: number;
      annualSeatRate: number;
      maxSeats: number;
      extras: TierExtras;
    }
  /**
   * Pure per-seat with a seat floor and a seat ceiling. Small Business.
   *
   * Unlike the Individual / Family cap, `maxSeats` here is positioning rather
   * than a fix: the gap to Professional is already a constant platform fee, so
   * nothing is being undercut. The cap exists to say where "small business"
   * stops.
   */
  | {
      kind: "per-seat";
      seatRate: number;
      annualSeatRate: number;
      minSeats: number;
      maxSeats: number;
      extras: TierExtras;
    }
  /**
   * Fixed platform fee plus a per-seat rate, with a seat floor. Professional
   * and Enterprise.
   *
   * The platform fee buys infrastructure whose cost does not move with
   * headcount (archiving, retention engine, analytics, SSO, audit logging).
   * That is why this is the only model whose effective per-seat cost actually
   * falls as a team grows.
   */
  | {
      kind: "platform-plus-seat";
      platformFee: number;
      annualPlatformFee: number;
      seatRate: number;
      annualSeatRate: number;
      minSeats: number;
      extras: TierExtras;
    };

/** What the buyer has configured in the calculator. */
export interface Options {
  /**
   * Storage per mailbox in GB, or null for "whatever this tier includes".
   *
   * The null sentinel is load-bearing. Tiers have DIFFERENT allowances (5 GB on
   * Individual / Family, 10 GB elsewhere), so no single number is neutral: a
   * default of 10 charges Individual / Family for 5 GB it never asked for,
   * quoting $85 where its base price is $35. Null means each tier prices its
   * own allowance at zero, so the page opens showing every tier's true base.
   */
  storagePerSeatGB: number | null;
  premiumAI: boolean;
  managedBackups: boolean;
  extendedRetention: boolean;
}

export const DEFAULT_OPTIONS: Options = {
  storagePerSeatGB: null,
  premiumAI: false,
  managedBackups: false,
  extendedRetention: false,
};

/** One itemised charge. The card renders these so the total is auditable. */
export interface QuoteLine {
  label: string;
  amount: number;
}

/**
 * What a tier costs at a given seat count, or why it cannot be bought there.
 *
 * A discriminated union rather than a price plus an "unavailable" flag, so a
 * caller cannot read `.monthly` off a tier that is not for sale at this size:
 * TypeScript forces the narrowing.
 */
export type Quote =
  | {
      available: true;
      /** True monthly total: base plan plus every selected add-on. */
      monthly: number;
      /** Base plan alone, so the card can show what the add-ons added. */
      baseMonthly: number;
      /** Seats actually billed. May exceed the request when a floor applies. */
      billedSeats: number;
      /** Total monthly divided by billed seats. */
      perSeat: number;
      /** Human-readable base sum, e.g. "$75 platform + 10 seats x $5". */
      breakdown: string;
      /** Itemised add-on charges. Empty when nothing optional was selected. */
      lines: QuoteLine[];
      /** Set when the requested seat count could not be billed as asked. */
      floorNote: string | null;
    }
  | {
      available: false;
      reason: string;
    };

const money = (n: number): string =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

/** Round to cents. Float sums of rates like 4.15 drift otherwise. */
const cents = (n: number): number => Math.round(n * 100) / 100;

/** Seat ceiling for a tier, or null when it scales without limit. */
export function seatCap(model: PricingModel): number | null {
  return model.kind === "platform-plus-seat" ? null : model.maxSeats;
}

/** Seat floor for a tier. */
export function seatFloor(model: PricingModel): number {
  return model.kind === "base-plus-seat" ? 1 : model.minSeats;
}

function extrasOf(model: PricingModel): TierExtras {
  return model.extras;
}

/**
 * Charges for the selected options, in the order they should be shown.
 *
 * A tier silently contributes nothing for an option it does not sell, so the
 * page can offer one global set of toggles without each card having to know
 * which ones apply to it.
 */
function addOnLines(
  model: PricingModel,
  billedSeats: number,
  opts: Options,
  annual: boolean,
): QuoteLine[] {
  const e = extrasOf(model);
  const lines: QuoteLine[] = [];

  // null means "the included allowance", which by definition costs nothing extra.
  const requestedGB = opts.storagePerSeatGB ?? e.includedStorageGB;
  const extraGB = Math.max(0, requestedGB - e.includedStorageGB);
  if (extraGB > 0) {
    const rate = annual ? e.annualExtraStoragePerGB : e.extraStoragePerGB;
    lines.push({
      label: `Extra storage: ${extraGB} GB x ${billedSeats} seats x ${money(rate)}`,
      amount: cents(extraGB * billedSeats * rate),
    });
  }

  if (opts.premiumAI && e.premiumAIPerSeat !== undefined) {
    const rate = annual ? e.annualPremiumAIPerSeat! : e.premiumAIPerSeat;
    lines.push({
      label: `Premium AI: ${billedSeats} x ${money(rate)}`,
      amount: cents(billedSeats * rate),
    });
  }

  if (opts.managedBackups && e.managedBackupsPerSeat !== undefined) {
    const rate = annual ? e.annualManagedBackupsPerSeat! : e.managedBackupsPerSeat;
    lines.push({
      label: `Managed backups: ${billedSeats} x ${money(rate)}`,
      amount: cents(billedSeats * rate),
    });
  }

  if (opts.extendedRetention && e.extendedRetentionPerGB !== undefined) {
    const rate = annual
      ? e.annualExtendedRetentionPerGB!
      : e.extendedRetentionPerGB;
    const totalGB = requestedGB * billedSeats;
    lines.push({
      label: `Extended retention: ${totalGB} GB x ${money(rate)}`,
      amount: cents(totalGB * rate),
    });
  }

  return lines;
}

/**
 * Price `seats` under `model` with `opts` selected.
 *
 * `annual` selects the discounted rates, which apply to add-ons as well as the
 * base plan: the published discount is "2 months free", i.e. the whole
 * subscription rather than the base alone.
 */
export function quote(
  model: PricingModel,
  seats: number,
  annual: boolean,
  opts: Options = DEFAULT_OPTIONS,
): Quote {
  const cap = seatCap(model);
  if (cap !== null && seats > cap) {
    return {
      available: false,
      reason: `Not available above ${cap} mailboxes`,
    };
  }

  let billedSeats: number;
  let baseMonthly: number;
  let breakdown: string;
  let floorNote: string | null = null;

  switch (model.kind) {
    case "base-plus-seat": {
      const base = annual ? model.annualBase : model.base;
      const rate = annual ? model.annualSeatRate : model.seatRate;
      billedSeats = Math.max(seats, model.includedSeats);
      const extra = billedSeats - model.includedSeats;
      baseMonthly = cents(base + extra * rate);
      breakdown =
        extra > 0
          ? `${money(base)} base (${model.includedSeats} seats) + ${extra} x ${money(rate)}`
          : `${money(base)} base, covers ${model.includedSeats} seats`;
      if (seats < model.includedSeats)
        floorNote = `${model.includedSeats} seats included, so fewer costs the same`;
      break;
    }
    case "per-seat": {
      const rate = annual ? model.annualSeatRate : model.seatRate;
      billedSeats = Math.max(seats, model.minSeats);
      baseMonthly = cents(billedSeats * rate);
      breakdown = `${billedSeats} seats x ${money(rate)}`;
      if (seats < model.minSeats) floorNote = `${model.minSeats}-seat minimum`;
      break;
    }
    case "platform-plus-seat": {
      const fee = annual ? model.annualPlatformFee : model.platformFee;
      const rate = annual ? model.annualSeatRate : model.seatRate;
      billedSeats = Math.max(seats, model.minSeats);
      baseMonthly = cents(fee + billedSeats * rate);
      breakdown = `${money(fee)} platform + ${billedSeats} x ${money(rate)}`;
      if (seats < model.minSeats) floorNote = `${model.minSeats}-seat minimum`;
      break;
    }
  }

  const lines = addOnLines(model, billedSeats, opts, annual);
  const monthly = cents(lines.reduce((t, l) => t + l.amount, baseMonthly));

  return {
    available: true,
    monthly,
    baseMonthly,
    billedSeats,
    perSeat: cents(monthly / billedSeats),
    breakdown,
    lines,
    floorNote,
  };
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
 * Judged on the BASE plan on purpose. Add-ons are per-seat or per-GB, so they
 * scale linearly and neither create nor destroy a curve; letting them flip this
 * would make the column appear and disappear as a checkbox is ticked.
 */
export function hasVolumeCurve(model: PricingModel): boolean {
  return model.kind === "platform-plus-seat";
}

/** Cost of one more seat beyond the anchors, for the overflow note. */
export function marginalSeatRate(model: PricingModel, annual: boolean): number {
  return annual ? model.annualSeatRate : model.seatRate;
}

/** Which optional extras a tier actually sells, for rendering availability. */
export function sellsAddOn(
  model: PricingModel,
  addOn: "premiumAI" | "managedBackups" | "extendedRetention",
): boolean {
  const e = extrasOf(model);
  if (addOn === "premiumAI") return e.premiumAIPerSeat !== undefined;
  if (addOn === "managedBackups") return e.managedBackupsPerSeat !== undefined;
  return e.extendedRetentionPerGB !== undefined;
}

/** Storage included per mailbox, for the storage control's guidance. */
export function includedStorageGB(model: PricingModel): number {
  return extrasOf(model).includedStorageGB;
}

export { money as formatMoney };
