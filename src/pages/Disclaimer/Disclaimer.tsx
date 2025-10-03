// prettier-ignore
const styles = {
    disclaimerContainer: 'disclaimer-container prose-sm mx-auto my-auto  max-w-prose',
    disclaimerTitle: 'disclaimer-title mb-4 font-medium text-2xl text-primary',
    disclaimerContent: 'disclaimer-content flex flex-col gap-4 text-secondary'
} satisfies Record<string, string>;

export const Disclaimer = () => (
  <div className={styles.disclaimerContainer}>
    <h2 className={styles.disclaimerTitle}>Disclaimer</h2>

    <div className={styles.disclaimerContent}>
      <p>
        This ain’t no financial advice, fren. xPEPE platform and memecoin are dropped here “as is” and “as available”, raw and unfiltered, no warranty, no promises, no hopium guarantees. Use at your own risk, ape responsibly.

        No chat with the devs, no dank meme, no alpha leak shall magically create a warranty. If you click, stake, trade, play or hodl xPEPE, you do it with your own diamond hands (or paper hands, no judgement).
      </p>
      <p>
        In no universe shall the xPEPE crew, community, or any random frog on the internet be liable for your losses, missed 100x pumps, rugged feelings, or tears in the bear market. Gains, losses, laughs – all on you, fren.
      </p>
      <p>
        You touch xPEPE, you accept the vibes, the memes, and the risks.
      </p>
        <p>
          WAGMI? Maybe.
          <p>NGMI? Also maybe.</p>
          <p> Either way, we vibin’.</p>
        </p>
        
    </div>
  </div>
);
