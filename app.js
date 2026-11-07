(()=>{'use strict';
const $=id=>document.getElementById(id),audio=$('audio'),view=$('view'),wheel=$('wheel');
// Wohlfühlorte. Orte ohne "recordings" bleiben gesperrt, bis eigene Aufnahmen freigegeben sind.
const places={
 'Norddeich':{image:'norddeich',line:'Dünen, Meer und Abendruhe',alt:'Abendsonne über Strand und Dünen in Norddeich',
  recordings:{5:{file:'norddeich-05.m4a',length:243},10:{file:'norddeich-10.m4a',length:690},20:{file:'norddeich-20.m4a',length:1387}}},
 'FC-Stadion':{image:'fc-stadion',line:'Ankommen. Heimspiel im Herzen.',alt:'Kölner Stadion in ruhiger Abendstimmung',
  recordings:{5:{file:'stadion-05.m4a',length:283},10:{file:'stadion-10.m4a',length:689},20:{file:'stadion-20.m4a',length:1273}}},
 'New York':{image:'new-york',line:'Draußen die Stadt. Drinnen Ruhe.',alt:'Geborgener Blick aus dem Wohnmobil auf New York im Regen',
  recordings:{5:{file:'new-york-05.m4a',length:440},10:{file:'new-york-10.m4a',length:977},20:{file:'new-york-20.m4a',length:1673}}},
 'Köln am Rhein':{image:'koeln',line:'Goldenes Licht am Rhein',alt:'Kölner Dom und Rhein im goldenen Abendlicht'},
 'Bergisches Land':{image:'bergisches',line:'Grüne Hügel und ein stiller See',alt:'Morgennebel über einem See im Bergischen Land'}
};
const durations=[5,10,20];
const open_=p=>!!places[p]?.recordings;
const rec=(p,m)=>places[p]?.recordings?.[m]||null;
const defaults={place:'Norddeich',minutes:5};
let settings={...defaults},history=[],page='main',selected=0,items=[],stack=[],session=null,rotation=0,drag=null,suppressUntil=0,notice='',lastTick=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>{n=Math.max(0,Math.floor(Number.isFinite(n)?n:0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
const total=()=>Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:(session?rec(session.place,session.minutes)?.length||0:0);
function load(){try{const s=JSON.parse(localStorage.getItem('meine-auszeit-settings')||'null');if(s){if(open_(s.place))settings.place=s.place;if(durations.includes(s.minutes))settings.minutes=s.minutes;else if(s.minutes===15)settings.minutes=10}const h=JSON.parse(localStorage.getItem('meine-auszeit-history')||'[]');history=Array.isArray(h)?h.filter(x=>x&&typeof x.date==='string'&&Number.isFinite(Date.parse(x.date))).slice(0,50):[]}catch{$('storage-note').textContent='Speichern ist hier nicht verfügbar. Die App funktioniert trotzdem.'}}
function save(){try{localStorage.setItem('meine-auszeit-settings',JSON.stringify(settings));localStorage.setItem('meine-auszeit-history',JSON.stringify(history.slice(0,50)))}catch{$('storage-note').textContent='Speichern ist hier nicht verfügbar. Deine Auswahl gilt bis zum Schließen.'}}
const choice=(label,fn,sub='')=>({label,fn,sub});
function open(p){stack.push({page,selected});page=p;selected=p==='place'?Object.keys(places).indexOf(settings.place):p==='duration'?durations.indexOf(settings.minutes):0;notice='';render()}
function back(){const prev=stack.pop();page=prev?.page||'main';selected=prev?.selected||0;notice='';render()}
function set(k,v){settings[k]=v;save();back()}
function pickPlace(x){if(!open_(x)){notice=x+' ist noch gesperrt. Die Aufnahmen dafür folgen.';highlight();return}set('place',x)}
function menuItems(){switch(page){
 case'main':return[choice('Wohlfühlort',()=>open('place'),settings.place),choice('Dauer',()=>open('duration'),settings.minutes+' Minuten'),choice('▶ Jetzt anhören',()=>session?open('listen'):start(),session?'Auszeit fortsetzen':settings.place+' · '+settings.minutes+' Min'),choice('Verlauf',()=>open('history'),history.length+' Auszeiten')];
 case'place':return Object.keys(places).map(x=>choice(open_(x)?x:'🔒 '+x,()=>pickPlace(x),open_(x)?(settings.place===x?'✓ Ausgewählt':''):'Gesperrt · Aufnahmen folgen'));
 case'duration':return durations.map(x=>choice(x+' Minuten',()=>set('minutes',x),settings.minutes===x?'✓ Ausgewählt':''));
 case'listen':return session?[choice('Auszeit beenden',()=>finish(false))]:[choice('Auszeit starten',start,settings.place+' · '+settings.minutes+' Min')];
 case'history':return[choice('Zurück',back)];
 case'feedback':return[choice('♡ Hat geholfen',()=>rate('Hat geholfen')),choice('Heute nicht',()=>rate('Heute nicht')),choice('Ohne Bewertung',()=>rate('Ohne Bewertung'))];
 default:return[]}}
function art(place,cls=''){const p=places[place]||places.Norddeich;return `<figure class="place-art ${cls}"><img src="assets/${p.image}.webp" alt="${esc(p.alt)}"><figcaption>${esc(place)}</figcaption></figure>`}
function previewPlace(){return page==='place'?Object.keys(places)[selected]:settings.place}
function placeNote(){const p=previewPlace();return notice||(open_(p)?places[p].line:'Noch gesperrt · Aufnahmen folgen')}
function durationNote(){const r=rec(settings.place,durations[selected]);return r?`${settings.place}: Aufnahme läuft ca. ${Math.round(r.length/60)} Minuten und wird vollständig abgespielt.`:''}
function render(){const titles={main:'♫ Hauptmenü',place:'Dein Wohlfühlort',duration:'Deine Zeit',listen:session?'♫ '+session.place:'Deine Auszeit',history:'Dein Verlauf',feedback:'Wie war deine Auszeit?'};$('title').textContent=titles[page]||'Meine Auszeit';items=menuItems();selected=Math.max(0,Math.min(selected,items.length-1));let prefix='';
 if(page==='main')prefix=`<aside class="home-preview">${art(settings.place)}<div class="home-caption"><b>Entspannung</b><span>${settings.minutes} Minuten</span><span>${esc(places[settings.place].line)}</span></div></aside>`;
 if(page==='place')prefix=`<div class="place-preview" id="place-preview">${art(previewPlace())}</div><p class="selection-note" id="selection-note">${esc(placeNote())}</p>`;
 if(page==='duration')prefix=`<p class="selection-note" id="selection-note">${esc(durationNote())}</p>`;
 if(page==='listen')prefix=session?`${art(session.place,'player-art')}<div class="now"><div class="sub">Entspannung · ${session.minutes} Minuten</div><input class="progress" id="seek" type="range" min="0" max="${total()||1}" step="0.1" value="${audio.currentTime||0}" aria-label="Wiedergabeposition"><div class="times"><span id="elapsed">${fmt(audio.currentTime)}</span><span id="total">${fmt(total())}</span></div><div class="status" id="status" aria-live="polite"></div></div>`:`${art(settings.place,'player-art')}<div class="selection-summary"><b>Entspannung · ${settings.minutes} Minuten</b><span>${esc(settings.place)}</span></div>`;
 if(page==='history')prefix=history.length?`<div class="history-list">${history.map(x=>`<div class="history"><b>${esc(x.place||'Norddeich')}${x.minutes?' · '+x.minutes+' Min':''}</b><br><small>${esc(new Date(x.date).toLocaleString('de-DE'))} · ${fmt(Number(x.seconds))} gehört<br>${x.completed?'Bis zum Ende gehört':'Vorzeitig beendet'} · ${esc(x.rating||'Ohne Bewertung')}</small></div>`).join('')}</div>`:'<p class="note">Noch keine Auszeiten gespeichert.<br>Hier erscheinen deine beendeten Auszeiten mit Datum und Bewertung.</p>';
 if(page==='feedback')prefix='<p class="note">Deine Auszeit wurde im Verlauf gespeichert.</p>';
 const buttons=items.map((it,i)=>`<button class="item ${i===selected?'active':''}" data-index="${i}" ${i===selected?'aria-current="true"':''}><span>${esc(it.label)}${it.sub?`<small>${esc(it.sub)}</small>`:''}</span><span class="chev" aria-hidden="true">›</span></button>`).join('');
 view.className=page==='main'?'home-view':'page-view';view.innerHTML=page==='main'?`<div class="home-menu choices">${buttons}</div>${prefix}`:prefix+`<div class="choices">${buttons}</div>`;
 view.querySelectorAll('[data-index]').forEach(el=>{el.addEventListener('click',()=>{selected=Number(el.dataset.index);items[selected]?.fn()});el.addEventListener('focus',()=>{selected=Number(el.dataset.index);highlight()})});
 $('seek')?.addEventListener('input',e=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(e.target.value);update()});highlight();update();
 }
function highlight(){view.querySelectorAll('[data-index]').forEach((e,i)=>{e.classList.toggle('active',i===selected);if(i===selected)e.setAttribute('aria-current','true');else e.removeAttribute('aria-current')});if(page==='place'&&$('place-preview')){$('place-preview').innerHTML=art(previewPlace());$('selection-note').textContent=placeNote()}if(page==='duration'&&$('selection-note'))$('selection-note').textContent=durationNote();view.querySelector('.active')?.scrollIntoView({block:'nearest'})}
function move(d){if(page==='listen'&&session){if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,Math.max(0,audio.currentTime+d*10));update();return}if(!items.length)return;notice='';selected=(selected+d+items.length)%items.length;highlight()}
function activate(){if(page==='listen'&&session){toggle();return}items[selected]?.fn()}
function update(){const playing=!audio.paused&&!audio.ended;$('indicator').textContent=playing?'▶':session?'Ⅱ':'☾';$('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Wiedergabe pausieren':session?'Wiedergabe fortsetzen':'Auszeit starten');$('play').setAttribute('aria-pressed',String(playing));if($('status'))$('status').textContent=notice||(playing?'Du darfst jetzt loslassen.':audio.readyState<3&&session&&!audio.currentTime?'Aufnahme wird geladen …':'Pausiert · ▶ zum Fortsetzen');if($('elapsed'))$('elapsed').textContent=fmt(audio.currentTime);if($('total'))$('total').textContent=fmt(total());if($('seek')){$('seek').max=total()||1;$('seek').value=audio.currentTime||0}}
function playAudio(){notice='';try{const result=audio.play();result?.catch(()=>{notice='Bitte ▶ erneut drücken, um die Aufnahme zu starten.';update()})}catch{notice='Die Aufnahme konnte nicht gestartet werden.';update()}}
function mediaSession(){try{if('mediaSession'in navigator&&window.MediaMetadata){navigator.mediaSession.metadata=new MediaMetadata({title:session.place+' · '+session.minutes+' Minuten',artist:'Meine Auszeit',artwork:[{src:'assets/'+places[session.place].image+'.webp',type:'image/webp'}]})}}catch{}}
function start(){if(session){toggle();return}const r=rec(settings.place,settings.minutes);if(!r){notice='Für diesen Ort gibt es noch keine Aufnahme.';render();return}
 session={date:new Date().toISOString(),place:settings.place,minutes:settings.minutes,file:r.file,seconds:0,completed:false,rating:'Ohne Bewertung'};
 audio.src='audio/'+r.file;audio.load();notice='';if(page!=='listen'){stack.push({page,selected});page='listen'}selected=0;render();mediaSession();playAudio()}
function toggle(){if(!session){start();return}if(audio.paused)playAudio();else audio.pause();if(page!=='listen')open('listen')}
function finish(completed){if(!session)return;audio.pause();session.completed=completed;history.unshift({date:session.date,place:session.place,minutes:session.minutes,seconds:Math.round(session.seconds),completed,rating:session.rating});history=history.slice(0,50);session=null;save();page='feedback';selected=0;stack=[{page:'main',selected:3}];render()}
function rate(rating){if(history[0])history[0].rating=rating;save();page='main';stack=[];selected=3;render()}
for(const[id,fn]of[['menu',back],['prev',()=>move(-1)],['next',()=>move(1)],['select',activate],['play',toggle]])$(id).addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();return}fn()});
audio.addEventListener('playing',()=>{lastTick=performance.now();update()});setInterval(()=>{if(session&&lastTick!==null&&!audio.paused){const now=performance.now();session.seconds+=(now-lastTick)/1000;lastTick=now}},250);audio.addEventListener('pause',()=>{if(session&&lastTick!==null)session.seconds+=(performance.now()-lastTick)/1000;lastTick=null;update()});for(const event of['timeupdate','loadedmetadata','canplay','waiting'])audio.addEventListener(event,update);
// Nur das echte Ende der Aufnahme beendet die Auszeit – kein Timer.
audio.addEventListener('ended',()=>finish(true));
audio.addEventListener('error',()=>{if(!session)return;notice='Die Aufnahme konnte nicht geladen werden. Bitte Verbindung prüfen und ▶ erneut drücken.';update()});document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
function angle(e){const r=wheel.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI}
wheel.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const r=wheel.getBoundingClientRect();if(Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)<r.width*.24)return;drag={id:e.pointerId,last:angle(e),sum:0,total:0}});
document.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;let delta=angle(e)-drag.last;if(delta>180)delta-=360;if(delta< -180)delta+=360;drag.last=angle(e);drag.sum+=delta;drag.total+=Math.abs(delta);if(drag.total>10){suppressUntil=performance.now()+400;try{wheel.setPointerCapture(e.pointerId)}catch{}}rotation+=delta;wheel.style.setProperty('--rotation',rotation+'deg');while(Math.abs(drag.sum)>=22){const step=Math.sign(drag.sum);move(step);drag.sum-=step*22}});
function endDrag(e){if(drag&&e.pointerId===drag.id){if(drag.total>10)suppressUntil=performance.now()+350;drag=null}}document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);wheel.addEventListener('wheel',e=>{e.preventDefault();move(e.deltaY>0?1:-1)},{passive:false});
document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Escape',' '].includes(e.key))e.preventDefault();if(['ArrowDown','ArrowRight'].includes(e.key))move(1);else if(['ArrowUp','ArrowLeft'].includes(e.key))move(-1);else if(e.key==='Escape')back();else if(e.key===' ')toggle();else if(e.key==='Enter'&&e.target===document.body)activate()});
load();render();
})();
