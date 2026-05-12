import Link from "next/link";

const cards = [
  ["Adjacent niches", "Find narrower, less obvious markets that could fit a proven business model."],
  ["Automation angles", "Map which parts of the offer AI can help research, generate, monitor, or fulfill."],
  ["Babysitting risk", "Spot ideas that are likely to become high-touch jobs before you waste months building them."],
  ["Prompt generation", "Turn the report into a reusable prompt you can paste into your own AI chatbot to keep refining, testing, and expanding the idea."],
];

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links">
          <Link href="/forge">Forge</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">AI Business Angle Reports</div>
        <h1>Find the AI automation angle hiding inside any business idea.</h1>
        <p className="lede">
          Have an idea? Bring it. Need one? Explore. NicheForge AI helps uncover adjacent markets, automation angles, offer variants, babysitting-risk warnings, and a copy-ready master prompt to keep researching, refining, and pressure-testing the idea.
        </p>
        <div className="cta-row">
          <Link href="/forge" className="button">Generate a beta report</Link>
          <Link href="/disclaimer" className="button secondary">Read the limits</Link>
        </div>
      </section>

      <section className="grid">
        {cards.map(([title, body]) => (
          <article className="card" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="section panel">
        <h2>Built for practical brainstorming, not fantasy forecasts.</h2>
        <p>
          NicheForge AI is for founders and operators who want sharper ideation before they build. It does not promise profit, demand, or success. It helps you explore business angles, then gives you prompts and validation steps to keep researching with your own AI chatbot, agent, or human network.
        </p>
      </section>

      <footer className="footer">© {new Date().getFullYear()} NicheForge AI. Brainstorming only. Validate before building.</footer>
    </main>
  );
}
