import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const payloadBase64 = sessionToken.split(".")[1];
    const decodedPayload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));

    return NextResponse.json({
      authenticated: true,
      email: decodedPayload.email,
      name: decodedPayload.name,
      roles: decodedPayload.realm_access?.roles || [],
      sub: decodedPayload.sub,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Invalid token structure" }, { status: 401 });
  }
}
