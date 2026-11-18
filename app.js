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
var BASE=260;
function actifs(){return load(LS).filter(function(d){return !d.annule&&!d.attente})}
function jauge(){var n=Math.min(CAP,BASE+actifs().length);$('#jn').textContent=n;$('#jr').textContent=(CAP-n)?(CAP-n)+' places restantes':'Complet : liste d\'attente';$('#jf').style.width=(n/CAP*100)+'%';}
setTimeout(jauge,300);

/* routes */
function route(){var h=location.hash,acc=h==='#/accueil',etait=$('#public').hidden;
 $('#public').hidden=acc;$('#accueil').hidden=!acc;document.body.classList.toggle('acc',acc);
 document.querySelector('.acc-link').classList.toggle('on',acc);
 if(acc){window.scrollTo(0,0);majAccueil();return}
 if(h==='#/'){window.scrollTo(0,0);return}
 if(etait&&h.length>1){var t=document.querySelector(h);if(t)t.scrollIntoView()}
}
window.addEventListener('hashchange',function(){$('#mnav').hidden=true;$('#burger').setAttribute('aria-expanded','false');route()});
$('#burger').addEventListener('click',function(){var m=$('#mnav');m.hidden=!m.hidden;this.setAttribute('aria-expanded',String(!m.hidden))});
document.querySelectorAll('#mnav a').forEach(function(a){a.addEventListener('click',function(){$('#mnav').hidden=true})});
route();

/* effets : barre de navigation, apparition au défilement */
var nav=$('#nav');function navs(){nav.classList.toggle('solid',window.scrollY>40)}
window.addEventListener('scroll',navs,{passive:true});navs();
(function(){var els=document.querySelectorAll('.rv');
 if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
 var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
 els.forEach(function(e){io.observe(e)});})();

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
 var l=load(LS),deja=l.filter(function(x){return !x.annule&&x.mail.toLowerCase()===d.mail.toLowerCase()})[0];
 if(deja){afficher(deja,'Vous êtes déjà inscrit(e) avec cet e-mail : voici votre billet.');return}
 d.attente=(BASE+actifs().length)>=CAP;
 d.code=d.attente?'':code(d.prenom,d.nom);
 l.push(d);save(LS,l);jauge();
 afficher(d);
});
function afficher(d,info){
 dernier=d;
 var proLib={Influenceur:'Créateur de contenu'}[d.pro]||d.pro;
 $('#ok').classList.toggle('cancelled',!!d.annule);
 $('#okt').textContent=d.annule?'Inscription annulée':(d.attente?'Vous êtes sur liste d\'attente':'Merci '+d.prenom+' !');
 $('#okp').textContent=info||(d.annule?'Votre place a été libérée. Merci de nous avoir prévenus.':(d.attente?'Les 300 places sont prises. Nous vous écrivons dès qu\'une place se libère, avec votre QR code.':'Votre place est réservée. Gardez ce billet : il vous sera demandé à l\'accueil.'));
 $('#ticket').hidden=!!(d.attente||d.annule);
 document.querySelectorAll('.ok-btns > *').forEach(function(x){x.hidden=x.id!=='again'&&!!(d.attente||d.annule)});
 $('#cancel').parentNode.hidden=!!d.annule;
 $('#cancel').textContent=d.attente?'Retirer ma demande':'Je ne peux plus venir';
 $('#code').textContent=d.code;$('#tk-n').textContent=d.civ+' '+d.prenom+' '+d.nom;$('#tk-p').textContent=proLib+' · '+d.ent;
 var a=$('#tk-acc');a.hidden=!d.acc;a.textContent='Accompagnant prévu : son QR code lui sera remis par l\'équipe d\'accueil.';
 var q=$('#qr');q.innerHTML='';
 if(d.code&&window.QRCode){new QRCode(q,{text:d.code,width:380,height:380,colorDark:'#262C51',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});}
 else if(d.code) q.textContent='QR code indisponible hors connexion : présentez le code ci-dessous.';
 var txt='Bonjour '+d.civ+' '+d.nom+',\n\n'+(d.attente?'Votre demande pour la soirée de lancement du NOVA X est sur liste d\'attente. Nous vous écrivons dès qu\'une place se libère.':'Votre inscription à la soirée de lancement du NOVA X est confirmée : jeudi 11 février 2027, 19 h, Sofitel Abidjan Hôtel Ivoire (boulevard Hassan II, Cocody).\n\nVotre code d\'entrée : '+d.code+'. Présentez le QR code à l\'accueil.\n'+(d.reg!=='Aucun'?'Régime noté : '+d.reg.toLowerCase()+'.\n':'')+'\nNous vous enverrons un rappel la veille.')+'\n\nL\'équipe d\'accueil NOVA X\nSN Silverplate Services, pour NOVA Électronique';
 $('#msg').textContent=txt;document.querySelector('.msg').hidden=!!d.annule;
 $('#wa').href='https://wa.me/?text='+encodeURIComponent('NOVA X · Soirée de lancement\nJeudi 11 février 2027, 19 h, Sofitel Abidjan Hôtel Ivoire\nMon code d\'entrée : '+d.code+'\nMon billet : '+location.origin+location.pathname+'#billet');
 f.hidden=true;$('#closed').hidden=true;$('#ok').hidden=false;
 var t=$('#ok');window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});
}
$('#again').addEventListener('click',function(){f.reset();ouvert();$('#ok').hidden=true;f.querySelector('input[name=prenom]').focus()});
$('#cancel').addEventListener('click',function(){if(!dernier)return;if(!confirm('Libérer votre place pour la soirée NOVA X ?'))return;
 var l=load(LS);l.forEach(function(x){if(x.mail===dernier.mail&&x.quand===dernier.quand)x.annule=true});save(LS,l);dernier.annule=true;jauge();afficher(dernier);
 var pr=load(LP).filter(function(x){return x.c!==dernier.code});save(LP,pr)});
