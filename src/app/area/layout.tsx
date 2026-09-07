import { CatalogAssistant } from "@/features/ai/catalog-assistant";

export default function AreaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}<CatalogAssistant /></>;
}
