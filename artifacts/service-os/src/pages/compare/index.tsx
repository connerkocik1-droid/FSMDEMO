import { useRoute } from "wouter";
import ComparisonPage from "./ComparisonPage";
import { getComparisonBySlug } from "./comparison-data";
import NotFound from "@/pages/not-found";

export default function CompareRoute() {
  const [, params] = useRoute("/compare/:slug");
  const slug = params?.slug;

  if (!slug) return <NotFound />;

  const data = getComparisonBySlug(slug);
  if (!data) return <NotFound />;

  return <ComparisonPage data={data} />;
}
