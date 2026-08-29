/** Client-safe HTML templates. Never import vite / Node here. */

import { injectCozyElements } from "@/lib/preview/cozy-elements";

export type PreviewKind = "kanban" | "chat" | "habits" | "calendar" | "notes" | "landing";

export function detectKind(brief: string): PreviewKind {
  const b = brief.toLowerCase();
  if (/habit|návyk|navyk|streak|7-day grid|7-dň/.test(b)) return "habits";
  if (/kanban|trello|inbox.*done|stĺp|stlp/.test(b)) return "kanban";
  if (/chat|assistant|asistent|konverz|správy|spravy/.test(b)) return "chat";
  if (/calendar|kalend|schedule|udalost|mesiac/.test(b)) return "calendar";
  if (/note|poznám|poznam|markdown|editor/.test(b)) return "notes";
  return "landing";
}

export function localPreviewHtml(brief: string): { title: string; html: string; code: string } {
  const kind = detectKind(brief);
  const title = titleFromBrief(brief);
  const html = injectCozyElements(renderKind(kind, title, brief));
  const code = `/* local ${kind} preview — no Node APIs */\n` + html;
  return { title, html, code };
}

function renderKind(kind: PreviewKind, title: string, brief: string): string {
  switch (kind) {
    case "kanban":
      return kanban(title, brief);
    case "chat":
      return chat(title, brief);
    case "habits":
      return habits(title, brief);
    case "calendar":
      return calendar(title, brief);
    case "notes":
      return notes(title, brief);
    default:
      return landing(title, brief);
  }
}

const BASE_CSS = `
:root { color-scheme: light; --paper:#f4efe6; --ink:#1c1915; --muted:#4a433a; --line:#ddd4c6; --terra:#c45c38; --cream:#fff7f0; }
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; background: var(--paper); color: var(--ink); font-family: "Iowan Old Style", Palatino, Georgia, serif; }
body { padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }
button, input, textarea { font: inherit; }
button { cursor: pointer; }
.app { max-width: 1080px; margin: 0 auto; padding: 20px 16px 40px; }
.kicker { letter-spacing: 0.16em; text-transform: uppercase; font-size: 11px; color: #8a7f70; margin: 0 0 8px; font-family: system-ui, sans-serif; }
h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); line-height: 1.12; margin: 0 0 8px; font-weight: 600; }
.lede { font-family: system-ui, sans-serif; color: var(--muted); font-size: 15px; line-height: 1.5; margin: 0 0 22px; }
.row { display: flex; gap: 12px; flex-wrap: wrap; }
.card { background: #fbf7f0; border: 1px solid var(--line); border-radius: 16px; padding: 14px; }
.btn { font-family: system-ui, sans-serif; font-weight: 600; font-size: 13px; background: var(--terra); color: var(--cream); border: 0; padding: 10px 14px; border-radius: 12px; }
.btn.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.field { width: 100%; border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 10px 12px; font-family: system-ui, sans-serif; font-size: 14px; }
`;

