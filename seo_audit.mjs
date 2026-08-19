const B='https://termojet.com.ua';
const UA='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const LANGS=['uk','en','pl','fr','de'];
const PFX={uk:'',en:'/en',pl:'/pl',fr:'/fr',de:'/de'};

// логічні шляхи (без мовного префікса) по типах
const P='/catalog/termojet-box/modul-termojet-box3-v-teploizolyatsiyi-km3-ups';
const PAGES=[
  ['home','/'],
  ['catalog','/catalog'],
  ['category','/catalog/nasosy'],
  ['product',P],
  ['blog','/blog'],
  ['faq','/faq'],
  ['about','/about'],
  ['service','/service'],
  ['contacts','/contacts'],
];

const get=async u=>{const r=await fetch(B+u,{headers:{'User-Agent':UA},redirect:'manual'});return {code:r.status,html:r.status<400||r.status===404?await r.text():''}};
const seo=h=>{const m=h.match(/id="seo-content">([\s\S]*?)<\/div>\s*<\/body>/);return m?m[1]:''};
const count=(h,re)=>(h.match(re)||[]).length;
const canonOf=h=>{const m=h.match(/rel="canonical" href="([^"]*)"/);return m?m[1]:''};
const hreflangs=h=>[...h.matchAll(/hreflang="([^"]*)"/g)].map(m=>m[1]);
const title=h=>{const m=h.match(/<title>([^<]*)<\/title>/);return m?m[1]:''};

let pass=0,fail=0; const fails=[];
const ok=(c,msg)=>{if(c)pass++;else{fail++;fails.push(msg)}};

console.log('=== A. CANONICAL (self) + HREFLANG (5+xdef) + TITLE — усі типи × 5 мов ===');
for(const [name,path] of PAGES){
  for(const lg of LANGS){
    const u=(PFX[lg]+(path==='/'?'':path))||'/';
    const {code,html}=await get(u);
    const expCanon=B+(PFX[lg]+(path==='/'?'':path)||'');
    const canon=canonOf(html);
    const nc=count(html,/rel="canonical"/g);
    const hl=hreflangs(html);
    const nt=count(html,/<title>/g);
    const s=seo(html);
    const nh1=count(s,/<h1/g);
    const selfOk=canon===expCanon || (path==='/'&&canon===B+PFX[lg]);
    const hlOk=['uk','en','pl','fr','de','x-default'].every(x=>hl.includes(x))&&hl.length===6;
    ok(code===200,`${u} code=${code}`);
    ok(nc===1,`${u} canonical×${nc}`);
    ok(selfOk,`${u} canonical=${canon} (exp ${expCanon})`);
    ok(hlOk,`${u} hreflang=[${hl}]`);
    ok(nt===1,`${u} title×${nt}`);
    ok(s.length>200,`${u} seoLen=${s.length}`);
    ok(nh1===1,`${u} seoH1×${nh1}`);
  }
  process.stdout.write(`  ${name.padEnd(9)} ✓ 5 мов\n`);
}
console.log(`\nПроміжно: pass=${pass} fail=${fail}`);
if(fails.length){console.log('FAILS:');fails.forEach(f=>console.log('  ❌',f))}
globalThis.__pass=pass;globalThis.__fail=fail;globalThis.__fails=fails;
