import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const keycloakUrl = process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/fee-xray";
  const clientId = process.env.KEYCLOAK_CLIENT_ID || "fee-xray-client";
  const redirectUri = process.env.NEXTAUTH_URL || "http://localhost:3000/api/auth/callback";

  try {
    const tokenResponse = await fetch(`${keycloakUrl}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json({ error: "Token exchange failed", details: errorText }, { status: 500 });
    }

    const tokens = await tokenResponse.json();

    const response = NextResponse.redirect(new URL("/", request.url));
    
    // Set token in a secure httpOnly cookie
    response.cookies.set("session_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
