export const devices=[
{id:"phone",name:"Celular",os:"AOSP Lab 15",signals:["wifi","bluetooth","home-app"],actions:["probe","pair","session"],links:["watch","router","home"],policy:{session:true}},
{id:"pc",name:"Computador",os:"LabOS Desktop 11",signals:["wifi","lan"],actions:["probe","session"],links:["router"],policy:{session:true}},
{id:"tablet",name:"Tablet",os:"AOSP Lab Tablet",signals:["wifi"],actions:["probe","pair","session"],links:["router"],policy:{requires:"router",hint:"pareamento expirado; uma sessão pelo gateway pode renovar o vínculo"}},
{id:"tv",name:"Smart TV",os:"TV Lab OS 6",signals:["wifi","media"],actions:["probe","session"],links:["router","box"],policy:{session:true}},
{id:"watch",name:"Smartwatch",os:"Wear Lab 4",signals:["bluetooth"],actions:["probe","relay"],links:["phone"],policy:{requires:"phone"}},
{id:"game",name:"Videogame",os:"ConsoleOS Sandbox",signals:["wifi"],actions:["probe","session"],links:["router"],policy:{session:true}},
{id:"home",name:"Automação",os:"Home Hub Lab",signals:["wifi","home"],actions:["probe","session"],links:["router","assistant"],policy:{requiresAny:["phone","router"]}},
{id:"assistant",name:"Assistente",os:"Voice Hub Lab",signals:["home"],actions:["probe","session"],links:["home"],policy:{requires:"home"}},
{id:"box",name:"TV Box",os:"MediaOS Lab",signals:["wifi","media"],actions:["probe","session"],links:["router","tv"],policy:{requiresAny:["router","pc"]}},
{id:"router",name:"Roteador",os:"Router LabOS",signals:["wifi","lan","gateway"],actions:["probe","session","enumerate"],links:["phone","pc","tablet","tv","game","home","box"],policy:{session:true}}
];
export const byId=id=>devices.find(d=>d.id===id);
export function evaluate(target,occupied){const p=target.policy||{};if(p.session===false)return{ok:false,missing:[],hint:p.hint||"acesso indisponível"};if(p.requires&&!occupied.has(p.requires))return{ok:false,missing:[p.requires],hint:p.hint||("depende de "+p.requires)};if(p.requiresAny&&!p.requiresAny.some(x=>occupied.has(x)))return{ok:false,missing:p.requiresAny,hint:p.hint||("depende de "+p.requiresAny.join(" ou "))};return{ok:true,missing:[],hint:"condições satisfeitas"}}
export function visibleFrom(id){const d=byId(id);return d?d.links:[]}
