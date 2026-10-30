import http from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';

const root = dirname(fileURLToPath(import.meta.url));
const publicRoot = resolve(root, 'public');
const dbPath = process.env.DB_PATH || resolve(root, 'data/prestige.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id), expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS enrollments(user_id INTEGER REFERENCES users(id), course_id INTEGER, created TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,course_id));
CREATE TABLE IF NOT EXISTS completions(user_id INTEGER, course_id INTEGER, lesson_id INTEGER, created TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id,course_id,lesson_id), FOREIGN KEY(user_id,course_id) REFERENCES enrollments(user_id,course_id));
CREATE TABLE IF NOT EXISTS tickets(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), name TEXT NOT NULL, email TEXT NOT NULL, topic TEXT NOT NULL, message TEXT NOT NULL, reply TEXT DEFAULT '', created TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), plan TEXT NOT NULL, status TEXT DEFAULT 'pending', created TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS pending_orders ON orders(user_id,plan) WHERE status='pending';`);
const catalog = JSON.parse(readFileSync(resolve(root, 'catalog.json'), 'utf8'));
const hashPassword = promisify(scrypt);
const digest = s => createHash('sha256').update(s).digest('hex');
const validEmail = s => typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const limits = new Map();
function limit(req, category, max) {
  const key = `${req.socket.remoteAddress}:${category}`;
  const now = Date.now();
  let item = limits.get(key);
  if (!item || item.until < now) { item = { count: 0, until: now + 600000 }; limits.set(key, item); }
  if (++item.count > max) fail(429, 'درخواست‌های زیادی ارسال شده؛ چند دقیقه دیگر دوباره تلاش کنید.');
}
const cleanup = setInterval(() => {
  for (const [key, item] of limits) if (item.until < Date.now()) limits.delete(key);
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
}, 600000); cleanup.unref();
function userFor(req) {
  const token = /(?:^|;\s*)prestige_session=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];
  if (!token) return null;
  const u = db.prepare('SELECT u.id,u.name,u.email FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>?').get(digest(token), Date.now());
  return u ? { ...u, admin: !!process.env.ADMIN_EMAIL && u.email === process.env.ADMIN_EMAIL.trim().toLowerCase() } : null;
}
function requireUser(req) { return userFor(req) || fail(401, 'ابتدا وارد حساب کاربری شوید.'); }
function session(res, id) {
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), id, Date.now() + 7 * 86400000);
  res.setHeader('Set-Cookie', `prestige_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.COOKIE_SECURE === 'true' ? '; Secure' : ''}`);
}
function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); }
async function body(req) {
  if (!String(req.headers['content-type']).startsWith('application/json')) fail(415, 'نوع درخواست نامعتبر است.');
  let text = '';
  for await (const chunk of req) { text += chunk; if (Buffer.byteLength(text) > 20000) fail(413, 'حجم درخواست بیش از حد مجاز است.'); }
  try { const result = JSON.parse(text); if (!result || Array.isArray(result) || typeof result !== 'object') throw Error(); return result; } catch { fail(400, 'درخواست نامعتبر است.'); }
}
function text(v, min, max) { if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) fail(400, 'اطلاعات فرم را بررسی کنید.'); return v.trim(); }
function courseFor(id) { return catalog.courses.find(c => c.id === Number(id)) || fail(404, 'دوره پیدا نشد.'); }
function enrolled(u, id) { if (!db.prepare('SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?').get(u.id, id)) fail(403, 'ابتدا در دوره ثبت‌نام کنید.'); }

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  try {
    const url = new URL(req.url, 'http://localhost'); const path = url.pathname;
    if (path.startsWith('/api/')) {
      if (!['GET', 'POST'].includes(req.method)) fail(405, 'روش درخواست مجاز نیست.');
      if (req.method === 'POST') {
        const origin = req.headers.origin;
        if (origin && origin !== `http://${req.headers.host}` && origin !== `https://${req.headers.host}` && origin !== process.env.PUBLIC_ORIGIN) fail(403, 'مبدأ درخواست نامعتبر است.');
      }
      if (path === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true });
      if (path === '/api/catalog' && req.method === 'GET') return json(res, 200, { ...catalog, lessons: catalog.lessons.map(({ content, ...l }) => l) });
      if (path === '/api/me' && req.method === 'GET') return json(res, 200, { user: userFor(req) });
      if (['/api/register', '/api/login'].includes(path) && req.method === 'POST') {
        limit(req, 'auth', 30); const b = await body(req);
        if (!validEmail(b.email) || typeof b.password !== 'string' || b.password.length < 8 || b.password.length > 128) fail(400, 'ایمیل معتبر و رمز عبور ۸ تا ۱۲۸ کاراکتری وارد کنید.');
        const email = b.email.trim().toLowerCase(); let id;
        if (path === '/api/register') {
          const name = text(b.name, 3, 80);
          const salt = randomBytes(16).toString('hex'); const hash = (await hashPassword(b.password, salt, 64)).toString('hex');
          try { id = Number(db.prepare('INSERT INTO users(name,email,password) VALUES(?,?,?)').run(name, email, `${salt}:${hash}`).lastInsertRowid); }
          catch (e) { if (String(e.message).includes('UNIQUE')) fail(409, 'این ایمیل قبلاً ثبت شده است.'); throw e; }
        } else {
          const u = db.prepare('SELECT * FROM users WHERE email=?').get(email);
          const [salt, stored] = (u?.password || `${'0'.repeat(32)}:${'0'.repeat(128)}`).split(':');
          const hash = await hashPassword(b.password, salt, 64);
          if (!u || !timingSafeEqual(hash, Buffer.from(stored, 'hex'))) fail(401, 'ایمیل یا رمز عبور صحیح نیست.');
          id = u.id;
        }
        session(res, id); return json(res, 200, { ok: true });
      }
      if (path === '/api/logout' && req.method === 'POST') {
        const token = /(?:^|;\s*)prestige_session=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];
        if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token));
        res.setHeader('Set-Cookie', 'prestige_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); return json(res, 200, { ok: true });
      }
      if (path === '/api/dashboard' && req.method === 'GET') {
        const u = requireUser(req);
        return json(res, 200, { user: u, enrollments: db.prepare('SELECT * FROM enrollments WHERE user_id=?').all(u.id), completions: db.prepare('SELECT * FROM completions WHERE user_id=?').all(u.id), orders: db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC').all(u.id), tickets: db.prepare('SELECT id,topic,message,reply,created FROM tickets WHERE user_id=? ORDER BY id DESC').all(u.id) });
      }
      if (path === '/api/enroll' && req.method === 'POST') {
        const u = requireUser(req); const c = courseFor((await body(req)).courseId);
        db.prepare('INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)').run(u.id, c.id); return json(res, 200, { ok: true });
      }
      const lessonMatch = /^\/api\/lessons\/(\d+)$/.exec(path);
      if (lessonMatch && req.method === 'GET') {
        const u = requireUser(req); const l = catalog.lessons.find(l => l.id === Number(lessonMatch[1])) || fail(404, 'درس پیدا نشد.'); enrolled(u, l.courseId); return json(res, 200, l);
      }
      if (path === '/api/complete' && req.method === 'POST') {
        const u = requireUser(req); const b = await body(req); const l = catalog.lessons.find(l => l.id === Number(b.lessonId)) || fail(404, 'درس پیدا نشد.'); enrolled(u, l.courseId);
        db.prepare('INSERT OR IGNORE INTO completions(user_id,course_id,lesson_id) VALUES(?,?,?)').run(u.id, l.courseId, l.id); return json(res, 200, { ok: true });
      }
      if (path === '/api/orders' && req.method === 'POST') {
        const u = requireUser(req); const plan = (await body(req)).plan; if (!catalog.plans.some(p => p.id === plan)) fail(400, 'پلن نامعتبر است.');
        db.prepare('INSERT OR IGNORE INTO orders(user_id,plan) VALUES(?,?)').run(u.id, plan); return json(res, 200, { ok: true, message: 'درخواست اشتراک ثبت شد؛ پرداختی انجام نشده و اشتراک هنوز فعال نیست.' });
      }
      if (path === '/api/tickets' && req.method === 'POST') {
        limit(req, 'support', 15); const b = await body(req); const u = requireUser(req);
        const name = text(b.name, 3, 80), topic = text(b.topic, 1, 80), message = text(b.message, 10, 5000);
        if (!validEmail(b.email)) fail(400, 'ایمیل معتبر وارد کنید.');
        const r = db.prepare('INSERT INTO tickets(user_id,name,email,topic,message) VALUES(?,?,?,?,?)').run(u.id, name, b.email, topic, message);
        return json(res, 201, { id: Number(r.lastInsertRowid) });
      }
      if (path === '/api/admin/tickets' && req.method === 'GET') {
        const u = requireUser(req); if (!u.admin) fail(403, 'دسترسی مدیر لازم است.'); return json(res, 200, { tickets: db.prepare('SELECT * FROM tickets ORDER BY id DESC').all() });
      }
      if (path === '/api/admin/reply' && req.method === 'POST') {
        const u = requireUser(req); if (!u.admin) fail(403, 'دسترسی مدیر لازم است.'); const b = await body(req); const reply = text(b.reply, 1, 5000);
        const result = db.prepare('UPDATE tickets SET reply=? WHERE id=?').run(reply, Number(b.id)); if (!result.changes) fail(404, 'درخواست پیدا نشد.'); return json(res, 200, { ok: true });
      }
      fail(404, 'مسیر پیدا نشد.');
    }
    if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'روش درخواست مجاز نیست.');
    const allowed = new Set(['/', '/index.html', '/app.js', '/ui.js', '/local-store.js', '/catalog.js', '/responsive.css', '/emerald.js', '/styles.css', '/logo.png', '/manifest.webmanifest', '/assets/course-beginner.jpg', '/assets/course-diamond.jpg', '/assets/course-advanced.jpg', '/assets/colombian-emerald.glb', '/assets/emerald.svg', '/three.min.js', '/diamond-model.js', '/translate-init.js', '/auth-i18n.js', '/assets/course-beginner.svg', '/assets/course-intermediate.svg', '/assets/course-advanced.svg']);
    if (!allowed.has(path)) fail(404, 'فایل پیدا نشد.');
    const file = resolve(publicRoot, path === '/' ? 'index.html' : path.slice(1));
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
    const buffer = readFileSync(file); res.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache' }); res.end(req.method === 'HEAD' ? undefined : buffer);
  } catch (e) { if (!e.status) console.error(e.message); if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'خطای سرور؛ دوباره تلاش کنید.' }); else res.end(); }
});
server.listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1', () => console.log(`Prestige Gemology: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 3000}`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => { db.close(); process.exit(0); }));
