export const STRATEGIES=["solicitar_sessao","usar_confianca","sessao_herdada","rota_alternativa"];
export const devices=[
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
];export const byId=id=>devices.find(d=>d.id===id);
export function observableFrom(host){if(!host)return devices.filter(()=>Math.random()<.55).map(d=>d.id);const d=byId(host);return d.links.filter(()=>Math.random()<.78)}
export function defend(target,{origin,strategy,occupied}){let chance=target.exposure*(1-target.defense);let reason="defesa padrão recusou a tentativa";if(strategy==="solicitar_sessao")chance+=.12;if(strategy==="usar_confianca"&&origin&&target.trust.includes(origin)){chance+=.38;reason="relação de confiança não foi suficiente"}if(strategy==="sessao_herdada"&&origin&&occupied.has(origin)){chance+=.22;reason="sessão herdada não foi aceita"}if(strategy==="rota_alternativa"&&origin)chance+=.14;chance=Math.max(.04,Math.min(.9,chance));const roll=Math.random();if(roll<chance)return{ok:true,access:roll<chance*.3?"parcial":"sessao",chance};return{ok:false,reason,chance}}

export function createRuntime(d){return{cpu:Math.round(8+Math.random()*18),memory:Math.round(20+Math.random()*20),latency:Math.round(5+Math.random()*18),stability:100,status:"NORMAL",uptime:0,restarts:0,aiLoad:0}}
export function tickRuntime(r,hasAI){r.uptime++;const base=hasAI?r.aiLoad:0;r.cpu=Math.max(4,Math.min(100,Math.round(r.cpu*.72+8+base+Math.random()*12)));r.memory=Math.max(12,Math.min(100,Math.round(r.memory+(hasAI?base*.12:-1.4)+Math.random()*2-1)));r.latency=Math.max(3,Math.round(8+r.cpu*.55+(hasAI?base*.7:0)+Math.random()*18));r.stability=Math.max(0,Math.min(100,Math.round(108-r.cpu*.55-r.memory*.2-r.latency*.08)));r.status=r.cpu>92||r.stability<28?"CRÍTICO":r.cpu>76||r.stability<48?"INSTÁVEL":r.cpu>58?"LENTO":"NORMAL";return r}
export function userReaction(r){if(r.status==="CRÍTICO"&&Math.random()<.32)return"restart";if(r.status==="INSTÁVEL"&&Math.random()<.08)return"restart";return null}
export function restartRuntime(r){r.cpu=8;r.memory=22;r.latency=12;r.stability=92;r.status="REINICIANDO";r.aiLoad=0;r.restarts++;return r}
