'use strict';
// Load the 3D engine only when a diamond lesson is opened.
let diamondEnginePromise;
function loadDiamondEngine(){
  if(!diamondEnginePromise){
    const load=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error('Model resource unavailable'));document.head.append(script);});
    diamondEnginePromise=load('three.min.js').then(()=>load('diamond-model.js?v=20261030-quality')).catch(error=>{diamondEnginePromise=null;throw error;});
  }
  return diamondEnginePromise;
}
function showDiamondModel(host,id){
  loadDiamondEngine().then(()=>{if(host.isConnected&&host.closest('.page.active'))window.mountDiamondModel(host,id);}).catch(()=>{if(host.isConnected)host.textContent='مدل سه‌بعدی بارگذاری نشد؛ لطفاً اتصال را بررسی و صفحه را دوباره باز کنید.';});
}
