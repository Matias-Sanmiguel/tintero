"use client";

export function Crash({ reset }: { reset: () => void }) {
  return (
    <main className="main">
      <p className="kicker">IMAS+</p>
      <h1>Se cortó la página</h1>
      <p className="lead">La base no respondió. Los datos siguen donde estaban.</p>
      <button className="button" type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </main>
  );
}
