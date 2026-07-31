export function Methodology() {
  return (
    <section className="methodology" aria-label="Methodology and disclaimer">
      <details>
        <summary>How this model works</summary>
        <div className="methodology-grid">
          <div>
            <h3>Vesting</h3>
            <p>
              New grants vest linearly after the cliff. Existing grants begin
              with the vested shares you enter, then vest the remainder.
            </p>
          </div>
          <div>
            <h3>Dilution</h3>
            <p>
              Each modeled financing round reduces ownership by the dilution
              percentage you choose. Rounds are spaced across the time horizon.
            </p>
          </div>
          <div>
            <h3>Company growth</h3>
            <p>
              The chart interpolates between today&apos;s company value and the
              exit scenario. It is a planning curve, not a forecast.
            </p>
          </div>
        </div>
      </details>
      <p className="methodology-disclaimer">
        This is an educational, pre-tax estimate and excludes liquidation
        preferences, taxes, transaction costs, and changing exercise windows.
        It is not financial advice.
      </p>
    </section>
  );
}
