import Link from "next/link";
import { exploreCategories } from "./options";

export default function ExplorePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/" className="logo"><span className="logo-mark">NF</span> NicheForge AI</Link>
        <div className="nav-links"><Link href="/forge">Change path</Link><Link href="/early-access">Early access</Link></div>
      </nav>

      <section className="hero compact-hero">
        <div className="eyebrow">Path 2 / Step 1 of 4</div>
        <h1>Pick the world you want to explore.</h1>
        <p className="lede">No dropdowns, no blank-page pressure. Choose the area that feels closest and NicheForge will keep narrowing the path.</p>
      </section>

      <section className="section">
        <div className="path-grid six-grid">
          {exploreCategories.map((category) => (
            <Link className="path-card" href={`/forge/explore/${category.slug}`} key={category.slug}>
              <strong>{category.label}</strong>
              <small>{category.description}</small>
            </Link>
          ))}
        </div>
        <p className="notice path-note">Not sure? Pick the one you understand best. You can always go back and try another path.</p>
      </section>
    </main>
  );
}
