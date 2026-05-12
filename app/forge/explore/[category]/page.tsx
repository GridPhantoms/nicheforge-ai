import Link from "next/link";
import { SiteHeader } from "../../../components/SiteHeader";
import { notFound } from "next/navigation";
import { categoryFromSlug, optionSlug } from "../options";

export default async function ExploreCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = categoryFromSlug(categorySlug);
  if (!category) notFound();

  return (
    <main className="shell">
      <SiteHeader links={[{ href: "/forge/explore", label: "Back" }, { href: "/early-access", label: "Early access" }]} />

      <section className="hero compact-hero">
        <div className="eyebrow">Path 2 / Step 2 of 4</div>
        <h1>{category.label}: choose a specific lane.</h1>
        <p className="lede">Pick the subcategory that feels easiest to understand or sell into. The goal is direction, not perfection.</p>
      </section>

      <section className="section">
        <div className="path-grid six-grid">
          {category.subcategories.map((subcategory) => (
            <Link className="path-card" href={`/forge/explore/${category.slug}/${optionSlug(subcategory.label)}`} key={subcategory.label}>
              <strong>{subcategory.label}</strong>
              <small>{subcategory.description}</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
