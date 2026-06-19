"""Database connection helper for sqlitecloud.

Usage:
  - Set the environment variable `SQLITECLOUD_URL` to your DSN.
  - Use `from conn import get_conn` and `with get_conn() as conn:` to run queries.

This module masks the API key for logging and ensures connections are closed.
"""
from __future__ import annotations

import os
from contextlib import contextmanager
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
import sqlitecloud

__all__ = ["get_conn", "connect", "mask_apikey"]

# Fallback DSN (used if SQLITECLOUD_URL is not set). Replace or set env var for production.
DEFAULT_DSN = (
    "sqlitecloud://cfe4km1avk.g5.sqlite.cloud:8860/auth.sqlitecloud"
    "?apikey=C4IZeODvAaMXc5dh6jPbhLMKIJ7rFZka7S2rMdQIOFE"
)


def mask_apikey(url: str) -> str:
    """Return the URL with the `apikey` query value partially masked for logs.

    Example: apikey=ABCDEFGHIJK -> apikey=ABCD...IJK
    """
    if not url:
        return url
    p = urlparse(url)
    qs = dict(parse_qsl(p.query, keep_blank_values=True))
    if "apikey" in qs:
        key = qs["apikey"]
        if len(key) > 8:
            qs["apikey"] = key[:4] + "..." + key[-4:]
        else:
            qs["apikey"] = "****"
    new_query = urlencode(qs)
    return urlunparse((p.scheme, p.netloc, p.path, p.params, new_query, p.fragment))


@contextmanager
def get_conn(env_var: str = "SQLITECLOUD_URL"):
    """Context manager that yields an open sqlitecloud connection.

    Reads the DSN from `env_var`. Closes the connection when the context exits.
    Raises RuntimeError if the environment variable is not set.
    """
    dsn = os.environ.get(env_var) or DEFAULT_DSN
    if not dsn:
        raise RuntimeError(f"Environment variable {env_var} not set and no DEFAULT_DSN available")
    # optionally log masked URL for debug
    # print('Connecting to', mask_apikey(dsn))
    conn = sqlitecloud.connect(dsn)
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass


def connect(dsn: str):
    """Open and return a sqlitecloud connection for a given DSN."""
    return sqlitecloud.connect(dsn)
