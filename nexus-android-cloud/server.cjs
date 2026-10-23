"use strict";
const http = require("node:http");
const {randomUUID,timingSafeEqual}=require("node:crypto");
const PORT=Number(process.env.PORT||8765);
const DEVICE_TOKEN=process.env.DEVICE_TOKEN||"";
const OPERATOR_TOKEN=process.env.OPERATOR_TOKEN||"";
const pending=new Map(),results=new Map();
const WINDOW=10*60*1000;
function eq(a,b){const x=Buffer.from(a||""),y=Buffer.from(b||"");return !!b&&x.length===y.length&&timingSafeEqual(x,y);}
function json(res,code,data){res.writeHead(code,{"content-type":"application/json;charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});res.end(JSON.stringify(data));}
function authorized(req,secret){return eq((req.headers.authorization||"").replace(/^Bearer /i,""),secret);}
async function readBody(req){let n=0,s="";for await(const c of req){n+=c.length;if(n>2048)throw Error("too_large");s+=c;}return JSON.parse(s||"{}");}
function cleanup(){for(const [id,job] of pending){if(Date.now()-job.at>WINDOW)pending.delete(id);}for(const [id,x] of results){if(Date.now()-x.at>WINDOW)results.delete(id);}}
if(DEVICE_TOKEN.length<32||OPERATOR_TOKEN.length<32||eq(DEVICE_TOKEN,OPERATOR_TOKEN)) {
 console.error("Missing valid, distinct DEVICE_TOKEN and OPERATOR_TOKEN (>=32 chars)");process.exit(1);
}
const server=http.createServer(async(req,res)=>{
 cleanup();
 const path=new URL(req.url,"http://localhost").pathname;
 if(path==="/health"&&req.method==="GET")return json(res,200,{service:"nexus-android-lab",ready:true,mode:"status-only",persistence:"memory"});
 const dev=path.startsWith("/device/"),ops=path.startsWith("/operator/");
 if(!dev&&!ops)return json(res,404,{error:"not_found"});
 if(!authorized(req,dev?DEVICE_TOKEN:OPERATOR_TOKEN))return json(res,401,{error:"unauthorized"});
 try{
  if(path==="/device/next"&&req.method==="GET"){
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
