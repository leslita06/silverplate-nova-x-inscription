(function(){
'use strict';
var EV = Date.UTC(2027, 1, 11, 19, 0, 0);  // 19 h à Abidjan (GMT)
var CAP = 300, LS = 'novax-inscrits', LP = 'novax-presents';
function $(s){return document.querySelector(s)}
function p2(n){return String(n).padStart(2,'0')}
function load(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* compte à rebours */
function tick(){var r=Math.max(0,EV-Date.now());
 $('#cd-d').textContent=Math.floor(r/864e5);$('#cd-h').textContent=p2(Math.floor(r/36e5)%24);
 $('#cd-m').textContent=p2(Math.floor(r/6e4)%60);$('#cd-s').textContent=p2(Math.floor(r/1e3)%60);}
tick();setInterval(tick,1000);

/* jauge */
var BASE=237;
function jauge(){var n=Math.min(CAP,BASE+load(LS).length);$('#jn').textContent=n;$('#jr').textContent=(CAP-n)+' places restantes';$('#jf').style.width=(n/CAP*100)+'%';}
setTimeout(jauge,300);

/* routes */
function route(){var h=location.hash,acc=h==='#/accueil',etait=$('#public').hidden;
 $('#public').hidden=acc;$('#accueil').hidden=!acc;
 document.querySelector('.acc-link').classList.toggle('on',acc);
 if(acc){window.scrollTo(0,0);majAccueil();return}
 if(h==='#/'){window.scrollTo(0,0);return}
 if(etait&&h.length>1){var t=document.querySelector(h);if(t)t.scrollIntoView()}
}
window.addEventListener('hashchange',route);
route();

/* inscription */
var f=$('#f');
function ini(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[-']/g,' ').split(/\s+/).filter(Boolean).map(function(w){return w.charAt(0).toUpperCase()}).join('').replace(/[^A-Z]/g,'').slice(0,3)||'X'}
function code(p,n){return 'NOVAX-2027-'+ini(p+' '+n)+'-'+Math.floor(100000+Math.random()*900000)}
var dernier=null;
f.addEventListener('input',function(e){var i=e.target;var ok=i.type==='checkbox'?i.checked:(i.value.trim()&&i.checkValidity());if(ok){(i.type==='checkbox'?i.parentNode:i).classList.remove('bad');if(!f.querySelector('.bad'))$('#err').textContent=''}});
f.addEventListener('submit',function(e){e.preventDefault();
 var bad=[];
 f.querySelectorAll('input[required]').forEach(function(i){var ko=i.type==='checkbox'?!i.checked:(!i.value.trim()||!i.checkValidity());(i.type==='checkbox'?i.parentNode:i).classList.toggle('bad',ko);if(ko)bad.push(i)});
 if(bad.length){$('#err').textContent=bad.length===1&&bad[0].type==='checkbox'?'Merci de cocher l\'accord sur vos coordonnées.':'Merci de compléter les champs en rouge.';bad[0].focus();return;}
 $('#err').textContent='';
 var d={civ:f.civ.value,prenom:f.prenom.value.trim(),nom:f.nom.value.trim(),ent:f.ent.value.trim(),fon:f.fon.value.trim(),tel:f.tel.value.trim(),mail:f.mail.value.trim(),pro:f.pro.value,acc:+f.acc.value,reg:f.reg.value,quand:new Date().toISOString()};
 d.code=code(d.prenom,d.nom);
 var l=load(LS);l.push(d);save(LS,l);dernier=d;jauge();
 var proLib={Influenceur:'Créateur de contenu'}[d.pro]||d.pro;
 $('#okt').textContent='Merci '+d.prenom+' !';
 $('#okp').textContent='Votre place est réservée. Gardez ce billet : il vous sera demandé à l\'accueil.';
 $('#code').textContent=d.code;$('#tk-n').textContent=d.civ+' '+d.prenom+' '+d.nom;$('#tk-p').textContent=proLib+' · '+d.ent;
 var a=$('#tk-acc');a.hidden=!d.acc;a.textContent='Accompagnant prévu : son QR code lui sera remis par l\'équipe d\'accueil.';
 var q=$('#qr');q.innerHTML='';
 if(window.QRCode){new QRCode(q,{text:d.code,width:380,height:380,colorDark:'#262C51',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});}
 else q.textContent='QR code indisponible hors connexion';
 $('#msg').textContent='Bonjour '+d.civ+' '+d.nom+',\n\nVotre inscription à la soirée de lancement du NOVA X est confirmée : jeudi 11 février 2027, 19 h, Sofitel Abidjan Hôtel Ivoire (boulevard Hassan II, Cocody).\n\nVotre code d\'entrée : '+d.code+'. Présentez le QR code ci-joint à l\'accueil.\n'+(d.reg!=='Aucun'?'Régime noté : '+d.reg.toLowerCase()+'.\n':'')+'\nNous vous enverrons un rappel la veille.\n\nL\'équipe d\'accueil NOVA X\nSN Silverplate Services, pour NOVA Électronique';
 f.hidden=true;$('#ok').hidden=false;
 var t=$('#ok');window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});
});
$('#again').addEventListener('click',function(){f.reset();f.hidden=false;$('#ok').hidden=true;f.querySelector('input[name=prenom]').focus()});
$('#print').addEventListener('click',function(){window.print()});
$('#ics').addEventListener('click',function(){
 var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SN Silverplate Services//NOVA X//FR','BEGIN:VEVENT','UID:'+(dernier?dernier.code:'novax')+'@novax-lancement','DTSTAMP:20270101T000000Z','DTSTART:20270211T190000Z','DTEND:20270211T230000Z','SUMMARY:NOVA X · Soirée de lancement','LOCATION:Sofitel Abidjan Hôtel Ivoire\\, boulevard Hassan II\\, Cocody\\, Abidjan','DESCRIPTION:Code d\'entrée : '+(dernier?dernier.code:'')+'. Organisé par SN Silverplate Services.','BEGIN:VALARM','TRIGGER:-PT3H','ACTION:DISPLAY','DESCRIPTION:NOVA X ce soir','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
 var b=new Blob([ics],{type:'text/calendar'}),u=URL.createObjectURL(b),x=document.createElement('a');x.href=u;x.download='nova-x-11-fevrier-2027.ics';document.body.appendChild(x);x.click();x.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000);
});

/* accueil des invités */
var LISTE=null;
function liste(cb){if(LISTE)return cb(LISTE);
 fetch('invites-exemple.json?v=1').then(function(r){return r.json()}).then(function(j){LISTE=j;cb(j)}).catch(function(){LISTE=[];cb(LISTE)})}
function tous(){var loc=load(LS).map(function(d){return {c:d.code,n:d.civ+' '+d.prenom+' '+d.nom,s:d.ent,p:d.pro,t:null,a:d.acc,loc:1}});return (LISTE||[]).concat(loc)}
function hh(){var d=new Date();return p2(d.getHours())+' h '+p2(d.getMinutes())}
function majAccueil(){liste(function(){
 var pr=load(LP),T=tous(),n=pr.length,c=T.length;
 $('#k-p').textContent=n;$('#k-c').textContent=c;$('#k-t').textContent=(c?Math.round(n/c*100):0)+' %';$('#k-f').style.width=(c?n/c*100:0)+'%';
 var ol=$('#lastl');ol.innerHTML='';
 if(!n){ol.innerHTML='<li class="empty">Aucune entrée pour l\'instant.</li>';return}
 pr.slice(-6).reverse().forEach(function(x){var g=T.filter(function(t){return t.c===x.c})[0];var li=document.createElement('li');li.innerHTML='<b></b><span></span>';li.querySelector('b').textContent=g?g.n:x.c;li.querySelector('span').textContent=x.h;ol.appendChild(li)});
})}
function res(cls,titre,lignes){var r=$('#res');r.className='res '+cls;r.innerHTML='';var b=document.createElement('b');b.textContent=titre;r.appendChild(b);
 lignes.forEach(function(l){var s=document.createElement('span');if(l.cls)s.className=l.cls;s.textContent=l.t;r.appendChild(s)})}
function controler(v){liste(function(){
 v=v.trim().toUpperCase();if(!v){res('idle','En attente d\'un code',[{t:'Le résultat du contrôle s\'affiche ici.'}]);return}
 var g=tous().filter(function(t){return t.c===v})[0],pr=load(LP);
 if(!g){res('ko','Billet inconnu',[{t:v},{t:'Aucun invité confirmé ne porte ce code. Vérifier le nom sur la liste papier, puis appeler le chef d\'accueil.'}]);return}
 var deja=pr.filter(function(x){return x.c===v})[0];
 if(deja){res('warn','Déjà entré',[{t:g.n,cls:'who'},{t:'Entrée enregistrée à '+deja.h+'. Ne pas laisser entrer une seconde fois sans le chef d\'accueil.'}]);return}
 pr.push({c:v,h:hh()});save(LP,pr);
 var lab={Influenceur:'Créateur de contenu'}[g.p]||g.p;
 var L=[{t:g.n,cls:'who'},{t:lab+' · '+g.s}];
 if(g.a)L.push({t:'Avec un accompagnant prévu'});
 L.push({t:g.t?'Table '+g.t:'Table à attribuer à l\'accueil',cls:'tb'});
 res('ok','Bienvenue',L);majAccueil();
})}
$('#sf').addEventListener('submit',function(e){e.preventDefault();controler($('#sc').value);$('#sc').select()});
$('#rnd').addEventListener('click',function(){liste(function(){var pr=load(LP).map(function(x){return x.c}),T=tous().filter(function(t){return pr.indexOf(t.c)<0});
 if(!T.length)return;var g=T[Math.floor(Math.random()*T.length)];$('#sc').value=g.c;controler(g.c)})});
$('#reset').addEventListener('click',function(){save(LP,[]);majAccueil();res('idle','En attente d\'un code',[{t:'Le compteur est remis à zéro.'}])});
})();
