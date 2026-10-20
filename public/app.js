'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = n => Number(n).toLocaleString('fa-IR');
const levels = { beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته' };
let catalog = { courses: [], lessons: [], plans: [] }, user = null, dashboard = null;
let level = 'all', query = '', lastFocus;
async function api(path, data) {
  const res = await fetch('/api/' + path, data === undefined ? {} : { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'خطا در ارتباط با سرور');
  return result;
}
function toast(message, error = false) {
  const el = document.createElement('div'); el.className = 'toast' + (error ? ' error' : ''); el.setAttribute('role','status'); el.textContent = message; $('#toast-region').append(el); setTimeout(() => el.remove(), 6000);
}
async function action(button, fn) {
  if (button?.disabled) return;
  if (button) button.disabled = true;
  try { await fn(); } catch(e) { toast(e.message, true); } finally { if (button) button.disabled = false; }
}
function auth(tab = 'login') {
  lastFocus = document.activeElement; $('#auth-backdrop').classList.add('open'); selectTab(tab); $(`#form-${tab} input`).focus();
}
function closeAuth() { $('#auth-backdrop').classList.remove('open'); lastFocus?.focus(); }
function selectTab(tab) {
  for (const mode of ['login','register']) { $(`#tab-${mode}`).setAttribute('aria-selected',String(mode===tab)); $(`#form-${mode}`).classList.toggle('active',mode===tab); }
}
function accountUI() {
  $('#btn-login').textContent = user ? user.name : 'ورود'; $('#btn-register').textContent = user ? 'خروج' : 'ثبت‌نام';
}
function card(c) {
  return `<article class="card course-card" tabindex="0" role="link" data-course="${c.id}" aria-label="دوره ${esc(c.title)}"><div class="course-thumb"><img src="logo.png" alt="" /></div><div class="course-body"><span class="chip">${levels[c.level]}</span> <span class="chip">نسخه نمونه</span><h3>${esc(c.title)}</h3><div class="course-meta"><span>${num(c.lessons)} درس متنی</span><span>مطالعه آزاد</span></div><div class="course-foot"><span class="price">رایگان</span><span class="btn btn-dark btn-sm">مشاهده دوره ←</span></div></div></article>`;
}
function renderCourses() {
  const list = catalog.courses.filter(c => (level === 'all' || c.level === level) && (c.title+c.desc).includes(query));
  $('#courses-grid').innerHTML = list.length ? list.map(card).join('') : '<div class="empty-state"><p>دوره‌ای یافت نشد.</p><button class="btn btn-ghost" id="reset-filters">پاک‌کردن فیلترها</button></div>';
  $('#reset-filters')?.addEventListener('click',() => { level='all'; query=''; $('#course-search').value=''; $$('#level-tabs .tab').forEach(t=>t.setAttribute('aria-selected',String(t.dataset.level==='all'))); renderCourses(); });
}
async function loadDashboard() { dashboard = user ? await api('dashboard') : null; }
const isEnrolled = id => dashboard?.enrollments.some(e => e.course_id === id);
const isComplete = id => dashboard?.completions.some(e => e.lesson_id === id);
async function renderDetail(id) {
  const c = catalog.courses.find(c => c.id === id);
  if (!c) { $('#course-detail-root').innerHTML = '<p>دوره پیدا نشد.</p><a href="#courses">بازگشت به دوره‌ها</a>'; return; }
  if (user) await loadDashboard();
  $('#course-detail-root').innerHTML = `<div class="card course-header"><span class="kicker">آکادمی پرستیژ / دوره نمونه</span><h1>${esc(c.title)}</h1><p>${esc(c.desc)}</p><div class="meta-row"><span>${num(c.lessons)} درس متنی</span><span>سطح ${levels[c.level]}</span><span>دسترسی رایگان آزمایشی</span></div><button class="btn btn-primary" id="enroll-btn">${isEnrolled(id) ? 'ادامه یادگیری' : 'ثبت‌نام رایگان در دوره'}</button> <a class="btn btn-ghost" href="#courses">همه دوره‌ها</a></div><div class="detail-grid"><div><h2>سرفصل‌ها و درس‌ها</h2><div class="lesson-list">${catalog.lessons.filter(l=>l.courseId===id).map((l,i)=>`<a class="card lesson-link" href="#lesson?id=${l.id}"><span class="lesson-num">${num(i+1)}</span><span>${esc(l.title)}</span><span class="lesson-state">${isComplete(l.id)?'✓ مطالعه شده':'مطالعه ←'}</span></a>`).join('')}</div></div><aside class="card panel"><img class="aside-logo" src="logo.png" alt="پرستیژ" /><h3>پیش از شروع</h3><p>محتوای این نسخه، درس متنی نمونه برای آزمایش وب‌اپلیکیشن است. ویدئوها و محتوای نهایی مدرس هنوز افزوده نشده‌اند.</p><p>تکمیل این نمونه، گواهی حرفه‌ای یا اعتبار آزمایشگاهی ایجاد نمی‌کند.</p></aside></div>`;
  $('#enroll-btn').addEventListener('click',e=>action(e.currentTarget,async()=>{
    if (!user) return auth('register');
    await api('enroll',{courseId:id}); await loadDashboard();
    const next=catalog.lessons.find(l=>l.courseId===id&&!isComplete(l.id))||catalog.lessons[0]; location.hash=`lesson?id=${next.id}`;
  }));
}
async function renderLesson(id) {
  const root = $('#lesson-root');
  if (!user) { root.innerHTML='<div class="card panel"><h1>وارد حساب خود شوید</h1><p>برای مطالعه و ذخیره پیشرفت، یک حساب بسازید.</p><button id="lesson-login" class="btn btn-primary">ورود / ثبت‌نام</button></div>'; $('#lesson-login').onclick=()=>auth('register'); return; }
  await loadDashboard(); const meta=catalog.lessons.find(l=>l.id===id);
  if (!meta) { root.textContent='درس پیدا نشد.'; return; }
  if (!isEnrolled(meta.courseId)) { root.innerHTML='<div class="card panel"><h1>شروع یادگیری</h1><p>ابتدا ثبت‌نام رایگان دوره را انجام دهید.</p><a class="btn btn-primary" href="#course-detail?id='+meta.courseId+'">صفحه دوره</a></div>'; return; }
  const lesson=await api('lessons/'+id); const next=catalog.lessons.find(l=>l.courseId===lesson.courseId&&l.id>id);
  root.innerHTML=`<a class="btn btn-ghost" href="#course-detail?id=${lesson.courseId}">→ بازگشت به سرفصل‌ها</a><article class="card reading"><span class="kicker">درس ${num(id)} از ${num(catalog.lessons.length)} · محتوای نمونه</span><h1>${esc(lesson.title)}</h1>${lesson.content.split('\n').map(p=>`<p>${esc(p)}</p>`).join('')}<div class="reading-footer"><button class="btn btn-primary" id="complete-lesson">${isComplete(id)?'✓ این درس مطالعه شده':'مطالعه کردم؛ ذخیره پیشرفت'}</button>${next?`<a class="btn btn-ghost" href="#lesson?id=${next.id}">درس بعدی ←</a>`:'<a class="btn btn-ghost" href="#dashboard">مشاهده پیشرفت من</a>'}</div></article>`;
  $('#complete-lesson').onclick=e=>action(e.currentTarget,async()=>{ await api('complete',{lessonId:id}); await loadDashboard(); $('#complete-lesson').textContent='✓ این درس مطالعه شده'; toast('پیشرفت شما ذخیره شد.'); });
}
async function renderDashboard() {
  const root=$('#page-dashboard .container');
  if (!user) { root.innerHTML='<div class="card panel"><h1>داشبورد شما</h1><p>برای مشاهده دوره‌ها و پیشرفت خود وارد شوید.</p><button class="btn btn-primary" id="dashboard-login">ورود به حساب</button></div>'; $('#dashboard-login').onclick=()=>auth(); return; }
  await loadDashboard();
  const plans={basic:'پایه',pro:'حرفه‌ای',expert:'تخصصی'};
  root.innerHTML=`<div class="page-head"><span class="kicker">پنل دانشجو</span><h1>سلام، ${esc(user.name)}</h1><p>هر قدم کوچک، بخشی از مسیر یادگیری شماست.</p></div><div class="dash-grid"><div><div class="card panel"><h2>دوره‌های من</h2>${dashboard.enrollments.length?dashboard.enrollments.map(e=>{const c=catalog.courses.find(c=>c.id===e.course_id);if(!c)return '';const count=dashboard.completions.filter(l=>l.course_id===c.id).length;const pct=Math.round(count/c.lessons*100);return `<div class="progress-row"><div class="progress-top"><b>${esc(c.title)}</b><span>${num(pct)}٪</span></div><div class="progress-track" role="progressbar" aria-label="پیشرفت ${esc(c.title)}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${pct}%"></div></div><p>${num(count)} از ${num(c.lessons)} درس</p><a class="btn btn-primary btn-sm" href="#course-detail?id=${c.id}">ادامه یادگیری</a></div>`;}).join(''):'<p>هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p><a class="btn btn-primary" href="#courses">انتخاب اولین دوره</a>'}</div><div class="card panel spaced"><h2>درخواست‌های پشتیبانی</h2>${dashboard.tickets.length?dashboard.tickets.map(t=>`<div class="ticket"><b>درخواست ${num(t.id)} · ${esc(t.topic)}</b><p>${esc(t.message)}</p><p class="reply">${t.reply?'پاسخ: '+esc(t.reply):'در انتظار پاسخ مدیر'}</p></div>`).join(''):'<p>درخواست پشتیبانی ندارید.</p>'}</div></div><div><div class="card panel"><h2>حساب من</h2><p>${esc(user.email)}</p><p>${num(dashboard.enrollments.length)} دوره · ${num(dashboard.completions.length)} درس مطالعه‌شده</p><p>دسترسی فعلی: دوره نمونه رایگان</p></div><div class="card panel spaced"><h2>درخواست‌های اشتراک</h2>${dashboard.orders.length?dashboard.orders.map(o=>`<p>پلن ${esc(plans[o.plan])} · در انتظار بررسی</p>`).join(''):'<p>درخواستی ثبت نشده است.</p>'}<small>هیچ پرداختی در این نسخه انجام نمی‌شود.</small></div></div></div>${user.admin?'<div class="card panel spaced" id="admin-tickets"><h2>مدیریت پشتیبانی</h2></div>':''}`;
  if (user.admin) {
    const {tickets}=await api('admin/tickets'); $('#admin-tickets').innerHTML+='<p>پاسخ‌ها در پنل کاربر نمایش داده می‌شوند؛ ایمیل ارسال نمی‌شود.</p>'+tickets.map(t=>`<form class="admin-reply ticket" data-ticket="${t.id}"><b>#${num(t.id)} · ${esc(t.name)} · ${esc(t.email)}</b><p>${esc(t.message)}</p><label>پاسخ<textarea name="reply" required maxlength="5000">${esc(t.reply)}</textarea></label><button class="btn btn-primary btn-sm">ذخیره پاسخ</button></form>`).join('');
    $$('.admin-reply').forEach(f=>f.onsubmit=e=>{e.preventDefault();action(f.querySelector('button'),async()=>{await api('admin/reply',{id:Number(f.dataset.ticket),reply:new FormData(f).get('reply')});toast('پاسخ ذخیره شد.');});});
  }
}
function renderPricing() {
  $('#pricing-grid').innerHTML=catalog.plans.map(p=>`<article class="card plan ${p.recommended?'recommended':''}">${p.recommended?'<span class="badge-rec">پیشنهاد پرستیژ</span>':''}<h3>${esc(p.name)}</h3><div class="plan-price">${num(p.price)} <small>تومان / ماه</small></div><ul class="plan-features">${p.features.filter(Boolean).map(f=>`<li>${esc(f)}</li>`).join('')}</ul><p class="plan-note">امکانات پیشنهادی برای نسخه نهایی؛ هنوز فعال نیست.</p><button class="btn btn-primary btn-block" data-plan="${p.id}">ثبت درخواست پلن ${esc(p.name)}</button></article>`).join('');
  $$('[data-plan]').forEach(btn=>btn.onclick=()=>action(btn,async()=>{if(!user)return auth('register');const result=await api('orders',{plan:btn.dataset.plan});toast(result.message); }));
}
let routeVersion=0;
async function route() {
  const version=++routeVersion;
  const [path, qs='']=location.hash.slice(1).split('?');const name=path||'home';
  const valid=['home','courses','course-detail','pricing','dashboard','support','lesson']; const current=valid.includes(name)?name:'home';
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${current}`));
  $$('[data-route]').forEach(a=>{if(a.dataset.route===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  $('#mobile-menu').classList.remove('open');$('#hamburger').setAttribute('aria-expanded','false');window.scrollTo(0,0);
  const id=Number(new URLSearchParams(qs).get('id'));
  try { if(current==='course-detail')await renderDetail(id);if(current==='lesson')await renderLesson(id);if(current==='dashboard')await renderDashboard(); } catch(e){if(version===routeVersion)toast(e.message,true);}
}
$('#btn-login').onclick=()=>user?(location.hash='dashboard'):auth();
$('#btn-register').onclick=e=>user?action(e.currentTarget,async()=>{await api('logout',{});user=null;dashboard=null;accountUI();await route();toast('از حساب خارج شدید.');}):auth('register');
$('#auth-close').onclick=closeAuth;
$('#auth-backdrop').onclick=e=>{if(e.target===$('#auth-backdrop'))closeAuth();};
$('#tab-login').onclick=()=>selectTab('login');$('#tab-register').onclick=()=>selectTab('register');
document.addEventListener('keydown',e=>{
  if(!$('#auth-backdrop').classList.contains('open'))return;
  if(e.key==='Escape')closeAuth();
  if(e.key==='Tab'){const nodes=[...$('#auth-backdrop').querySelectorAll('button,input')].filter(n=>n.offsetParent!==null);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
for(const mode of ['login','register']){
  const f=$(`#form-${mode}`);f.onsubmit=e=>{e.preventDefault();if(!f.reportValidity())return;action(f.querySelector('[type="submit"]'),async()=>{
    const prefix=mode==='login'?'lg':'rg';const data={email:$(`#${prefix}-email`).value.trim(),password:$(`#${prefix}-pass`).value};if(mode==='register')data.name=$('#rg-name').value.trim();
    await api(mode,data);user=(await api('me')).user;accountUI();closeAuth();f.reset();toast('خوش آمدید؛ حساب شما آماده است.');await route();
  });};
}
$('#hamburger').onclick=()=>{const opened=$('#mobile-menu').classList.toggle('open');$('#hamburger').setAttribute('aria-expanded',String(opened));};
$('#course-search').oninput=e=>{query=e.target.value.trim();renderCourses();};
$$('#level-tabs .tab').forEach(t=>t.onclick=()=>{level=t.dataset.level;$$('#level-tabs .tab').forEach(x=>x.setAttribute('aria-selected',String(x===t)));renderCourses();});
document.addEventListener('click',e=>{const c=e.target.closest('[data-course]');if(c)location.hash=`course-detail?id=${c.dataset.course}`;});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-course]'))location.hash=`course-detail?id=${e.target.dataset.course}`;});
$('#contact-form').onsubmit=e=>{e.preventDefault();if(!user){toast('برای ثبت و پیگیری پیام وارد حساب شوید.',true);return auth();}const f=e.currentTarget;if(!f.reportValidity())return;action(f.querySelector('[type="submit"]'),async()=>{const data=Object.fromEntries(new FormData(f));const r=await api('tickets',data);toast(`درخواست شماره ${num(r.id)} ثبت شد؛ پاسخ را از داشبورد پیگیری کنید.`);f.reset();});};
$$('.channel[data-toast]').forEach(ch=>{ch.removeAttribute('data-toast');ch.onclick=e=>{e.preventDefault();toast('اطلاعات این کانال هنوز تنظیم نشده است. از فرم پشتیبانی استفاده کنید.');};});
window.addEventListener('hashchange',route);
async function init(){
  try{
    [catalog,{user}]=await Promise.all([api('catalog'),api('me')]);accountUI();renderCourses();renderPricing();
    $('#home-featured').innerHTML=catalog.courses.map(card).join('');
    $('#home-testimonials').innerHTML=[['۱','حساب خود را بسازید','ورود و ثبت‌نام با ذخیره امن اطلاعات حساب.'],['۲','مطالعه را شروع کنید','در دوره نمونه ثبت‌نام کنید و درس‌ها را بخوانید.'],['۳','پیشرفت خود را ببینید','درس‌های مطالعه‌شده را در داشبورد پیگیری کنید.']].map(([n,title,body])=>`<div class="card panel"><span class="step-number">${n}</span><h3>${title}</h3><p>${body}</p></div>`).join('');
    $('#faq-accordion').innerHTML=[['این نسخه چه امکاناتی دارد؟','ثبت‌نام، ورود، دوره متنی نمونه، ذخیره پیشرفت، ثبت درخواست اشتراک و پیگیری پشتیبانی فعال است.'],['آیا پرداخت انجام می‌شود؟','خیر؛ درگاه پرداخت متصل نیست. انتخاب پلن فقط درخواست ثبت می‌کند.'],['آیا گواهی رسمی صادر می‌شود؟','این نسخه نمونه گواهی رسمی صادر نمی‌کند. شرایط و محتوای نهایی باید توسط آکادمی تنظیم شود.'],['پیام پشتیبانی کجا می‌رود؟','پیام در پایگاه داده ذخیره می‌شود؛ پاسخ مدیر را در داشبورد می‌بینید. ایمیل یا پیام‌رسان خودکار متصل نیست.']].map(([q,a])=>`<details class="card faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('');
    await route();
  }catch(e){toast('ارتباط با سرور برقرار نشد. برنامه را با Start-Prestige.cmd اجرا کنید.',true);$('#home-featured').innerHTML='<p>سرور در دسترس نیست. راهنمای اجرا را ببینید.</p>';}
}
init();
