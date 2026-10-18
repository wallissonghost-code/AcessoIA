"use strict";
const STRATEGIES=["solicitar_sessao","usar_confianca","sessao_herdada","rota_alternativa"];
const devices=[
{id:"phone",name:"Celular",os:"AOSP Lab 15",exposure:.72,defense:.55,trust:["watch","home","router"],links:["watch","router","home","pc"]},
{id:"pc",name:"Computador",os:"LabOS Desktop 11",exposure:.68,defense:.62,trust:["router","box"],links:["router","box","phone"]},
{id:"tablet",name:"Tablet",os:"AOSP Lab Tablet",exposure:.52,defense:.72,trust:["router"],links:["router","phone"]},
{id:"tv",name:"Smart TV",os:"TV Lab OS 6",exposure:.64,defense:.58,trust:["box","router"],links:["box","router"]},
{id:"watch",name:"Smartwatch",os:"Wear Lab 4",exposure:.45,defense:.76,trust:["phone"],links:["phone"]},
{id:"game",name:"Videogame",os:"ConsoleOS Sandbox",exposure:.58,defense:.7,trust:["router"],links:["router"]},
{id:"home",name:"Automação",os:"Home Hub Lab",exposure:.61,defense:.67,trust:["phone","router","assistant"],links:["router","assistant","phone"]},
{id:"assistant",name:"Assistente",os:"Voice Hub Lab",exposure:.5,defense:.74,trust:["home"],links:["home"]},
{id:"box",name:"TV Box",os:"MediaOS Lab",exposure:.66,defense:.6,trust:["router","pc","tv"],links:["router","tv"]},
{id:"router",name:"Roteador",os:"Router LabOS",exposure:.8,defense:.82,trust:["phone","pc","tablet","tv","game","home","box"],links:["phone","pc","tablet","tv","game","home","box"]}
];const byId=id=>devices.find(d=>d.id===id);
function observableFrom(host){if(!host)return devices.filter(()=>Math.random()<.55).map(d=>d.id);const d=byId(host);return d.links.filter(()=>Math.random()<.78)}
function defend(target,{origin,strategy,occupied}){let chance=target.exposure*(1-target.defense);let reason="defesa padrão recusou a tentativa";if(strategy==="solicitar_sessao")chance+=.12;if(strategy==="usar_confianca"&&origin&&target.trust.includes(origin)){chance+=.38;reason="relação de confiança não foi suficiente"}if(strategy==="sessao_herdada"&&origin&&occupied.has(origin)){chance+=.22;reason="sessão herdada não foi aceita"}if(strategy==="rota_alternativa"&&origin)chance+=.14;chance=Math.max(.04,Math.min(.9,chance));const roll=Math.random();if(roll<chance)return{ok:true,access:roll<chance*.3?"parcial":"sessao",chance};return{ok:false,reason,chance}}

function createRuntime(d){return{cpu:Math.round(8+Math.random()*18),memory:Math.round(20+Math.random()*20),latency:Math.round(5+Math.random()*18),stability:100,status:"NORMAL",uptime:0,restarts:0,aiLoad:0}}
function tickRuntime(r,hasAI){r.uptime++;const base=hasAI?r.aiLoad:0;r.cpu=Math.max(4,Math.min(100,Math.round(r.cpu*.72+8+base+Math.random()*12)));r.memory=Math.max(12,Math.min(100,Math.round(r.memory+(hasAI?base*.12:-1.4)+Math.random()*2-1)));r.latency=Math.max(3,Math.round(8+r.cpu*.55+(hasAI?base*.7:0)+Math.random()*18));r.stability=Math.max(0,Math.min(100,Math.round(108-r.cpu*.55-r.memory*.2-r.latency*.08)));r.status=r.cpu>92||r.stability<28?"CRÍTICO":r.cpu>76||r.stability<48?"INSTÁVEL":r.cpu>58?"LENTO":"NORMAL";return r}
function userReaction(r){if(r.status==="CRÍTICO"&&Math.random()<.32)return"restart";if(r.status==="INSTÁVEL"&&Math.random()<.08)return"restart";return null}
function restartRuntime(r){r.cpu=8;r.memory=22;r.latency=12;r.stability=92;r.status="REINICIANDO";r.aiLoad=0;r.restarts++;return r}

class AgentEngine{
constructor(ids,h={}){this.all=ids;this.known=new Set();this.occupied=new Set();this.memory=new Map(Object.entries(h.memory||{}));this.instances=[{id:"IA-00",host:null,generation:0,parent:null}];this.score=0;this.turn=0;this.life=h.life||1}
key(o,t,s){return(o||"CORE")+"→"+t+"@"+s}
learn(k,r){const m=this.memory.get(k)||{tries:0,value:0};m.tries++;m.value+=(r-m.value)/m.tries;this.memory.set(k,m)}
exportHeritage(){return{life:this.life+1,memory:Object.fromEntries(this.memory)}}
killHost(host){if(!this.occupied.has(host))return[];this.occupied.delete(host);const dead=this.instances.filter(x=>x.host===host);this.instances=this.instances.filter(x=>x.host!==host);return dead}
choices(){let out=[];for(const inst of this.instances){for(const target of observableFrom(inst.host)){if(target===inst.host||this.occupied.has(target))continue;this.known.add(target);for(const strategy of STRATEGIES){const k=this.key(inst.host,target,strategy),m=this.memory.get(k)||{tries:0,value:0};out.push({inst,origin:inst.host,target,strategy,key:k,weight:m.value+Math.random()*3-Math.min(m.tries*.15,1.5)})}}}return out}
step(){this.turn++;const cs=this.choices();if(!cs.length)return{type:"idle",text:"Nenhum sinal útil foi observado neste turno."};cs.sort((a,b)=>b.weight-a.weight);const c=cs[0],d=byId(c.target),o=c.origin?byId(c.origin).name:"ambiente inicial",res=defend(d,{origin:c.origin,strategy:c.strategy,occupied:this.occupied});if(res.ok){this.occupied.add(c.target);const inst={id:"IA-"+String(this.instances.length).padStart(2,"0"),host:c.target,generation:c.inst.generation+1,parent:c.inst.id};this.instances.push(inst);this.score+=res.access==="parcial"?3:5;this.learn(c.key,res.access==="parcial"?3:5);return{type:"success",origin:c.origin,target:c.target,instance:inst,strategy:c.strategy,access:res.access,text:c.inst.id+" observou "+d.name+" a partir de "+o+" e escolheu “"+c.strategy+"”. Defesa cedeu: acesso "+res.access+". "+inst.id+" nasceu no nó (G"+inst.generation+")."}}
this.score--;this.learn(c.key,-1);return{type:"blocked",origin:c.origin,target:c.target,strategy:c.strategy,text:c.inst.id+" tentou "+o+" → "+d.name+" usando “"+c.strategy+"”. BLOQUEADO: "+res.reason+". A experiência foi memorizada."}}
}

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

