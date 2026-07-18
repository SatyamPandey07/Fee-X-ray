import pytest
from app.security import encrypt_token, decrypt_token

def test_token_encryption_lifecycle():
    token = "access-sandbox-12345"
    
    encrypted = encrypt_token(token)
    assert encrypted != token
    assert len(encrypted) > 0
    
    decrypted = decrypt_token(encrypted)
    assert decrypted == token

def test_empty_token():
    assert encrypt_token("") == ""
    assert decrypt_token("") == ""
