import { App } from "@/components/App";
import { loadPublicContent } from "@/lib/content/load";

// Content is validated and serialized at build time; the page is fully static.
export default function Page() {
  return <App content={loadPublicContent()} />;
}
