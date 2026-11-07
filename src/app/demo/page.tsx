import type { Metadata } from "next";
import { Demo } from "@/components/Demo";
import { loadPublicContent } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Demo Mode — When Am I?",
  description: "Replay any When Am I? mystery without affecting your daily progress.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <Demo content={loadPublicContent()} />;
}
