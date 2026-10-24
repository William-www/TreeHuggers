(() => {
 'use strict';
 const track=document.getElementById('story-track'),cover=document.getElementById('cover-layer'),panel=document.getElementById('map-panel'),scene=document.querySelector('.scene-landscape'),closer=document.querySelector('.closer-prompt'),question=document.querySelector('.cover-question'),bubbles=[...document.querySelectorAll('.story-bubble')],next=document.getElementById('story-next'),status=document.getElementById('story-status');
 const projectHeading=document.querySelector('.project-heading'),atlantaHeading=document.querySelector('.cover-title'),overviewSource=document.querySelector('.overview-source');
 const pages=['Cover','Overview','Look closer','Canopy map'],hashes=['cover','overview','closer','map'];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x));const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
 let active=-1,scheduled=false,progress=0,navigationFrame=0;
 function stopNavigation(){if(navigationFrame)cancelAnimationFrame(navigationFrame);navigationFrame=0;}
 function goToPage(i){i=Math.max(0,Math.min(3,Number(i)||0));stopNavigation();if(document.activeElement instanceof HTMLElement)document.activeElement.blur();const destination=track.offsetTop+i*window.innerHeight,start=window.scrollY,delta=destination-start;if(reduced.matches||Math.abs(delta)<1||destination<start){window.scrollTo({top:destination,behavior:'instant'});paint();return;}const began=performance.now(),duration=Math.min(850,Math.max(400,Math.abs(delta)/3));function tick(now){const t=clamp((now-began)/duration),ease=(1-Math.cos(Math.PI*t))/2;window.scrollTo({top:start+delta*ease,behavior:'instant'});paint();if(t<1)navigationFrame=requestAnimationFrame(tick);else navigationFrame=0;}navigationFrame=requestAnimationFrame(tick);}
 function paint(){
  scheduled=false;progress=Math.max(0,Math.min(3,-track.getBoundingClientRect().top/window.innerHeight));
  const page=progress>=2.98?3:Math.min(2,Math.round(progress));track.dataset.settledPage=Math.abs(progress-page)<.015?String(page+1):'';const fade=reduced.matches?(page===3?1:0):smooth(2.43,2.98,progress),ready=progress>=2.98;
  cover.style.opacity=String(1-fade);cover.style.pointerEvents=ready?'none':'auto';cover.inert=ready;cover.setAttribute('aria-hidden',String(ready));panel.style.opacity=String(fade);panel.style.transform=reduced.matches?'none':`translateY(${(1-fade)*12}px)`;panel.classList.toggle('is-ready',ready);panel.inert=!ready;panel.setAttribute('aria-hidden',String(!ready));
  const headingSwap=reduced.matches?(page>0?1:0):smooth(.32,.76,progress);projectHeading.style.opacity=String(1-headingSwap);projectHeading.setAttribute('aria-hidden',String(headingSwap>.95));atlantaHeading.style.opacity=String(headingSwap);atlantaHeading.setAttribute('aria-hidden',String(headingSwap<.05));const noteAlpha=reduced.matches?(page===1?1:0):smooth(.7,.96,progress)*(1-smooth(1.25,1.55,progress));overviewSource.style.opacity=String(noteAlpha);overviewSource.setAttribute('aria-hidden',String(noteAlpha<.05));
  const zoom=reduced.matches?1:1+.38*smooth(2.08,2.93,progress);scene.style.transform=`scale(${zoom})`;
  bubbles.forEach((b,i)=>{const alpha=reduced.matches?(page===1?1:0):smooth(.58+i*.04,.84+i*.04,progress)*(1-smooth(1.34,1.72,progress));b.style.opacity=String(alpha);b.style.transform=reduced.matches?'none':`translateY(${(1-alpha)*12}px)`;b.setAttribute('aria-hidden',String(alpha<.05));});
  const closerAlpha=reduced.matches?(page===2?1:0):smooth(1.58,1.91,progress)*(1-smooth(2.27,2.63,progress));closer.style.opacity=String(closerAlpha);closer.style.transform=reduced.matches?'none':`translateY(${(1-closerAlpha)*10}px)`;closer.setAttribute('aria-hidden',String(closerAlpha<.05));question.style.opacity=String(reduced.matches?(page===2?1:0):smooth(1.7,1.96,progress));
  if(page!==active){active=page;document.body.dataset.page=String(page+1);document.querySelectorAll('[data-story-page]').forEach(b=>{if(Number(b.dataset.storyPage)===page)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});status.textContent=`0${page+1} / 04 · ${pages[page]}`;document.getElementById('story-announcement').textContent=`Page ${page+1} of 4: ${pages[page]}`;next.textContent=page===0?'Scroll to begin ↓':page===1?'But what happens when we look closer? ↓':'Explore the canopy map ↓';document.title=`Tree Huggers · ${pages[page]}`;}
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(paint);}}
 document.querySelectorAll('[data-story-page]').forEach(button=>button.addEventListener('click',()=>goToPage(button.dataset.storyPage)));
 document.querySelectorAll('[data-story-home]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();goToPage(0);}));
 next.addEventListener('click',()=>goToPage(Math.min(3,Math.round(progress)+1)));
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('load',schedule);reduced.addEventListener('change',schedule);
 window.TreeHuggersStory={goToPage,getState:()=>({page:active+1,progress,mapInteractive:panel.classList.contains('is-ready')})};
 const initial=hashes.indexOf(location.hash.slice(1));if(initial>0)requestAnimationFrame(()=>goToPage(initial));paint();
})();
