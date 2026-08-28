/**
 * Inline availability caveat for legal sections describing a feature that is
 * built but not yet released.
 *
 * The privacy policy and Terms of Service both describe Kuju Bridge in the
 * present tense ("Kuju Bridge supports two modes..."), which is correct for the
 * feature as designed but reads, to someone evaluating the documents today, as
 * a description of something they can go and use. Bridge is not on the shipping
 * branch, so no account can connect an external mailbox yet.
 *
 * Deliberately NOT the page-level PreLaunchNotice used on the guide and API
 * docs. Those documents are forward-looking end to end, so one banner at the
 * top covers them. These are not: the rest of the privacy policy governs data
 * we hold right now, and stamping the whole document "coming soon" would
 * wrongly imply none of it is in effect. The caveat has to attach to the
 * Bridge sections specifically.
 *
 * Rendered as a <div> rather than a <p> on purpose. The legal pages style their
 * prose with arbitrary descendant variants ([&_p]:mb-4), whose generated
 * selector outranks a utility class on the child — so a <p> here would inherit
 * document paragraph margins and could not be reliably overridden.
 *
 * Takes the feature name as a prop so the wording stays identical everywhere it
 * appears. Divergent phrasing across sections of a legal document invites the
 * reading that the sections mean different things.
 */
export function NotYetAvailableNote({ feature }: { feature: string }) {
  return (
    <div className="mb-4 rounded-md border-l-4 border-kuju/40 bg-kuju/5 px-4 py-3">
      <div className="text-sm text-slate-700">
        <strong className="font-semibold text-kuju-dark">
          {feature} is not yet available.
        </strong>{" "}
        This section describes how {feature} will handle your information once
        it is released, and takes effect at that time. No external accounts can
        be connected today.
      </div>
    </div>
  );
}
