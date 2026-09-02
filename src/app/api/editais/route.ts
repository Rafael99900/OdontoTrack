import { NextResponse } from "next/server";

import { CatalogConfigurationError, listVisibleNotices } from "@/lib/notices/catalog";

export async function GET() {
  try {
    const notices = await listVisibleNotices();
    return NextResponse.json({ notices });
  } catch (error) {
    if (error instanceof CatalogConfigurationError) {
      return NextResponse.json(
        { error: error.message, code: "CATALOG_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Não foi possível consultar o catálogo oficial.", code: "CATALOG_UNAVAILABLE" },
      { status: 502 },
    );
  }
}
