import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('all four diamond lessons are accessible to visitors without registering',()=>{
  const source=fs.readFileSync('public/ui.js','utf8');
  const functions=source.slice(source.indexOf('function renderDetail('),source.indexOf('function progress('));
  const catalog=JSON.parse(fs.readFileSync('catalog.json','utf8'));
  const lessonRoot={innerHTML:'',querySelector:()=>({})},detailRoot={innerHTML:''},start={onclick:null};
  const mounts=[],location={hash:''};
  const documentMap={'#lesson-root':lessonRoot,'#course-detail-root':detailRoot,'#start-course':start};
  const context=vm.createContext({catalog,location,user:null,levels:{intermediate:'متوسط'},esc:String,num:String,$:key=>documentMap[key],attempt:fn=>fn(),PrestigeStore:{user:()=>null,account:()=>{throw Error('guest cannot have account')},visit:()=>{throw Error('guest visit cannot require account')},enroll:()=>{throw Error('guest cannot enroll')}},window:{mountDiamondModel:(_,id)=>mounts.push(id)}});
  vm.runInContext(functions,context);
  for(const id of [13,14,15,19]){context.lessonId=id;vm.runInContext('renderLesson(lessonId)',context);assert.match(lessonRoot.innerHTML,new RegExp(catalog.lessons.find(x=>x.id===id).title));assert.match(lessonRoot.innerHTML,/data-diamond-viewer/);assert.doesNotMatch(lessonRoot.innerHTML,/ثبت‌نام/);}
  assert.deepEqual(mounts,[13,14,15,19]);
  vm.runInContext('renderDetail(2)',context);start.onclick();assert.equal(location.hash,'lesson?id=13');
});
