import os
import logging
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)

# Load the key from environment or generate a temporary one for development
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    logger.warning("ENCRYPTION_KEY environment variable is not set. Generating a temporary key for development.")
    ENCRYPTION_KEY = Fernet.generate_key().decode()

try:
    cipher_suite = Fernet(ENCRYPTION_KEY.encode())
except Exception as e:
    logger.error(f"Invalid ENCRYPTION_KEY config: {e}. Generating a fallback key.")
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    cipher_suite = Fernet(ENCRYPTION_KEY.encode())

def encrypt_token(token: str) -> str:
    """Encrypts a plain-text token using Fernet AES encryption."""
    if not token:
        return ""
    encrypted_bytes = cipher_suite.encrypt(token.encode())
    return encrypted_bytes.decode()

def decrypt_token(encrypted: str) -> str:
    """Decrypts a Fernet encrypted token back to plain-text."""
    if not encrypted:
        return ""
    decrypted_bytes = cipher_suite.decrypt(encrypted.encode())
    return decrypted_bytes.decode()
