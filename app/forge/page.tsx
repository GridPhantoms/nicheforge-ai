import Link from "next/link";

export default function ForgePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href="/">Home</Link><Link href="/early-access">Early access</Link></div>
      </nav>

      <section className="hero compact-hero">
        <div className="eyebrow">Private beta forge</div>
        <h1>Choose your path into the forge.</h1>
        <p className="lede">Start with a business idea you already have, or let NicheForge guide you through a category tree to discover a viable AI-aided concept.</p>
      </section>

      <section className="section choice-grid">
        <Link className="choice-card" href="/forge/known">
          <span>1 / I know the idea</span>
          <strong>I know what business idea I want help brainstorming on.</strong>
          <small>Paste the idea, model, niche, competitor, or X post and generate a focused report.</small>
        </Link>
        <Link className="choice-card" href="/forge/explore">
          <span>2 / Help me discover</span>
          <strong>I’m open to any good AI-aided business concept.</strong>
          <small>Pick broad categories, drill into subcategories, then let the report synthesize ideas.</small>
        </Link>
      </section>
    </main>
  );
}
