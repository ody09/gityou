from flask import Flask, request, jsonify, send_from_directory
from conn import get_conn
from datetime import datetime, timedelta
import json
import os

ROOT_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')
app = Flask(__name__, static_folder=None)


def ensure_table():
    with get_conn() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS Embllyes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            auth INTEGER NOT NULL DEFAULT 0,
            pass TEXT
        );''')
        # Products table: pkey is unique key used in frontend
        conn.execute('''CREATE TABLE IF NOT EXISTS Products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pkey TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            specs TEXT,
            lines TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );''')
        conn.execute('''CREATE TABLE IF NOT EXISTS Archives (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lineId INTEGER NOT NULL,
            date TEXT,
            dateFormatted TEXT,
            worker TEXT,
            productName TEXT,
            region TEXT,
            notes TEXT,
            fullReport TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );''')
        cleanup_old_archives(conn)


def add_cors(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,DELETE,OPTIONS,PATCH'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return resp


def cleanup_old_archives(conn=None):
    cleanup_conn = False
    if conn is None:
        conn = get_conn()
        cleanup_conn = True
    try:
        threshold = (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
        conn.execute('DELETE FROM Archives WHERE created_at < ?;', (threshold,))
    finally:
        if cleanup_conn:
            conn.close()


@app.route('/api/users', methods=['GET', 'OPTIONS'])
def list_users():
    if request.method == 'OPTIONS':
        return add_cors(jsonify({}))
    with get_conn() as conn:
        cur = conn.execute('SELECT id, name, auth, pass FROM Embllyes ORDER BY id ASC;')
        rows = cur.fetchall()
    users = [{'id': r[0], 'name': r[1], 'auth': int(r[2]) if r[2] is not None else 0, 'pass': r[3]} for r in rows]
    return add_cors(jsonify(users))


@app.route('/api/products', methods=['GET', 'POST', 'OPTIONS'])
def products_list_create():
    if request.method == 'OPTIONS':
        return add_cors(jsonify({}))
    if request.method == 'GET':
        with get_conn() as conn:
            cur = conn.execute('SELECT id, pkey, name, specs, lines, created_at FROM Products ORDER BY id ASC;')
            rows = cur.fetchall()
        prods = []
        for r in rows:
            specs = None
            lines = None
            try:
                specs = json.loads(r[3]) if r[3] else []
            except Exception:
                specs = []
            try:
                lines = json.loads(r[4]) if r[4] else []
            except Exception:
                lines = []
            prods.append({'id': r[0], 'key': r[1], 'name': r[2], 'specs': specs, 'lines': lines, 'created_at': r[5]})
        return add_cors(jsonify(prods))

    # POST -> upsert product by key
    data = request.get_json() or {}
    key = data.get('key')
    name = data.get('name')
    specs = data.get('specs')
    lines = data.get('lines')
    if not key or not name:
        return add_cors(jsonify({'error': 'key and name required'})), 400
    specs_txt = json.dumps(specs or [])
    lines_txt = json.dumps(lines or [])
    with get_conn() as conn:
        # Use SQLite UPSERT on conflict(pkey)
        conn.execute('''INSERT INTO Products (pkey, name, specs, lines) VALUES (?, ?, ?, ?) ON CONFLICT(pkey) DO UPDATE SET name=excluded.name, specs=excluded.specs, lines=excluded.lines;''', (key, name, specs_txt, lines_txt))
    return add_cors(jsonify({'ok': True, 'key': key}))


@app.route('/api/products/<string:pkey>', methods=['DELETE'])
def delete_product(pkey):
    with get_conn() as conn:
        conn.execute('DELETE FROM Products WHERE pkey = ?;', (pkey,))
    return add_cors(jsonify({'ok': True}))


@app.route('/api/archives', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def archives_route():
    if request.method == 'OPTIONS':
        return add_cors(jsonify({}))
    if request.method == 'GET':
        cleanup_old_archives()
        with get_conn() as conn:
            cur = conn.execute('SELECT id, lineId, date, dateFormatted, worker, productName, region, notes, fullReport, created_at FROM Archives ORDER BY created_at DESC;')
            rows = cur.fetchall()
        archives = [
            {
                'id': r[0],
                'lineId': int(r[1]) if r[1] is not None else None,
                'date': r[2],
                'dateFormatted': r[3],
                'worker': r[4],
                'productName': r[5],
                'region': r[6],
                'notes': r[7],
                'fullReport': r[8],
                'created_at': r[9]
            }
            for r in rows
        ]
        return add_cors(jsonify(archives))
    if request.method == 'POST':
        data = request.get_json() or {}
        lineId = data.get('lineId')
        date = data.get('date')
        dateFormatted = data.get('dateFormatted')
        worker = data.get('worker')
        productName = data.get('productName')
        region = data.get('region')
        notes = data.get('notes')
        fullReport = data.get('fullReport')
        if lineId is None or fullReport is None:
            return add_cors(jsonify({'error': 'lineId and fullReport required'})), 400
        with get_conn() as conn:
            cur = conn.execute('''INSERT INTO Archives (lineId, date, dateFormatted, worker, productName, region, notes, fullReport) VALUES (?, ?, ?, ?, ?, ?, ?, ?);''',
                               (lineId, date, dateFormatted, worker, productName, region, notes, fullReport))
            try:
                archive_id = cur.lastrowid
            except Exception:
                archive_id = None
        return add_cors(jsonify({'ok': True, 'id': archive_id})), 201
    if request.method == 'DELETE':
        data = request.get_json(silent=True) or {}
        if data.get('all'):
            with get_conn() as conn:
                conn.execute('DELETE FROM Archives;')
            return add_cors(jsonify({'ok': True, 'cleared': True}))
        return add_cors(jsonify({'error': 'missing all flag'})), 400


@app.route('/api/archives/<int:archive_id>', methods=['DELETE'])
def delete_archive(archive_id):
    with get_conn() as conn:
        conn.execute('DELETE FROM Archives WHERE id = ?;', (archive_id,))
    return add_cors(jsonify({'ok': True}))


@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return add_cors(jsonify({}))
    data = request.get_json() or {}
    name = data.get('name')
    password = data.get('pass', '')
    if not name or password is None:
        return add_cors(jsonify({'ok': False, 'error': 'name and pass required'})), 400

    # replicate the JS hashPassword algorithm to compare stored hashes
    def js_hash(pw: str) -> str:
        if not pw:
            return ''
        h = 0
        for ch in pw:
            h = ((h << 5) - h) + ord(ch)
            # simulate 32-bit signed int overflow
            h = h & 0xFFFFFFFF
        return format(h & 0xFFFFFFFF, '08x')

    target = js_hash(password)
    with get_conn() as conn:
        cur = conn.execute('SELECT id, name, auth, pass FROM Embllyes WHERE name = ? LIMIT 1;', (name,))
        row = cur.fetchone()
    if not row:
        return add_cors(jsonify({'ok': False, 'error': 'invalid credentials'})), 401
    stored = (row[3] or '')
    # Accept if stored matches raw password (legacy), or matches js_hash(password), or double-hash
    if stored == password:
        return add_cors(jsonify({'ok': True, 'id': row[0], 'name': row[1], 'auth': int(row[2]) if row[2] is not None else 0}))
    if stored == target:
        return add_cors(jsonify({'ok': True, 'id': row[0], 'name': row[1], 'auth': int(row[2]) if row[2] is not None else 0}))
    if stored == js_hash(target):
        return add_cors(jsonify({'ok': True, 'id': row[0], 'name': row[1], 'auth': int(row[2]) if row[2] is not None else 0}))
    return add_cors(jsonify({'ok': False, 'error': 'invalid credentials'})), 401


@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    name = data.get('name')
    auth = int(data.get('auth', 0))
    pw = data.get('pass')
    if not name:
        return add_cors(jsonify({'error': 'name required'})), 400
    with get_conn() as conn:
        cur = conn.execute('INSERT INTO Embllyes (name, auth, pass) VALUES (?, ?, ?);', (name, auth, pw))
        # sqlitecloud returns a cursor with lastrowid accessible via attribute if supported
        try:
            last = cur.lastrowid
        except Exception:
            last = None
    return add_cors(jsonify({'id': last, 'name': name, 'auth': auth})), 201


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    with get_conn() as conn:
        conn.execute('DELETE FROM Embllyes WHERE id = ?;', (user_id,))
    return add_cors(jsonify({'ok': True}))


@app.route('/api/users/<int:user_id>', methods=['PATCH', 'OPTIONS'])
def update_user(user_id):
    if request.method == 'OPTIONS':
        return add_cors(jsonify({}))
    data = request.get_json() or {}
    fields = []
    params = []
    if 'auth' in data:
        fields.append('auth = ?')
        params.append(int(data.get('auth', 0)))
    if 'name' in data:
        fields.append('name = ?')
        params.append(str(data.get('name')))
    if 'pass' in data:
        fields.append('pass = ?')
        params.append(str(data.get('pass')))
    if not fields:
        return add_cors(jsonify({'ok': False, 'error': 'no fields'})), 400
    params.append(user_id)
    sql = f"UPDATE Embllyes SET {', '.join(fields)} WHERE id = ?;"
    with get_conn() as conn:
        conn.execute(sql, tuple(params))
    return add_cors(jsonify({'ok': True}))


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def static_proxy(path):
    # Serve the root landing page from the repository root.
    # Serve other app pages and assets from the frontend directory.
    if path == '' or path == 'index.html':
        return send_from_directory(ROOT_DIR, 'index.html')
    return send_from_directory(FRONTEND_DIR, path)


if __name__ == '__main__':
    # Ensure tables exist before serving
    ensure_table()
    # Bind to 0.0.0.0 and respect the PORT env var provided by Render
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
