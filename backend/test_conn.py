import os
from conn import get_conn, mask_apikey

# Set the DSN for testing (same as in databeas.py)
os.environ['SQLITECLOUD_URL'] = (
    'sqlitecloud://cfe4km1avk.g5.sqlite.cloud:8860/auth.sqlitecloud'
    '?apikey=C4IZeODvAaMXc5dh6jPbhLMKIJ7rFZka7S2rMdQIOFE'
)

print(mask_apikey(os.environ['SQLITECLOUD_URL']))

with get_conn() as conn:
    cur = conn.execute('SELECT * FROM Embllyes;')
    print(cur.fetchone())
