import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function storage(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear()};}
test('demo session and lesson progress persist across reloads on the same browser',()=>{
  const source=fs.readFileSync('public/local-store.js','utf8');
  const localStorage=storage(),sessionStorage=storage();
  function load(){const context=vm.createContext({localStorage,sessionStorage,crypto:{randomUUID:()=> 'test-user'},Math,Date,JSON,String,Object,Error});return vm.runInContext(source+'\nPrestigeStore',context);}
  let store=load();store.register({phone:'09123456789',firstName:'Test',lastName:'Student',email:'student@example.test',city:'Tehran'});store.visit(13,2);store.complete(13,2);
  sessionStorage.clear();store=load();assert.equal(store.user().phone,'09123456789');assert.equal(store.account().enrollments.includes(2),true);assert.equal(store.account().completions.includes(13),true);
  store.logout();assert.equal(load().user(),null);
});
test('after authentication only an internal lesson or course destination is resumed',()=>{
  const script=fs.readFileSync('public/ui.js','utf8');const section=script.slice(script.indexOf("const RETURN_KEY="),script.indexOf('function gate(root)'));
  const sessionStorage=storage(),location={hash:'#lesson?id=13'};const ctx=vm.createContext({sessionStorage,location});vm.runInContext(section,ctx);
  vm.runInContext('rememberDestination()',ctx);assert.equal(vm.runInContext('resumeAfterAuth()',ctx),'#lesson?id=13');assert.equal(vm.runInContext('resumeAfterAuth()',ctx),'#dashboard');
  sessionStorage.setItem('prestige-return-after-auth','https://example.com');assert.equal(vm.runInContext('resumeAfterAuth()',ctx),'#dashboard');
  assert.doesNotMatch(script,/history\.replaceState\(null,'','#home'\);route\(\)/);
  assert.match(fs.readFileSync('public/styles.css','utf8'),/\[hidden\]\s*\{\s*display\s*:\s*none\s*!important/);
});
