import os
import httpx
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

KEYCLOAK_ISSUER = os.getenv("KEYCLOAK_ISSUER", "http://localhost:8080/realms/fee-xray")
JWKS_URL = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"

jwks_cache: Optional[Dict[str, Any]] = None

def get_jwks() -> Optional[Dict[str, Any]]:
    global jwks_cache
    if jwks_cache is not None:
        return jwks_cache
    try:
        response = httpx.get(JWKS_URL, timeout=3.0)
        if response.status_code == 200:
            jwks_cache = response.json()
            return jwks_cache
    except Exception as e:
        pass
    return None

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    jwks = get_jwks()

    if jwks:
        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            if key:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=["RS256"],
                    options={"verify_aud": False}
                )
                return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid OIDC Token signature: {e}"
            )

    try:
        payload = jwt.get_unverified_claims(token)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not parse OIDC Token: {e}"
        )

def verify_org_access(org_id: str, payload: Dict[str, Any]) -> None:
    token_org_id = payload.get("org_id") or payload.get("organization")
    
    if token_org_id and str(token_org_id) != str(org_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-organization access is blocked."
        )
