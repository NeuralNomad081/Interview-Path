import os
import jwt
from clerk_backend_api import Clerk

CLERK_SECRET_KEY = os.environ.get("CLERK_SECRET_KEY")
clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)
JWKS_URL = "https://api.clerk.com/v1/jwks"

jwks_client = jwt.PyJWKClient(JWKS_URL, headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"})

def decode_access_token(token: str) -> str | None:
    """Decodes a Clerk JWT and returns the subject (clerk_user_id), or None if invalid/expired."""
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload.get("sub")
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