/* retrouver mon billet */
$('#bf').addEventListener('submit',function(e){e.preventDefault();var m=$('#bm').value.trim().toLowerCase();
 if(!m){$('#berr').textContent='Saisissez votre e-mail.';return}
 var l=load(LS).filter(function(x){return x.mail.toLowerCase()===m}),d=l.filter(function(x){return !x.annule}).pop()||l.pop();
 if(!d){$('#berr').textContent='Aucune inscription avec cet e-mail sur ce téléphone. Le soir même, donnez votre nom à l\'accueil : la liste des invités fait foi.';return}
 $('#berr').textContent='';afficher(d);var t=$('#ok');window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'})});
/* inscriptions ouvertes jusqu'au lundi 1er février 2027, 23 h 59 (Abidjan) */
var LIM=Date.UTC(2027,1,1,23,59,59);
function ouvert(){var clos=Date.now()>LIM;$('#closed').hidden=!clos;f.hidden=clos;
 if(clos){$('#cl-p').textContent='Les inscriptions sont closes depuis le 1er février. Pour une demande de dernière minute, répondez au message d\'invitation reçu : l\'équipe vous répondra.'}}
ouvert();
$('#print').addEventListener('click',function(){window.print()});
$('#ics').addEventListener('click',function(){
 var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SN Silverplate Services//NOVA X//FR','BEGIN:VEVENT','UID:'+(dernier?dernier.code:'novax')+'@novax-lancement','DTSTAMP:20270101T000000Z','DTSTART:20270211T190000Z','DTEND:20270211T230000Z','SUMMARY:NOVA X · Soirée de lancement','LOCATION:Sofitel Abidjan Hôtel Ivoire\\, boulevard Hassan II\\, Cocody\\, Abidjan','DESCRIPTION:Code d\'entrée : '+(dernier?dernier.code:'')+'. Organisé par SN Silverplate Services.','BEGIN:VALARM','TRIGGER:-PT3H','ACTION:DISPLAY','DESCRIPTION:NOVA X ce soir','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
 var b=new Blob([ics],{type:'text/calendar'}),u=URL.createObjectURL(b),x=document.createElement('a');x.href=u;x.download='nova-x-11-fevrier-2027.ics';document.body.appendChild(x);x.click();x.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000);
});

/* accueil des invités */
var LISTE=null;
function liste(cb){if(LISTE)return cb(LISTE);
 fetch('invites.json?v=4').then(function(r){return r.json()}).then(function(j){LISTE=j;cb(j)}).catch(function(){LISTE=[];cb(LISTE)})}
function tous(){var loc=load(LS).filter(function(d){return d.code&&!d.annule}).map(function(d){return {c:d.code,n:d.civ+' '+d.prenom+' '+d.nom,s:d.ent,p:d.pro,t:null,a:d.acc,loc:1}});return (LISTE||[]).concat(loc)}
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
 if(!g&&load(LS).some(function(x){return x.annule&&x.code===v})){res('warn','Inscription annulée',[{t:v},{t:'L\'invité a libéré sa place. Voir le chef d\'accueil avant de le laisser entrer.'}]);return}
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
