const DEFAULT_API_ORIGIN = "https://api.dev.bilimai.kz";
const WAITLIST_API_PATH = "/api/v1/auth/waitlist/";

function getWaitlistApiUrl() {
  const explicitUrl = process.env.WAITLIST_API_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const apiOrigin = (process.env.API_PROXY_TARGET || DEFAULT_API_ORIGIN).replace(
    /\/$/,
    "",
  );

  return `${apiOrigin}${WAITLIST_API_PATH}`;
}

export async function POST(request: Request) {
  const requestBody = await request.text();

  try {
    const upstreamResponse = await fetch(getWaitlistApiUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: requestBody,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const responseBody = await upstreamResponse.text();

    return new Response(responseBody || null, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Waitlist API request failed", error);

    return Response.json(
      { detail: "Waitlist service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
