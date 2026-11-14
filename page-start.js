(()=>{
 if('scrollRestoration' in history)history.scrollRestoration='manual';
 function resetPageTop(){const root=document.documentElement;const previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo({top:0,left:0,behavior:'instant'});root.style.scrollBehavior=previous;}
 window.addEventListener('pageshow',()=>{resetPageTop();requestAnimationFrame(resetPageTop);});
 document.addEventListener('DOMContentLoaded',resetPageTop,{once:true});
})();