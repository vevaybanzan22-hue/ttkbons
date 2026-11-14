(()=>{
 try {
  const incoming = new URLSearchParams(window.location.search);
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem('__ttk_entry_params') || '{}'); } catch (e) {}
  incoming.forEach((v, k) => {
   if (v && !saved[k]) saved[k] = v;
  });
  if (Object.keys(saved).length > 0) {
   sessionStorage.setItem('__ttk_entry_params', JSON.stringify(saved));
  }
  window.__getTtkQueryString = function() {
   const merged = new URLSearchParams(window.location.search);
   Object.keys(saved).forEach((k) => {
    if (saved[k] && !merged.get(k)) merged.set(k, saved[k]);
   });
   const qs = merged.toString();
   return qs ? '?' + qs : '';
  };
 } catch (e) {}
 if('scrollRestoration' in history)history.scrollRestoration='manual';
 function resetPageTop(){const root=document.documentElement;const previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo({top:0,left:0,behavior:'instant'});root.style.scrollBehavior=previous;}
 window.addEventListener('pageshow',()=>{resetPageTop();requestAnimationFrame(resetPageTop);});
 document.addEventListener('DOMContentLoaded',resetPageTop,{once:true});
})();
