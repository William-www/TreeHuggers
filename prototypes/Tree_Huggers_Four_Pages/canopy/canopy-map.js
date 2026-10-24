/* Atlanta canopy chapter. D3 7.9.0; no requests, build step or external service. */
(() => {
 'use strict';
 const NS='http://www.w3.org/2000/svg';
 const COLORS=['#f2edbd','#c8dca1','#91b980','#5e9260','#345c3c'];
 const LABELS=['0–17%','17–35%','35–52%','52–69%','69–100%'];
 const THRESHOLDS=[17,35,52,69];
 const number=new Intl.NumberFormat('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
 const bin=v=>THRESHOLDS.filter(t=>v>=t).length;
 const fmt=v=>number.format(v);
 function normalizeGeometry(g){
  const polygon=coords=>{const p={type:'Polygon',coordinates:coords};return d3.geoArea(p)>2*Math.PI?coords.map(r=>r.slice().reverse()):coords;};
  if(g.type==='Polygon')return {...g,coordinates:polygon(g.coordinates)};
  if(g.type==='MultiPolygon')return {...g,coordinates:g.coordinates.map(polygon)};
  throw new Error('Expected Polygon or MultiPolygon geometry.');
 }
 function mount(root,data){
  if(!root||!data||!window.d3)throw new Error('The chapter, GeoJSON data, and D3 are required.');
  const q=s=>root.querySelector(s),svg=q('#canopy-map');
  const rows=data.grid.features.map(f=>{const p=f.properties,v=p.canopy_pct_final;return {feature:{...f,geometry:normalizeGeometry(f.geometry)},id:String(p.id),row:p.row_index,col:p.col_index,value:typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100?v:null,flag:v===0&&p.canopymean===null};});
  const byId=new Map(rows.map(f=>[f.id,f]));if(byId.size!==rows.length)throw new Error('Grid IDs must be unique.');
  const boundary={...data.boundary,features:data.boundary.features.map(f=>({...f,geometry:normalizeGeometry(f.geometry)}))};
  const projection=d3.geoMercator().fitExtent([[25,24],[625,645]],boundary),path=d3.geoPath(projection);
  let selected={a:null,b:null},target='a',filter=null,hover=null;
  let destroyed=false;const cleanups=[];
  function on(node,event,handler){node.addEventListener(event,handler);cleanups.push(()=>node.removeEventListener(event,handler));}
  function shape(tag,attrs,parent=svg){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;}
  svg.setAttribute('viewBox','0 0 650 685');svg.replaceChildren();
  const title=shape('title',{});title.textContent='Atlanta tree canopy coverage, 433 clipped grid cells';
  const desc=shape('desc',{});desc.textContent='Light to dark green represents increasing reported tree canopy coverage. Select two grid cells for a percentage-point comparison. Hatched zero values require verification.';
  const defs=shape('defs',{}),pattern=shape('pattern',{id:'canopy-zero-hatch',patternUnits:'userSpaceOnUse',width:5,height:5},defs);shape('path',{d:'M-1,1 L1,-1 M0,5 L5,0 M4,6 L6,4',stroke:'#6d755c','stroke-width':.7,opacity:.6},pattern);
  const basemap=data.basemap||window.ATLANTA_BASEMAP;
  const basemapLayer=shape('g',{class:'context-basemap','aria-hidden':'true','pointer-events':'none'});
  let basemapVisible=Boolean(basemap?.image);
  if(basemapVisible)shape('image',{href:basemap.image,x:0,y:0,width:650,height:685,preserveAspectRatio:'none'},basemapLayer);
  const basemapButton=q('#toggle-basemap'),basemapCredit=q('#basemap-credit');
  function renderBasemap(){basemapLayer.style.display=basemapVisible?'':'none';root.classList.toggle('basemap-visible',basemapVisible);if(basemapButton){basemapButton.textContent=basemap?.image?(basemapVisible?'Basemap on':'Basemap off'):'Basemap unavailable';basemapButton.setAttribute('aria-pressed',String(basemapVisible));basemapButton.disabled=!basemap?.image;}if(basemapCredit)basemapCredit.hidden=!basemapVisible;}
  if(basemapButton)on(basemapButton,'click',()=>{basemapVisible=!basemapVisible;renderBasemap();q('#map-announcement').textContent=basemapVisible?'Faint geographic basemap shown.':'Basemap hidden. Canopy values and colors are unchanged.';});
  renderBasemap();
  const opacityInput=q('#canopy-opacity'),opacityValue=q('#canopy-opacity-value');
  function updateOpacity(){const percent=Number(opacityInput?.value||60);root.style.setProperty('--canopy-alpha',percent/100);if(opacityValue)opacityValue.textContent=percent+'%';if(opacityInput)opacityInput.setAttribute('aria-valuetext',percent+' percent layer opacity');}
  if(opacityInput)on(opacityInput,'input',updateOpacity);updateOpacity();
  const backing=shape('g',{transform:'translate(3,5)'});boundary.features.forEach(f=>shape('path',{d:path(f),class:'boundary-backing'},backing));
  boundary.features.forEach(f=>shape('path',{d:path(f),class:'city-outline'}));
  const gridGroup=shape('g',{}),hatchGroup=shape('g',{'aria-hidden':true}),selectionGroup=shape('g',{'aria-hidden':true}),hoverGroup=shape('g',{'aria-hidden':true});
  const nodes=new Map();
  rows.forEach((r,i)=>{const p=shape('path',{d:path(r.feature),fill:r.value===null?'#c6c5b8':COLORS[bin(r.value)],class:'grid-cell',role:'button',tabindex:i===0?0:-1,'aria-label':`Grid ${r.id}, ${r.value===null?'no data':fmt(r.value)+' percent canopy'}${r.flag?', zero value needs verification':''}`,'aria-pressed':'false','data-id':r.id},gridGroup);nodes.set(r.id,p);
   if(r.flag)shape('path',{d:path(r.feature),fill:'url(#canopy-zero-hatch)',class:'zero-hatch','data-id':r.id},hatchGroup);
   on(p,'pointerenter',()=>showDetail(r));on(p,'focus',()=>showDetail(r));on(p,'click',()=>pick(r));
   on(p,'keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(r);return;}const axes={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]};const dir=axes[e.key];if(!dir)return;e.preventDefault();const candidates=rows.filter(x=>dir[0]?(x.row-r.row)*dir[0]>0:(x.col-r.col)*dir[1]>0);candidates.sort((a,b)=>{const dist=x=>dir[0]?Math.abs(x.row-r.row)+Math.abs(x.col-r.col)*2:Math.abs(x.col-r.col)+Math.abs(x.row-r.row)*2;return dist(a)-dist(b);});if(candidates[0]){nodes.forEach(n=>n.setAttribute('tabindex',-1));const next=nodes.get(candidates[0].id);next.setAttribute('tabindex',0);next.focus();}});
  });
  // Calibrate a 5 km ground-distance scale at the bar's latitude, using the
  // inverse of the same projection used for the map and USGS image extent.
  const scaleX=35,scaleY=670,scaleOrigin=projection.invert([scaleX,scaleY]);
  function pixelsForMeters(meters){let lo=0,hi=400;for(let i=0;i<55;i++){const mid=(lo+hi)/2,point=projection.invert([scaleX+mid,scaleY]);if(d3.geoDistance(scaleOrigin,point)*6371008.8<meters)lo=mid;else hi=mid;}return (lo+hi)/2;}
  const scaleHalf=pixelsForMeters(2500),scaleFull=pixelsForMeters(5000);
  const scaleGroup=shape('g',{class:'ground-scale','pointer-events':'none',role:'img','aria-label':`0 to 5 kilometre scale, calibrated at latitude ${scaleOrigin[1].toFixed(2)} north`,'data-meters':'5000','data-width':scaleFull});
  const scaleBg=shape('rect',{x:scaleX-8,y:640,width:scaleFull+16,height:42,rx:2,fill:'#f3efdc','fill-opacity':.92},scaleGroup);
  shape('rect',{x:scaleX,y:scaleY,width:scaleHalf,height:6,fill:'#203e2c'},scaleGroup);
  shape('rect',{x:scaleX+scaleHalf,y:scaleY,width:scaleFull-scaleHalf,height:6,fill:'#fbf7e9',stroke:'#203e2c','stroke-width':1},scaleGroup);
  for(const [offset,label,anchor] of [[0,'0','start'],[scaleFull,'5 km','end']])shape('text',{x:scaleX+offset,y:scaleY-7,fill:'#203e2c','font-family':'Nunito, sans-serif','text-anchor':anchor},scaleGroup).textContent=label;
  function sizeMapLabels(){const box=svg.getBoundingClientRect(),scale=Math.min(box.width/650,box.height/685)||1,fontSize=Math.max(13,11/scale);scaleGroup.querySelectorAll('text').forEach(t=>t.setAttribute('font-size',fontSize));scaleBg.setAttribute('y',scaleY-fontSize-11);scaleBg.setAttribute('height',fontSize+24);}
  const mapObserver=new ResizeObserver(sizeMapLabels);mapObserver.observe(svg);cleanups.push(()=>mapObserver.disconnect());sizeMapLabels();
  function showDetail(r){if(destroyed)return;hover=r.id;q('#detail-id').textContent=`Grid ${r.id}`;q('#detail-value').textContent=r.value===null?'No data':fmt(r.value);q('#detail-unit').hidden=r.value===null;q('#detail-location').textContent=`1 km grid · source row ${r.row}, column ${r.col}`;q('#detail-status').textContent=r.flag?'Reported 0%; canopymean is empty. Zero canopy or unavailable data is unconfirmed.':'Reported final coverage; calculation basis requires confirmation (see data notes).';q('#grid-picker').value=r.id;hoverGroup.replaceChildren();shape('path',{d:path(r.feature),class:'hover-outline'},hoverGroup);}
  function pick(r){if(!target){selected={a:null,b:null};target='a';}const other=target==='a'?'b':'a';if(selected[other]===r.id){q('#selection-instruction').textContent='Choose a different grid for a two-location comparison.';q('#map-announcement').textContent='This grid is already selected in the other slot.';return;}selected[target]=r.id;showDetail(r);target=selected.a===null?'a':selected.b===null?'b':null;render();q('#map-announcement').textContent=`Grid ${r.id} selected. ${q('#comparison-result').textContent}`;}
  function render(){
   selectionGroup.replaceChildren();
   nodes.forEach((p,id)=>{const r=byId.get(id),isSelected=selected.a===id||selected.b===id;p.classList.toggle('is-dimmed',filter!==null&&(r.value===null||bin(r.value)!==filter)&&!isSelected);p.setAttribute('aria-pressed',String(isSelected));});
   hatchGroup.querySelectorAll('path').forEach(p=>{const r=byId.get(p.dataset.id);p.style.opacity=(filter!==null&&bin(r.value)!==filter) ? .18 : 1;});
   for(const slot of ['a','b']){const r=byId.get(selected[slot]);q('#slot-'+slot).setAttribute('aria-pressed',String(target===slot));q('#'+slot+'-id').textContent=r?`Grid ${r.id}`:'Pick a piece';q('#'+slot+'-value').textContent=r?(r.value===null?'No data':fmt(r.value)+'%'+(r.flag?'*':'')):'—';q('#'+slot+'-action').textContent=target===slot?'Next selection':r?'Replace '+slot.toUpperCase():'Select '+slot.toUpperCase();if(r){shape('path',{d:path(r.feature),class:'selection-outline '+slot},selectionGroup);const c=path.centroid(r.feature);if(c.every(Number.isFinite)){const g=shape('g',{class:'selection-tag '+slot,transform:`translate(${c[0]},${c[1]})`},selectionGroup);shape('circle',{r:11},g);shape('text',{},g).textContent=slot.toUpperCase();}}}
   const a=byId.get(selected.a),b=byId.get(selected.b),comparable=a&&b&&a.value!==null&&b.value!==null;q('#comparison-bars').hidden=!comparable;
   q('#selection-instruction').textContent=target?`Select a grid for ${target.toUpperCase()}.`:'Select another grid to start a new A/B comparison.';
   if(comparable){for(const [slot,r] of [['a',a],['b',b]]){q('#bar-'+slot).style.width=r.value+'%';q('#bar-value-'+slot).textContent=fmt(r.value)+'%';}const delta=Math.abs(a.value-b.value);q('#comparison-result').replaceChildren();const strong=document.createElement('strong');strong.textContent=fmt(delta)+' percentage points';q('#comparison-result').append(strong,document.createTextNode(' apart in reported canopy coverage.'+(a.flag||b.flag?' * Includes an unverified zero value.':'')));}else q('#comparison-result').textContent='Two grid cells can reveal different amounts of green.';
   q('#clear-filter').hidden=filter===null;q('#map-legend').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===filter)));
  }
  q('#map-legend').replaceChildren();LABELS.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.className='legend-button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label',`Highlight ${label} canopy. Lower bound inclusive; upper bound exclusive except 100 percent.`);const swatch=document.createElement('span');swatch.className='legend-swatch';swatch.style.background=COLORS[i];b.append(swatch,document.createTextNode(label));q('#map-legend').append(b);on(b,'click',()=>{filter=filter===i?null:i;render();q('#map-announcement').textContent=filter===null?'All canopy ranges shown.':`Highlighted ${LABELS[i]} canopy.`;});});
  const picker=q('#grid-picker');rows.slice().sort((a,b)=>Number(a.id)-Number(b.id)).forEach(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=`Grid ${r.id} · ${r.value===null?'no data':fmt(r.value)+'%'}${r.flag?' · verify zero':''}`;picker.append(o);});
  on(picker,'change',()=>{const r=byId.get(picker.value);if(r)pick(r);});
  on(q('#slot-a'),'click',()=>{target='a';render();});on(q('#slot-b'),'click',()=>{target='b';render();});
  const clear=()=>{selected={a:null,b:null};target='a';render();q('#map-announcement').textContent='Both selections cleared.';};on(q('#reset-selection'),'click',clear);on(q('#clear-filter'),'click',()=>{filter=null;render();});render();
  return {getState:()=>({selected:{...selected},target,filter,hover,basemapVisible,featureCount:rows.length}),clearSelection:clear,destroy:()=>{destroyed=true;cleanups.forEach(f=>f());svg.replaceChildren();}};
 }
 window.CanopyAtlas={mount};
 try{window.canopyAtlas=mount(document.getElementById('canopy-chapter'),window.ATLANTA_CANOPY);}catch(error){const el=document.getElementById('map-announcement');if(el){el.className='';el.setAttribute('role','alert');el.textContent='The map could not load. Check that data.js, D3, and the chapter files are in the same folder.';}console.error(error);}
})();
