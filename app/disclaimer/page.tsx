import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href="/">Home</Link><Link href="/forge">Forge</Link></div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Important limits</div>
        <h1>NicheForge AI is a brainstorming tool.</h1>
        <p className="lede">
          Outputs are for ideation, research, and planning support only. They are not guarantees, business advice, legal advice, financial advice, or a substitute for customer validation.
        </p>
      </section>

      <section className="section panel">
        <h2>Use responsibly</h2>
        <ul>
          <li>No generated report can guarantee demand, revenue, profit, funding, or customer acquisition.</li>
          <li>You are responsible for validating markets, checking regulations, and making business decisions.</li>
          <li>Regulated industries may require professional legal, financial, compliance, or domain-specific review.</li>
          <li>Use the prompt pack to continue research with your own AI chatbot, agent, advisors, and real customer conversations.</li>
          <li>Test small before building large.</li>
        </ul>
      </section>
    </main>
  );
}
