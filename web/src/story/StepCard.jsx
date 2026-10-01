// One big centered card per step, so the customer only looks at one thing at a time
export function StepCard({ step, title, subtitle, children, nextLabel, onNext, onBack }) {
  return (
    <main className="step-page">
      <article className="step-card">
        <header className="step-card-head">
          <span className="step-kicker">Step {step} of 3</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </header>
        <div className="step-card-body">{children}</div>
        <footer className="step-card-foot">
          {onBack ? <button type="button" className="link-button back" onClick={onBack}>← Back</button> : <span />}
          <button type="button" className="next" onClick={onNext}>{nextLabel} →</button>
        </footer>
      </article>
    </main>
  );
}
