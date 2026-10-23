"use strict";
const http = require("node:http");
const {randomUUID,timingSafeEqual}=require("node:crypto");
const PORT=Number(process.env.PORT||8765);
const DEVICE_TOKEN=process.env.DEVICE_TOKEN||"";
const OPERATOR_TOKEN=process.env.OPERATOR_TOKEN||"";
const pending=new Map(),results=new Map();
const WINDOW=10*60*1000;
let lastDeviceSeen=0;
function eq(a,b){const x=Buffer.from(a||""),y=Buffer.from(b||"");return !!b&&x.length===y.length&&timingSafeEqual(x,y);}
function json(res,code,data){res.writeHead(code,{"content-type":"application/json;charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});res.end(JSON.stringify(data));}
function authorized(req,secret){return eq((req.headers.authorization||"").replace(/^Bearer /i,""),secret);}
async function readBody(req){let n=0,s="";for await(const c of req){n+=c.length;if(n>2048)throw Error("too_large");s+=c;}return JSON.parse(s||"{}");}
function html(res,body){res.writeHead(200,{"content-type":"text/html;charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-frame-options":"DENY","referrer-policy":"no-referrer","content-security-policy":"default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'"});res.end(body);}
function cleanup(){for(const [id,job] of pending){if(Date.now()-job.at>WINDOW)pending.delete(id);}for(const [id,x] of results){if(Date.now()-x.at>WINDOW)results.delete(id);}}
if(DEVICE_TOKEN.length<32||OPERATOR_TOKEN.length<32||eq(DEVICE_TOKEN,OPERATOR_TOKEN)) {
 console.error("Missing valid, distinct DEVICE_TOKEN and OPERATOR_TOKEN (>=32 chars)");process.exit(1);
}
const CONSOLE_HTML="<!doctype html>\n<html lang=\"pt\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>\n<title>Nexus Android Lab</title>\n<style>\nbody{background:#0b1020;color:#e5eaf5;font:16px system-ui,-apple-system,sans-serif;max-width:700px;margin:48px auto;padding:0 20px}\nheader{display:flex;align-items:center;gap:12px}h1{font-size:28px;margin:10px 0}\np{line-height:1.6;color:#b6c6d8}\n.card{padding:22px;border:1px solid #31405b;border-radius:16px;background:#151e2e}\ninput,button{box-sizing:border-box;width:100%;padding:13px;border-radius:9px;font-size:16px;margin:6px 0 14px}\ninput{background:#0d1524;color:white;border:1px solid #495b75}\nbutton{background:#3d75fb;color:white;border:0;font-weight:600;cursor:pointer}\nbutton:disabled{opacity:.5;cursor:wait}pre{white-space:pre-wrap;word-break:break-word;background:#0d1524;border-radius:10px;padding:16px}\nsmall{color:#9db1c8}\n</style></head>\n<body><header><span style=\"font-size:34px\">📱</span><div><h1>Nexus Android Lab</h1><small>Teste remoto seguro · apenas diagnóstico</small></div></header>\n<p>Este painel só envia o comando <code>status</code> para o teu Huawei. Precisas do token do operador guardado no ficheiro privado de credenciais.</p>\n<section class=\"card\"><label for=\"token\">Token privado do operador</label><input type=\"password\" id=\"token\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"Cola o token do operador\"/>\n<button id=\"send\">Pedir diagnóstico ao Huawei</button>\n<pre id=\"state\" aria-live=\"polite\">Pronto. Inicia o Nexus Bridge no Huawei e pede o diagnóstico.</pre><small>O token fica nesta página enquanto estiver aberta. Não é guardado no navegador.</small></section>\n<script>\nconst token=document.getElementById('token'),state=document.getElementById('state'),send=document.getElementById('send');\nasync function api(path,method,body){const r=await fetch(path,{method:method||'GET',headers:{authorization:'Bearer '+token.value.trim(),'content-type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status+(r.status===401?' — token inválido':''));return r.json();}\nsend.addEventListener('click',async()=>{\n send.disabled=true;try{\n  if(token.value.trim().length<32)throw new Error('Cola o token do operador.');\n  state.textContent='A enviar pedido de diagnóstico…';\n  const job=await api('/operator/enqueue','POST',{command:'status'});\n  state.textContent='Tarefa enviada. A aguardar resposta do Huawei…';\n  for(let i=0;i<30;i++){await new Promise(resolve=>setTimeout(resolve,3000));const result=await api('/operator/result/'+job.id);if(result.done){state.textContent='✅ Huawei respondeu:\\n'+result.result;return;}}\n  state.textContent='O Huawei ainda não respondeu. Confirma que o Nexus Bridge 0.1 está ativo e ligado à internet.';\n }catch(e){state.textContent='Erro: '+e.message;}finally{send.disabled=false;}\n});\n</script></body></html>";

// Stateless Streamable HTTP MCP 2025-06-18, deliberately read-only.
// Auth uses the existing OPERATOR_TOKEN via a bearer credential configured privately by the user.
const MCP_VERSION="2025-06-18";
function mcpResult(id,result){return {jsonrpc:"2.0",id,result};}
function mcpError(id,code,message){return {jsonrpc:"2.0",id,error:{code,message}};}
function mcpText(data){return {content:[{type:"text",text:JSON.stringify(data)}]};}
const MCP_TOOLS=[
 {name:"nexus_connection",description:"Check whether the owner's Huawei Android test phone has recently contacted Nexus Android Lab. Returns real connectivity state; no device action.",
  inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},
 {name:"nexus_device_status",description:"Request a harmless Android version/model status diagnostic from the owner's connected Huawei test phone. Wait up to 30 seconds and return confirmed device response or an explicit timeout. No screenshots, taps or other operations.",
  inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}}
];
async function executeMcp(request){
 if(!request||request.jsonrpc!=="2.0"||typeof request.method!=="string")return mcpError(request?.id??null,-32600,"Invalid Request");
 const id=request.id;
 if(id===undefined)return null; // notifications have no reply
 if(request.method==="initialize")return mcpResult(id,{protocolVersion:MCP_VERSION,capabilities:{tools:{listChanged:false}},serverInfo:{name:"nexus-android-lab",version:"0.3.0"},instructions:"Only the user's Huawei diagnostic status is available. Never claim remote screen control or screenshot capability."});
 if(request.method==="ping")return mcpResult(id,{});
 if(request.method==="tools/list")return mcpResult(id,{tools:MCP_TOOLS});
 if(request.method==="tools/call"){
  const name=request.params?.name;
  const args=request.params?.arguments??{};
  if(!MCP_TOOLS.some(t=>t.name===name))return mcpError(id,-32602,"Unknown tool");
  if(typeof args!=="object"||args===null||Array.isArray(args)||Object.keys(args).length!==0)return mcpError(id,-32602,"No arguments supported");
  const age=lastDeviceSeen?Math.floor((Date.now()-lastDeviceSeen)/1000):null;
  if(name==="nexus_connection")return mcpResult(id,mcpText({deviceSeen:age!==null,connected:age!==null&&age<30,lastSeenSecondsAgo:age,scope:"read-only diagnosis"}));
  if(age===null||age>90)return mcpResult(id,{...mcpText({ok:false,error:"Huawei not connected recently. Open Nexus Bridge 0.1 and confirm its foreground notification."}),isError:true});
  if(pending.size>=10)return mcpResult(id,{...mcpText({ok:false,error:"Queue full; retry after pending requests."}),isError:true});
  const jobId=randomUUID();
  pending.set(jobId,{id:jobId,command:"status",at:Date.now()});
  for(let i=0;i<30;i++){
   if(results.has(jobId)){const x=results.get(jobId);return mcpResult(id,mcpText({ok:x.ok,device:x.result,confirmed:true}));}
   await new Promise(resolve=>setTimeout(resolve,1000));
  }
  pending.delete(jobId);
  return mcpResult(id,{...mcpText({ok:false,error:"The Huawei did not answer within 30 seconds.",confirmed:false}),isError:true});
 }
 return mcpError(id,-32601,"Method not found");
}
async function mcpHandler(req,res){
 if(!authorized(req,OPERATOR_TOKEN)){
  res.setHeader("WWW-Authenticate",'Bearer realm="nexus-android-lab"');
  return json(res,401,{error:"unauthorized"});
 }
 if(req.method==="GET"){res.setHeader("allow","POST");return json(res,405,{error:"sse_not_supported"});}
 if(req.method!=="POST")return json(res,405,{error:"method_not_allowed"});
 let rpc;
 try{rpc=await readBody(req);}catch(e){return json(res,400,mcpError(null,-32700,"Parse error"));}
 if(Array.isArray(rpc))return json(res,400,mcpError(null,-32600,"Batched requests unsupported"));
 if(!rpc||rpc.jsonrpc!=="2.0"||typeof rpc.method!=="string")return json(res,400,mcpError(rpc?.id??null,-32600,"Invalid Request"));
 const response=await executeMcp(rpc);
 res.setHeader("mcp-protocol-version",MCP_VERSION);
 if(response===null){res.writeHead(202,{"cache-control":"no-store"});res.end();return;}
 return json(res,200,response);
}

const server=http.createServer(async(req,res)=>{
 cleanup();
 const path=new URL(req.url,"http://localhost").pathname;
 if(path==="/mcp")return mcpHandler(req,res);
 if(path==="/"&&req.method==="GET")return html(res,CONSOLE_HTML);
 if(path==="/health"&&req.method==="GET")return json(res,200,{service:"nexus-android-lab",ready:true,mode:"status-only",persistence:"memory"});
 const dev=path.startsWith("/device/"),ops=path.startsWith("/operator/");
 if(!dev&&!ops)return json(res,404,{error:"not_found"});
 if(!authorized(req,dev?DEVICE_TOKEN:OPERATOR_TOKEN))return json(res,401,{error:"unauthorized"});
 try{
  if(path==="/device/next"&&req.method==="GET"){
   lastDeviceSeen=Date.now();
   const job=[...pending.values()].find(x=>!results.has(x.id));
   return json(res,200,job?{has_job:true,id:job.id,command:job.command}:{has_job:false});
  }
  if(path==="/device/result"&&req.method==="POST"){
   const x=await readBody(req);
   if(typeof x.id!=="string"||!pending.has(x.id))return json(res,404,{error:"unknown_job"});
   if(x.ok!==true||typeof x.result!=="string"||x.result.length>500)return json(res,400,{error:"invalid_result"});
   results.set(x.id,{id:x.id,ok:x.ok,result:x.result,at:Date.now()});
   pending.delete(x.id);
   return json(res,200,{ok:true});
  }
  if(path==="/operator/connection"&&req.method==="GET")return json(res,200,{deviceSeen:Boolean(lastDeviceSeen),lastSeenSecondsAgo:lastDeviceSeen?Math.floor((Date.now()-lastDeviceSeen)/1000):null,connected:Boolean(lastDeviceSeen)&&Date.now()-lastDeviceSeen<30000});
  if(path==="/operator/enqueue"&&req.method==="POST"){
   const x=await readBody(req);
   if(x.command!=="status")return json(res,400,{error:"status_only"});
   if(pending.size>=10)return json(res,429,{error:"queue_full"});
   const id=randomUUID();pending.set(id,{id,command:"status",at:Date.now()});
   return json(res,202,{queued:true,id});
  }
  if(path.startsWith("/operator/result/")&&req.method==="GET"){
   const id=path.slice("/operator/result/".length);
   if(!/^[a-f0-9-]{36}$/i.test(id))return json(res,400,{error:"bad_id"});
   const item=results.get(id);
   return json(res,200,item?{done:true,id:item.id,ok:item.ok,result:item.result}:{done:false,id});
  }
  return json(res,404,{error:"not_found"});
 }catch(e){return json(res,e.message==="too_large"?413:400,{error:"invalid_request"});}
});
server.requestTimeout=15000;server.headersTimeout=10000;
server.listen(PORT,"0.0.0.0",()=>console.log("Nexus status-only listening on port",PORT));
