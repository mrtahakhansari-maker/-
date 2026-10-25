import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('Pages and server use the approved vertical model and the same three-course catalog',()=>{
  const script=fs.readFileSync('public/emerald.js','utf8');
  assert.equal(script,fs.readFileSync('docs/emerald.js','utf8'));
  assert.match(script,/initialTilt=-Math.atan2\(5.4,2.9\)/);
  assert.ok(!script.includes('emerald-rotation'));
  const html=fs.readFileSync('docs/index.html','utf8');
  const catalog=JSON.parse(fs.readFileSync('catalog.json','utf8'));
  assert.match(html,/catalog\.js/);
  assert.deepEqual(catalog,JSON.parse(fs.readFileSync('catalog.json','utf8')));
  for(const level of ['beginner','intermediate','advanced'])assert.equal(catalog.courses.filter(c=>c.level===level).length,1);
  for(const c of catalog.courses)assert.ok(fs.existsSync('docs/'+c.image));
  for(const match of html.matchAll(/<script(?:[^>]*src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g)){
    if(match[1])assert.ok(fs.existsSync('docs/'+match[1].split('?')[0]));else new vm.Script(match[2]);
  }
  const glb=fs.readFileSync('docs/assets/colombian-emerald.glb');
  assert.equal(glb.readUInt32LE(0),0x46546c67);
  assert.equal(glb.readUInt32LE(8),glb.length);
});

for(const width of [320,736])test(`model renders and responds to pointer, touch and keyboard at ${width}px`,()=>{
  const frames=[],events={},hostEvents={},docEvents={};let points=[],visibleCallback;
  const ctx=new Proxy({}, {get:(_,key)=>(...args)=>{if(key==='lineTo'||key==='moveTo'){assert.ok(args.every(Number.isFinite));points.push(...args);}},set:()=>true});
  const replacement={getContext:()=>ctx,addEventListener:(n,f)=>events[n]=f,getBoundingClientRect:()=>({width,height:400,left:0,top:0}),setPointerCapture(){}};
  const canvas={getContext:()=>null,cloneNode:()=>replacement,replaceWith(){}};
  let replaced=false;
  const root={classList:{add(){}},querySelector:()=>replaced?replacement:(replaced=true,canvas),addEventListener:(n,f)=>hostEvents[n]=f};
  const document={hidden:false,querySelector:()=>root,addEventListener:(n,f)=>docEvents[n]=f};
  const sandbox={document,matchMedia:()=>({matches:false}),devicePixelRatio:1,requestAnimationFrame:f=>(frames.push(f),frames.length),ResizeObserver:class{constructor(f){this.f=f;}observe(){this.f();}},IntersectionObserver:class{constructor(f){visibleCallback=f;}observe(){visibleCallback([{isIntersecting:true}]);}}};
  vm.runInNewContext(fs.readFileSync('public/emerald.js','utf8'),sandbox);
  const flush=()=>{let count=0;while(frames.length){assert.ok(count++<300,'animation settles');frames.shift()();}};
  flush();assert.ok(points.length>100);const first=points.join();points=[];
  events.pointermove({pointerType:'mouse',clientX:width*.9,clientY:200});flush();assert.notEqual(points.join(),first);points=[];
  hostEvents.keydown({key:'ArrowRight',preventDefault(){}});flush();assert.ok(points.length>100);
  events.pointerdown({clientX:100,clientY:150,pointerId:1});events.pointermove({pointerType:'touch',clientX:160,clientY:160});events.pointerup();flush();
  points=[];document.hidden=true;hostEvents.keydown({key:'Home',preventDefault(){}});flush();assert.equal(points.length,0);
  document.hidden=false;docEvents.visibilitychange();flush();assert.ok(points.length>100);
  points=[];visibleCallback([{isIntersecting:false}]);hostEvents.keydown({key:'ArrowLeft',preventDefault(){}});flush();assert.equal(points.length,0);
  visibleCallback([{isIntersecting:true}]);flush();assert.ok(points.length>100);
});
