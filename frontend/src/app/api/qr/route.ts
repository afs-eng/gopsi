import { NextRequest } from "next/server";

const QR_SERVER_URL = "https://api.qrserver.com/v1/create-qr-code/";

export async function GET(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data");

  if (!data) {
    return new Response("Missing data", { status: 400 });
  }

  const qrResponse = await fetch(
    `${QR_SERVER_URL}?size=220x220&margin=12&data=${encodeURIComponent(data)}`,
    { cache: "no-store" },
  );

  if (!qrResponse.ok) {
    return new Response("QR service unavailable", { status: 502 });
  }

  return new Response(qrResponse.body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": qrResponse.headers.get("Content-Type") ?? "image/png",
    },
  });
}
