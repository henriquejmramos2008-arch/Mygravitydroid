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
const server=http.createServer(async(req,res)=>{
 cleanup();
 const path=new URL(req.url,"http://localhost").pathname;
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
