// G-STUDIO: guarda o app no aparelho para abrir mesmo sem internet
const CACHE=__CACHE__; // o build grava: 'gstudio-v' + versão do package.json
const CORE=__CORE__; // o build grava: página, ícones, amostras e os arquivos do app gerados pelo build
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // páginas e ícones: busca a versão nova primeiro e só usa o cache sem internet
  if(r.mode==='navigate'||/\.(html|webmanifest|png|svg|ico)$/.test(u.pathname)||u.pathname.endsWith('/')){
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true})));return}
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
