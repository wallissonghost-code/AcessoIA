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
