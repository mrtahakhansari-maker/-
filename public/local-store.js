'use strict';
// Explicitly local demo profiles: no remote authentication, SMS or message delivery.
const PrestigeStore=(()=>{
 const KEY='prestige-demo-accounts-v2',SESSION='prestige-demo-session-v2';
 const phone=value=>{let s=String(value||'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[\s()-]/g,'');if(s.startsWith('+98'))s='0'+s.slice(3);if(s.startsWith('0098'))s='0'+s.slice(4);return s;};
 function read(){try{const d=JSON.parse(localStorage.getItem(KEY)||'{"accounts":{}}');return d&&d.accounts&&typeof d.accounts==='object'&&!Array.isArray(d.accounts)?d:{accounts:{}};}catch{return {accounts:{}};}}
 function write(d){try{localStorage.setItem(KEY,JSON.stringify(d));}catch{throw Error('مرورگر اجازه ذخیره حساب آزمایشی را نمی‌دهد.');}}
 function active(){try{return localStorage.getItem(SESSION)||sessionStorage.getItem(SESSION)||'';}catch{return '';}}
 function user(){return read().accounts[active()]?.profile||null;}
 function register(input){const mobile=phone(input.phone);if(!/^09\d{9}$/.test(mobile))throw Error('شماره موبایل معتبر وارد کنید.');const p={phone:mobile,firstName:String(input.firstName||'').trim(),lastName:String(input.lastName||'').trim(),email:String(input.email||'').trim().toLowerCase(),city:String(input.city||'').trim()};if(p.firstName.length<2||p.lastName.length<2||p.city.length<2||p.firstName.length>60||p.lastName.length>60||p.city.length>80||p.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))throw Error('نام، نام خانوادگی، ایمیل و شهر را درست و کامل وارد کنید.');const d=read();if(Object.values(d.accounts).some(a=>a.profile.phone===mobile))throw Error('این شماره روی همین مرورگر ثبت شده؛ از بخش ورود استفاده کنید.');const id=(crypto.randomUUID?crypto.randomUUID():'user-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));const profile={id,...p,name:p.firstName+' '+p.lastName};d.accounts[id]={profile,enrollments:[],completions:[],visited:[],tickets:[]};write(d);localStorage.setItem(SESSION,id);sessionStorage.setItem(SESSION,id);return profile;}
 function login(value){const entry=Object.entries(read().accounts).find(([,a])=>a.profile.phone===phone(value));if(!entry)throw Error('این شماره در همین مرورگر ثبت نشده است؛ ابتدا ثبت‌نام کنید.');localStorage.setItem(SESSION,entry[0]);sessionStorage.setItem(SESSION,entry[0]);return entry[1].profile;}
 function account(){const a=read().accounts[active()];if(!a)throw Error('ابتدا وارد حساب خود شوید.');return a;}
 function update(fn){const d=read(),id=active();if(!d.accounts[id])throw Error('ابتدا وارد حساب خود شوید.');fn(d.accounts[id]);write(d);}
 function enroll(id){update(a=>{if(!a.enrollments.includes(id))a.enrollments.push(id);});}
 function visit(id,courseId){update(a=>{if(!a.enrollments.includes(courseId))a.enrollments.push(courseId);if(!a.visited.includes(id))a.visited.push(id);});}
 function complete(id,courseId){visit(id,courseId);update(a=>{if(!a.completions.includes(id))a.completions.push(id);});}
 function ticket(input){update(a=>a.tickets.push({id:Date.now(),topic:input.topic,message:input.message,status:'ذخیره روی این مرورگر؛ ارسال نشده'}));}
 function logout(){localStorage.removeItem(SESSION);sessionStorage.removeItem(SESSION);}
 return {phone,user,register,login,account,enroll,visit,complete,ticket,logout};
})();
