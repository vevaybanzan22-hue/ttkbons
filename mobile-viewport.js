(()=>{
 const root=document.documentElement,dialog=document.getElementById('completionDialog'),layout=dialog?.querySelector('.completion-layout');
 const probe=document.createElement('div');probe.setAttribute('aria-hidden','true');Object.assign(probe.style,{position:'fixed',visibility:'hidden',pointerEvents:'none',paddingTop:'env(safe-area-inset-top,0px)',paddingBottom:'env(safe-area-inset-bottom,0px)'});document.body.append(probe);
 let frame=0;
 function fit(){frame=0;const viewport=window.visualViewport,height=viewport?.height||innerHeight,offset=viewport?.offsetTop||0;root.style.setProperty('--rewards-visible-height',height+'px');if(!dialog?.open)return;if(document.getElementById('rewards-fullscreen-stage')){Object.assign(dialog.style,{maxHeight:height+'px',height:height+'px',margin:'0',left:'0',right:'0',top:offset+'px',bottom:'auto'});return;}const safe=getComputedStyle(probe),topSafe=parseFloat(safe.paddingTop)||0,bottomSafe=parseFloat(safe.paddingBottom)||0,available=Math.max(1,height-topSafe-bottomSafe-24);dialog.style.maxHeight=available+'px';dialog.style.margin='0 auto';dialog.style.left='0';dialog.style.right='0';const actualHeight=dialog.getBoundingClientRect().height,top=offset+topSafe+12+Math.max(0,(available-actualHeight)/2);dialog.style.top=top+'px';}
 function schedule(){if(!frame)frame=requestAnimationFrame(fit);}
 window.fitRewardsDialog=schedule;
 window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
 if(dialog){new MutationObserver(schedule).observe(dialog,{attributes:true,attributeFilter:['open','class']});if(layout)new ResizeObserver(schedule).observe(layout);}
 schedule();
})();
