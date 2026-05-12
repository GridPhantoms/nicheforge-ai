import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

export default function EarlyAccessPage() {
  return (
    <main className="shell">
      <SiteHeader links={[{ href: "/forge", label: "Forge" }, { href: "/disclaimer", label: "Disclaimer" }]} />

      <section className="hero">
        <div className="eyebrow">Private early access</div>
        <h1>Early testers help shape the forge.</h1>
        <p className="lede">
          This page is for a small invited beta group. Use the private beta code shared with you to test the live report generator and send candid feedback on what feels useful, confusing, or missing.
        </p>
        <div className="cta-row">
          <Link href="/forge" className="button">Open the forge</Link>
        </div>
      </section>

      <section className="section panel">
        <h2>What to test</h2>
        <ul>
          <li>Try real business ideas, not only perfect examples.</li>
          <li>Check whether the adjacent niches feel practical or generic.</li>
          <li>Look for automation angles that reduce manual delivery and client babysitting.</li>
          <li>Notice whether the validation sprint gives a clear next step.</li>
          <li>Flag any output that sounds too confident, hypey, or unrealistic.</li>
        </ul>
      </section>
    </main>
  );
}
