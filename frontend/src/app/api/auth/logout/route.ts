import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const keycloakUrl = process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/fee-xray";
  const redirectUri = process.env.NEXTAUTH_URL || "http://localhost:3000/";

  const response = NextResponse.redirect(
    `${keycloakUrl}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(redirectUri)}`
  );

  // Clear session cookie
  response.cookies.delete("session_token");

  return response;
}
