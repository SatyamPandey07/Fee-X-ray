import { NextResponse } from "next/server";

export async function GET() {
  const keycloakUrl = process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/fee-xray";
  const clientId = process.env.KEYCLOAK_CLIENT_ID || "fee-xray-client";
  const redirectUri = process.env.NEXTAUTH_URL || "http://localhost:3000/api/auth/callback";

  const authorizationUrl = `${keycloakUrl}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid+email+profile`;

  return NextResponse.redirect(authorizationUrl);
}
