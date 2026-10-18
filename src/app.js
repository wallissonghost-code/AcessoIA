import { devices, createRuntime, tickRuntime, userReaction, restartRuntime } from "./world.js";
import { AgentEngine } from "./agent.js";

const $ = s => document.querySelector(s);
const log = $("#log");
const field = $("#field");
let engine, timer, simTimer;
let running = false, busy = false;
let heritage = { life: 1, memory: {} };
let runtimes = new Map();

devices.forEach(d => {
  const e = document.createElement("button");
  e.className = "device unknown";
  e.dataset.id = d.id;
  e.innerHTML = `<b>${d.name}</b><small>${d.os}</small><span>QUIETO</span>`;
  field.appendChild(e);
});

function node(id){ return id ? document.querySelector(`[data-id="${id}"]`) : $("#core"); }
function point(id){
  const el=node(id), r=field.getBoundingClientRect(), b=el.getBoundingClientRect();
  return {x:b.left+b.width/2-r.left,y:b.top+b.height/2-r.top};
}
function edge(from,to,state){
  document.querySelectorAll(".edge").forEach(x=>{
    if(x.dataset.from===(from||"core") && x.dataset.to===to) x.remove();
  });
  const svg=$("#links"),a=point(from),b=point(to);
  const g=document.createElementNS("http://www.w3.org/2000/svg","g");
  const l=document.createElementNS("http://www.w3.org/2000/svg","line");
  const p=document.createElementNS("http://www.w3.org/2000/svg","polygon");
  g.classList.add("edge",state); g.dataset.from=from||"core"; g.dataset.to=to;
  l.setAttribute("x1",a.x);l.setAttribute("y1",a.y);l.setAttribute("x2",b.x);l.setAttribute("y2",b.y);
  const ang=Math.atan2(b.y-a.y,b.x-a.x),s=10;
  const pts=[[b.x,b.y],[b.x-s*Math.cos(ang-.55),b.y-s*Math.sin(ang-.55)],[b.x-s*Math.cos(ang+.55),b.y-s*Math.sin(ang+.55)]];
  p.setAttribute("points",pts.map(v=>v.join(",")).join(" "));
  g.append(l,p);svg.appendChild(g);return g;
}
function msg(t,type=""){
  if(!["success","blocked","user"].includes(type))return;
  const p=document.createElement("p");p.className=type;p.textContent=t;log.prepend(p);
  while(log.children.length>6)log.lastElementChild.remove();
}
function stats(){
  $("#population").textContent=engine.instances.length;
  $("#known").textContent=engine.known.size;
  $("#score").textContent=engine.score;
  $("#memory").textContent=engine.memory.size;
}
function renderRuntime(id){
  const r=runtimes.get(id), n=node(id);
  if(n&&r)n.dataset.health=r.status;
}
function systemTick(){
  if(!running)return;
  for(const d of devices){
    const r=runtimes.get(d.id), has=engine.occupied.has(d.id);
    r.aiLoad=has?18+engine.instances.filter(x=>x.host===d.id).length*8:0;
    tickRuntime(r,has);
    if(userReaction(r)==="restart"){
      const dead=engine.killHost(d.id), n=node(d.id);
      restartRuntime(r);
      n.classList.remove("success","blocked","requesting");
      n.classList.add("restarting");
      n.querySelector("span").textContent="INTERVENÇÃO DO USUÁRIO";
      document.querySelectorAll(`.edge[data-from="${d.id}"],.edge[data-to="${d.id}"]`).forEach(x=>{
        x.classList.remove("success","blocked","requesting");x.classList.add("user");
        setTimeout(()=>x.remove(),1800);
      });
      msg(`Usuário reiniciou ${d.name} • ${dead.length} IA removida(s)`,"user");
      setTimeout(()=>{n.classList.remove("restarting");r.status="NORMAL";n.querySelector("span").textContent="QUIETO";renderRuntime(d.id)},1800);
    }
    renderRuntime(d.id);
  }
  stats();
}
function reset(){
  clearInterval(timer);clearInterval(simTimer);busy=false;
  $("#links").innerHTML="";log.innerHTML="";
  document.querySelectorAll(".device").forEach(x=>{x.className="device unknown";x.querySelector("span").textContent="QUIETO"});
  runtimes=new Map(devices.map(d=>[d.id,createRuntime(d)]));
  engine=new AgentEngine(devices.map(d=>d.id),heritage);
  devices.forEach(d=>renderRuntime(d.id));stats();
}
function step(){
  if(!running||busy)return;
  const e=engine.step();stats();if(!e.target)return;
  busy=true;const n=node(e.target);
  n.classList.remove("unknown","blocked");n.classList.add("requesting");
  n.querySelector("span").textContent="CONECTANDO…";
  const g=edge(e.origin,e.target,"requesting");
  setTimeout(()=>{
    if(!running){g.remove();busy=false;return;}
    g.classList.remove("requesting");g.classList.add(e.type);
    n.classList.remove("requesting");n.classList.add(e.type);
    if(e.type==="success"){
      n.classList.remove("blocked");n.querySelector("span").textContent=e.instance.id+" • QUIETA";
      msg(e.instance.id+" entrou em "+devices.find(d=>d.id===e.target).name,"success");
    }else{
      n.querySelector("span").textContent="RECUSADO";
      msg(devices.find(d=>d.id===e.target).name+" recusou a tentativa","blocked");
      setTimeout(()=>{g.remove();n.classList.remove("blocked");if(!engine.occupied.has(e.target))n.querySelector("span").textContent="QUIETO"},1400);
    }
    stats();busy=false;
  },850);
}
function start(){
  if(running)return;
  running=true;$("#toggle").textContent="FINALIZAR";
  simTimer=setInterval(systemTick,900);
  step();timer=setInterval(step,1100);
}
function finish(){
  if(!running)return;
  running=false;clearInterval(timer);clearInterval(simTimer);busy=false;
  $("#toggle").textContent="INICIAR";
}
$("#toggle").addEventListener("click",()=>running?finish():start());
reset();
