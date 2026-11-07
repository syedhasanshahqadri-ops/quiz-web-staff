const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
document.addEventListener("click",e=>{if(e.target.id=="th"){const n=document.documentElement.dataset.theme=="dark"?"light":"dark";document.documentElement.dataset.theme=n;try{localStorage.setItem("qz_theme",n)}catch(x){}}});
if(!window.FIREBASE_CONFIG){$("#login").innerHTML="<h1>Setup needed</h1><p>Add your Firebase config in js/firebase-config.js, then reload.</p>"}
else{firebase.initializeApp(FIREBASE_CONFIG);const auth=firebase.auth(),db=firebase.firestore(),open=new Set();let rows=[],unsub,view=[];
$("#lf").onsubmit=async e=>{e.preventDefault();$("#le").textContent="";try{await auth.signInWithEmailAndPassword($("#em").value,$("#pw").value)}catch(x){$("#le").textContent="Sign-in failed. Check the email and password."}};
$("#out").onclick=()=>auth.signOut();
auth.onAuthStateChanged(u=>{$("#login").hidden=!!u;$("#dash").hidden=!u;$("#out").hidden=!u;if(unsub)unsub();
 if(u)unsub=db.collection("quizResults").orderBy("createdAt","desc").onSnapshot(s=>{$("#msg").textContent="";rows=s.docs.map(d=>({...d.data(),id:d.id}));draw()},e=>$("#msg").textContent="Cannot load results: "+e.message)});
const when=o=>o.createdAt?.toDate?o.createdAt.toDate():new Date(o.date||0);
function draw(){const q=$("#fq").value.toLowerCase(),so=$("#so").value;
 view=rows.filter(o=>(String(o.name)+" "+String(o.roll)).toLowerCase().includes(q));
 const cmp={new:(a,b)=>when(b)-when(a),hi:(a,b)=>b.score-a.score||a.timeSec-b.timeSec,lo:(a,b)=>a.score-b.score,name:(a,b)=>String(a.name).localeCompare(String(b.name)),roll:(a,b)=>String(a.roll).localeCompare(String(b.roll),undefined,{numeric:true})}[so];view.sort(cmp);
 const n=rows.length,avg=n?Math.round(rows.reduce((s,o)=>s+o.percent,0)/n):0,hi=n?Math.max(...rows.map(o=>o.score)):0,lo=n?Math.min(...rows.map(o=>o.score)):0;
 $("#st").innerHTML=`<div><b>${n}</b>Attempts</div><div><b>${avg}%</b>Average</div><div><b>${hi}</b>Highest score</div><div><b>${lo}</b>Lowest score</div>`;
 $("#list").innerHTML=view.length?view.map(o=>`<details class="row" data-id="${o.id}"${open.has(o.id)?" open":""}><summary><b>${esc(o.roll)}</b><span>${esc(o.name)}<br><small>${when(o).toLocaleString()}</small></span><span>${o.score} / ${o.total}</span><span class="pc">${o.percent}%</span><span>${esc(o.time)}</span></summary><div><p style="margin-top:.7rem"><b>Correct:</b> ${o.score} · <b>Wrong:</b> ${o.wrong} · <b>Unanswered:</b> ${o.unanswered} · <b>Time used:</b> ${esc(o.time)}</p><div class="sub">${Object.entries(o.subjects||{}).map(([k,v])=>`<div>${esc(k)}<b>${v.c} / ${v.t}</b></div>`).join("")}</div></div></details>`).join(""):"<p>No results yet.</p>"}
addEventListener("toggle",e=>{const d=e.target;if(d.tagName=="DETAILS"&&d.dataset.id)d.open?open.add(d.dataset.id):open.delete(d.dataset.id)},true);
$("#fq").oninput=$("#so").onchange=draw;
$("#csv").onclick=()=>{if(!view.length)return;const subs=[...new Set(view.flatMap(o=>Object.keys(o.subjects||{})))],q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const head=["Roll","Name","Score","Total","Percent","Wrong","Unanswered","Time",...subs,"Date"];
 const lines=[head.map(q).join(",")].concat(view.map(o=>[o.roll,o.name,o.score,o.total,o.percent,o.wrong,o.unanswered,o.time,...subs.map(s=>o.subjects?.[s]?o.subjects[s].c+"/"+o.subjects[s].t:""),when(o).toLocaleString()].map(q).join(",")));
 const b=new Blob(["\ufeff"+lines.join("\n")],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="quiz-results.csv";document.body.appendChild(a);a.click();a.remove()}}
