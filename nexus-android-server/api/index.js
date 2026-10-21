import {list,put} from '@vercel/blob';
import {timingSafeEqual} from 'node:crypto';
const allowed=new Set(['status','home','back','tap','swipe']);
function equal(a,b){if(typeof a!=='string'||typeof b!=='string')return false;let x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function auth(req,role){const t=String(req.headers.authorization||'').replace(/^Bearer /i,'');return Boolean(process.env[role])&&equal(t,process.env[role]);}
function out(res,code,obj){res.statusCode=code;res.setHeader('content-type','application/json');res.setHeader('cache-control','no-store');res.end(JSON.stringify(obj));}
function safe(job){if(!allowed.has(job.command))return false;if(['tap','swipe'].includes(job.command))return ['x','y','x2','y2'].every(k=>Number.isInteger(job[k])&&job[k]>=0&&job[k]<=4096);return true;}
async function json(req){let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)throw Error('too large');}return JSON.parse(body||'{}');}
async function readBlob(blob){const r=await fetch(blob.url,{headers:{authorization:'Bearer '+process.env.BLOB_READ_WRITE_TOKEN}});if(!r.ok)throw Error('blob fetch '+r.status);return r.json();}
async function scan(prefix){let cursor;const result=[];do{const p=await list({prefix,limit:100,cursor});result.push(...p.blobs);cursor=p.hasMore?p.cursor:undefined;}while(cursor&&result.length<500);return result;}
export default async function handler(req,res){
 try{
  const path=(req.url||'').split('?')[0];
  if(path==='/health')return out(res,200,{service:'nexus-android-lab',status:'online',storage:Boolean(process.env.BLOB_READ_WRITE_TOKEN)});
  const device=path.startsWith('/device/');
  const role=device?'DEVICE_TOKEN':'OPERATOR_TOKEN';
  if(!auth(req,role))return out(res,401,{error:'unauthorized'});
  if(!process.env.BLOB_READ_WRITE_TOKEN)return out(res,503,{error:'storage_not_configured'});
  if(path==='/operator/enqueue'&&req.method==='POST'){
   const body=await json(req);if(!safe(body))return out(res,400,{error:'unsupported_or_invalid_command'});
   const id=crypto.randomUUID();const job={id,command:body.command,x:body.x||0,y:body.y||0,x2:body.x2||0,y2:body.y2||0,createdAt:new Date().toISOString()};
   await put('jobs/'+id+'.json',JSON.stringify(job),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
   return out(res,202,{queued:true,id});
  }
  if(path==='/device/next'&&req.method==='GET'){
   const jobs=await scan('jobs/');const results=await scan('results/');
   const completed=new Set(results.map(x=>x.pathname.split('/').pop().replace('.json','')));
   const pending=jobs.filter(x=>!completed.has(x.pathname.split('/').pop().replace('.json',''))).sort((a,b)=>a.uploadedAt-b.uploadedAt);
   if(!pending.length)return out(res,200,{has_job:false});
   const job=await readBlob(pending[0]);return out(res,200,{has_job:true,...job});
  }
  if(path==='/device/result'&&req.method==='POST'){
   const body=await json(req);if(!/^[0-9a-f-]{36}$/i.test(body.id||''))return out(res,400,{error:'invalid_id'});
   const results=await scan('results/'+body.id+'.json');if(results.length)return out(res,200,{ok:true,duplicate:true});
   await put('results/'+body.id+'.json',JSON.stringify({id:body.id,ok:body.ok===true,result:String(body.result||'').slice(0,1000),finishedAt:new Date().toISOString()}),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
   return out(res,200,{ok:true});
  }
  if(path==='/operator/results'&&req.method==='GET'){
   const results=await scan('results/');const items=[];
   for(const blob of results.slice(-30)){items.push(await readBlob(blob));}
   return out(res,200,{items});
  }
  return out(res,404,{error:'not_found'});
 }catch(e){return out(res,500,{error:'server_error'});}
}