function shell(title: string, body: string, script: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>${escapeHtml(title)}</title>
<style>${BASE_CSS}</style>
</head>
<body>
${body}
<script>${script}</script>
</body>
</html>`;
}

function landing(title: string, brief: string): string {
  return shell(
    title,
    `<cozy-app kicker="Cozy Studio" heading="${escapeHtml(title)}" lede="${escapeHtml(brief.slice(0, 320) || "A calm product surface.")}">
      <cozy-btn type="button" id="cta">Get started</cozy-btn>
    </cozy-app>`,
    `document.getElementById("cta").addEventListener("click",function(){this.textContent="Ready"});`,
  );
}

function kanban(title: string, brief: string): string {
  return shell(
    title,
    `<cozy-app kicker="Kanban" heading="${escapeHtml(title)}" lede="${escapeHtml(brief.slice(0, 180))}">
      <form id="add" class="row" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
        <input class="field" id="title" placeholder="New card" required style="flex:1;min-width:180px"/>
        <cozy-btn type="submit">Add</cozy-btn>
      </form>
      <cozy-board id="board"></cozy-board>
    </cozy-app>`,
    `const cols=["Inbox","Doing","Done"];
let cards=[{id:1,t:"Triage inbox",c:0,p:"high"},{id:2,t:"Draft brief",c:1,p:"medium"},{id:3,t:"Ship preview",c:2,p:""}];
const board=document.getElementById("board");
function paint(){
  board.innerHTML="";
  cols.forEach((name,i)=>{
    const col=document.createElement("cozy-column");
    col.setAttribute("name",name);
    col.dataset.col=String(i);
    board.appendChild(col);
  });
  cards.forEach(card=>{
    const wrap=board.querySelector('[data-col="'+card.c+'"]');
    const el=document.createElement("cozy-card");
    if(card.p) el.setAttribute("priority",card.p);
    el.appendChild(document.createTextNode(card.t));
    const row=document.createElement("div");
    row.style.cssText="display:flex;gap:6px;margin-top:8px";
    if(card.c>0){const b=document.createElement("cozy-btn");b.setAttribute("variant","ghost");b.textContent="Back";b.addEventListener("click",()=>{card.c--;paint()});row.appendChild(b)}
    if(card.c<2){const b=document.createElement("cozy-btn");b.textContent="Move";b.addEventListener("click",()=>{card.c++;paint()});row.appendChild(b)}
    el.appendChild(row);wrap.appendChild(el);
  });
}
document.getElementById("add").onsubmit=function(e){
  e.preventDefault();
  const i=document.getElementById("title");
  cards.push({id:Date.now(),t:i.value,c:0,p:""}); i.value=""; paint();
};
paint();`,
  );
}

function chat(title: string, brief: string): string {
  return shell(
    title,
    `<cozy-app kicker="Chat" heading="${escapeHtml(title)}" lede="${escapeHtml(brief.slice(0, 160))}">
      <div id="log" style="min-height:280px;display:flex;flex-direction:column;gap:10px;margin-bottom:12px">
        <cozy-msg role="assistant">Ready when you are.</cozy-msg>
      </div>
      <form id="send" class="row" style="display:flex;gap:12px;flex-wrap:wrap">
        <input class="field" id="msg" placeholder="Ask something" required style="flex:1;min-width:180px"/>
        <cozy-btn type="submit">Send</cozy-btn>
      </form>
    </cozy-app>`,
    `const log=document.getElementById("log");
function add(role,text){
  const el=document.createElement("cozy-msg");
  el.setAttribute("role",role);
  el.textContent=text;
  log.appendChild(el);
  log.scrollTop=log.scrollHeight;
}
document.getElementById("send").onsubmit=function(e){
  e.preventDefault();
  const i=document.getElementById("msg");
  const t=i.value.trim();
  if(!t) return;
  add("user",t);
  i.value="";
  setTimeout(()=>add("assistant","Noted: "+t.slice(0,80)+". I would sketch a paper-and-ink layout next."),240);
};`,
  );
}

function habits(title: string, brief: string): string {
  return shell(
    title,
    `<cozy-app kicker="Habits" heading="${escapeHtml(title)}" lede="${escapeHtml(brief.slice(0, 160))}">
      <p id="meta" style="font-family:system-ui,sans-serif;color:#4a433a;font-size:14px;margin:-8px 0 16px"></p>
      <div id="grid"></div>
    </cozy-app>`,
    `const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const habits=["Water","Movement","Reading","Sleep"];
const key="cozy-habits";
const mem={};
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}
let state=JSON.parse(lsGet(key)||"{}");
const grid=document.getElementById("grid");
function count(){return Object.values(state).filter(Boolean).length}
function paint(){
  document.getElementById("meta").textContent=count()+" / "+(habits.length*7)+" cells this week";
  grid.innerHTML="";
  habits.forEach(h=>{
    const card=document.createElement("cozy-card");
    card.style.marginBottom="10px";
    const head=document.createElement("div");
    head.style.cssText="font-weight:600;margin-bottom:8px;font-family:system-ui,sans-serif";
    head.textContent=h;
    card.appendChild(head);
    const cells=document.createElement("div");
    cells.style.cssText="display:grid;grid-template-columns:repeat(7,1fr);gap:8px";
    days.forEach(d=>{
      const id=h+"-"+d;
      const on=!!state[id];
      const b=document.createElement("cozy-btn");
      if(!on) b.setAttribute("variant","ghost");
      b.textContent=d;
      b.style.cssText="width:100%;font-size:11px;letter-spacing:.06em;text-transform:uppercase";
      b.addEventListener("click",()=>{state[id]=!state[id];lsSet(key,JSON.stringify(state));paint()});
      cells.appendChild(b);
    });
    card.appendChild(cells);
    grid.appendChild(card);
  });
}
paint();`,
  );
}

function calendar(title: string, brief: string): string {
  return shell(
    title,
    `<cozy-app kicker="Calendar" heading="${escapeHtml(title)}" lede="${escapeHtml(brief.slice(0, 160))}">
      <cozy-board>
        <cozy-column name="Month">
          <div id="month" style="font-weight:600;margin-bottom:10px;font-family:system-ui,sans-serif"></div>
          <div id="cal" style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px"></div>
        </cozy-column>
        <cozy-column name="Notes">
          <input class="field" id="note" placeholder="Write a note, then click a day" style="margin-bottom:10px"/>
          <ul id="list" style="padding-left:18px;font-family:system-ui,sans-serif;font-size:14px;margin:0"></ul>
        </cozy-column>
      </cozy-board>
    </cozy-app>`,
    `const now=new Date();
