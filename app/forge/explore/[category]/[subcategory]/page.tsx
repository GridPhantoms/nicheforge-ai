import { notFound } from "next/navigation";
import { categoryFromSlug, optionFromSlug } from "../../options";
import { ExploreDetailsForm } from "./ExploreDetailsForm";

export default async function ExploreDetailsPage({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const category = categoryFromSlug(categorySlug);
  const subcategory = category ? optionFromSlug(category.subcategories, subcategorySlug) : undefined;
  if (!category || !subcategory) notFound();

  return <ExploreDetailsForm categorySlug={categorySlug} subcategorySlug={subcategorySlug} />;
}
