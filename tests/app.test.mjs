import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

const temp = mkdtempSync(join(tmpdir(), 'prestige-test-'));
const port = 32000 + Math.floor(Math.random() * 10000);
const origin = `http://127.0.0.1:${port}`;
let child, cookie = '';
async function start() {
  child = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port), DB_PATH: join(temp,'test.sqlite'), ADMIN_EMAIL:'admin@example.test' }, stdio:['ignore','pipe','pipe'] });
  await Promise.race([once(child.stdout,'data'), once(child,'exit').then(()=>{throw Error('Server exited');})]);
}
async function stop() { if(child.exitCode===null){const done=once(child,'exit');child.kill();await done;} }
async function request(path, data, auth=cookie, customOrigin) {
  const res=await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{...(auth?{cookie:auth}:{}),...(data!==undefined?{'Content-Type':'application/json'}:{}),...(customOrigin?{Origin:customOrigin}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})});
  return {status:res.status,body:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]};
}
before(start);
after(async()=>{await stop();rmSync(temp,{recursive:true,force:true});});
test('account, enrollment, isolation, progress, persistence, support and subscription workflow',async()=>{
  assert.equal((await request('health')).status,200);
  assert.equal((await request('dashboard')).status,401);
  assert.equal((await request('register',{name:'Student Test',email:'student@example.test',password:'short'})).status,400);
  let r=await request('register',{name:'Student Test',email:'student@example.test',password:'TestPassword-123'});assert.equal(r.status,200);cookie=r.cookie;assert.ok(cookie);
  assert.equal((await request('register',{name:'Duplicate',email:'student@example.test',password:'TestPassword-123'})).status,409);
  assert.equal((await request('me')).body.user.name,'Student Test');
  assert.equal((await request('login',{email:'student@example.test',password:'IncorrectPassword'})).status,401);
  assert.equal((await request('lessons/1')).status,403);
  assert.equal((await request('enroll',{courseId:999})).status,404);
  assert.equal((await request('enroll',{courseId:1})).status,200);
  assert.equal((await request('lessons/1')).status,200);
  assert.equal((await request('complete',{lessonId:999})).status,404);
  assert.equal((await request('complete',{lessonId:1})).status,200);
  assert.equal((await request('complete',{lessonId:1})).status,200);
  assert.equal((await request('dashboard')).body.completions.length,1);
  assert.equal((await request('complete',{lessonId:2},cookie,'https://evil.example')).status,403);
  const other=await request('register',{name:'Other Student',email:'other@example.test',password:'TestPassword-123'});
  assert.equal((await request('dashboard',undefined,other.cookie)).body.completions.length,0);
  assert.equal((await request('lessons/1',undefined,other.cookie)).status,403);
  r=await request('tickets',{name:'Student Test',email:'student@example.test',topic:'course',message:'Please help me with lesson one.'});assert.equal(r.status,201);const ticketId=r.body.id;
  assert.equal((await request('admin/tickets')).status,403);
  const admin=await request('register',{name:'Admin Test',email:'admin@example.test',password:'TestPassword-123'});
  assert.equal((await request('admin/tickets',undefined,admin.cookie)).body.tickets.length,1);
  assert.equal((await request('admin/reply',{id:ticketId,reply:'Your request has been reviewed.'},admin.cookie)).status,200);
  assert.equal((await request('dashboard')).body.tickets[0].reply,'Your request has been reviewed.');
  assert.equal((await request('orders',{plan:'invalid'})).status,400);
  await request('orders',{plan:'pro'});await request('orders',{plan:'pro'});
  assert.equal((await request('dashboard')).body.orders.length,1);
  assert.equal((await request('dashboard')).body.orders[0].status,'pending');
  const publicCatalog=(await request('catalog')).body;
  assert.deepEqual(publicCatalog.courses.map(c=>c.level),['beginner','intermediate','advanced']);
  assert.equal(publicCatalog.lessons.length,19);assert.equal(publicCatalog.lessons[0].content,undefined);
  for (const course of publicCatalog.courses) {
    const lessons=publicCatalog.lessons.filter(l=>l.courseId===course.id);
    assert.equal(lessons.length,course.lessons);
    const image=await fetch(origin+'/'+course.image);
    assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/(svg\+xml|jpeg)/);
  }
  assert.equal((await request('lessons/13')).status,403);
  assert.equal((await request('enroll',{courseId:2},other.cookie)).status,200);
  assert.equal((await request('lessons/13',undefined,other.cookie)).status,200);
  assert.equal((await request('complete',{lessonId:13},other.cookie)).status,200);
  assert.equal((await request('lessons/16',undefined,other.cookie)).status,403);
  assert.equal((await request('enroll',{courseId:3},other.cookie)).status,200);
  assert.equal((await request('lessons/16',undefined,other.cookie)).status,200);
  await stop();await start();
  assert.equal((await request('dashboard')).body.completions.length,1);
  assert.equal((await request('dashboard')).body.tickets.length,1);
  await request('logout',{});assert.equal((await request('dashboard')).status,401);
  r=await request('login',{email:'student@example.test',password:'TestPassword-123'});assert.equal(r.status,200);
  assert.equal((await request('dashboard',undefined,r.cookie)).body.completions.length,1);
  assert.equal((await fetch(origin+'/server.mjs')).status,404);
  assert.equal((await fetch(origin+'/data/prestige.sqlite')).status,404);
  const page=await fetch(origin+'/');assert.ok(page.headers.get('content-security-policy'));assert.equal(page.status,200);
  const emeraldScript=await fetch(origin+'/emerald.js');assert.equal(emeraldScript.status,200);
  const emeraldModel=await fetch(origin+'/assets/colombian-emerald.glb');assert.equal(emeraldModel.status,200);assert.match(emeraldModel.headers.get('content-type'),/model\/gltf-binary/);
});