const y=now.getFullYear(), m=now.getMonth();
document.getElementById("month").textContent=now.toLocaleString("en",{month:"long",year:"numeric"});
const notes={};
const cal=document.getElementById("cal");
const list=document.getElementById("list");
["S","M","T","W","T","F","S"].forEach(d=>{const e=document.createElement("div");e.textContent=d;e.style.cssText="text-align:center;font-size:11px;color:#8a7f70;font-family:system-ui,sans-serif";cal.appendChild(e)});
const first=new Date(y,m,1).getDay();
const days=new Date(y,m+1,0).getDate();
for(let i=0;i<first;i++){const e=document.createElement("div");cal.appendChild(e)}
function paintNotes(){
  list.innerHTML="";
  Object.keys(notes).sort((a,b)=>Number(a)-Number(b)).forEach(k=>{const li=document.createElement("li");li.textContent=k+": "+notes[k];list.appendChild(li)});
  if(!list.children.length){list.innerHTML="<li style=\\"color:#8a7f70\\">Click a day to add a note.</li>"}
}
for(let d=1;d<=days;d++){
  const b=document.createElement("cozy-btn");
  const today=d===now.getDate();
  if(!today) b.setAttribute("variant","ghost");
  b.textContent=String(d);
  b.style.cssText="width:100%;font-size:13px";
  b.addEventListener("click",()=>{const t=document.getElementById("note").value.trim(); if(t){notes[d]=t;paintNotes()}});
  cal.appendChild(b);
}
paintNotes();`,
  );
}

function notes(title: string, brief: string): string {
  return shell(
    title,
    `<cozy-app kicker="Notes" heading="${escapeHtml(title)}" lede="${escapeHtml(brief.slice(0, 160))}">
      <cozy-board>
        <cozy-column name="Library">
          <cozy-btn id="new" type="button" style="width:100%;margin-bottom:10px">New note</cozy-btn>
          <div id="list"></div>
        </cozy-column>
        <cozy-column name="Editor">
          <input class="field" id="ntitle" placeholder="Title" style="margin-bottom:10px"/>
          <textarea class="field" id="nbody" rows="10" placeholder="Write here"></textarea>
        </cozy-column>
      </cozy-board>
    </cozy-app>`,
    `const key="cozy-notes";
const mem={};
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}
let items=JSON.parse(lsGet(key)||"null")||[{id:1,title:"Welcome",body:"A quiet page for thoughts."}];
let current=items[0].id;
const list=document.getElementById("list");
const t=document.getElementById("ntitle");
const b=document.getElementById("nbody");
function save(){lsSet(key,JSON.stringify(items))}
function paint(){
  list.innerHTML="";
  items.forEach(n=>{
    const btn=document.createElement("cozy-btn");
    if(n.id!==current) btn.setAttribute("variant","ghost");
    btn.textContent=n.title||"Untitled";
    btn.style.cssText="display:block;width:100%;margin:0 0 6px;text-align:left";
    btn.addEventListener("click",()=>{current=n.id;load()});
    list.appendChild(btn);
  });
}
function load(){
  const n=items.find(x=>x.id===current); if(!n) return;
  t.value=n.title; b.value=n.body; paint();
}
function persist(){
  const n=items.find(x=>x.id===current); if(!n) return;
  n.title=t.value; n.body=b.value; save(); paint();
}
t.oninput=persist; b.oninput=persist;
document.getElementById("new").addEventListener("click",()=>{
  const n={id:Date.now(),title:"New note",body:""}; items.unshift(n); current=n.id; save(); load();
});
load();`,
  );
}

function titleFromBrief(brief: string): string {
  const t = brief.trim();
  if (!t) return "Quiet landing";
  const first = t.split(/[.!?]/)[0]?.trim() ?? t;
  return first.slice(0, 48) || "Quiet landing";
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "\u0026amp;",
    "<": "\u0026lt;",
    ">": "\u0026gt;",
    '"': "\u0026quot;",
  };
  return s.replace(/[&<>"]/g, (ch) => map[ch] ?? ch);
}
