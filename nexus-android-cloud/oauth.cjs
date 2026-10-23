"use strict";
// Private single-owner OAuth 2.1 prototype for MCP.
// Public OAuth client, authorization-code + S256 PKCE, no secrets in source.
// Authorization codes and tokens are ephemeral and require re-linking after process restart.
const crypto=require("node:crypto");
const ISSUER="https://nexus-android-status-lab.onrender.com";
const RESOURCE=ISSUER;
const CLIENT_ID="nexus-chatgpt-operator";
const CALLBACK="https://chatgpt.com/connector_platform_oauth_redirect";
const SCOPE="nexus.read";
const transactions=new Map(),codes=new Map(),tokens=new Map(),refreshTokens=new Map();
let failed=0,lastFailure=0;
const nonce=()=>crypto.randomBytes(32).toString("base64url");
const safe=(a,b)=>{
  if(typeof a!=="string"||typeof b!=="string")return false;
  const x=Buffer.from(a),y=Buffer.from(b);
  return x.length===y.length&&crypto.timingSafeEqual(x,y);
};
const clean=()=>{
  const now=Date.now();
  for(const m of [transactions,codes,tokens,refreshTokens])for(const [id,item]of m)if(item.exp<=now)m.delete(id);
};
function send(res,status,obj,headers={}){
  res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","pragma":"no-cache","x-content-type-options":"nosniff","referrer-policy":"no-referrer",...headers});
  res.end(JSON.stringify(obj));
}
function page(res,status,body){
  res.writeHead(status,{"content-type":"text/html; charset=utf-8","cache-control":"no-store","referrer-policy":"no-referrer","x-frame-options":"DENY","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'","x-content-type-options":"nosniff"});
  res.end("<!doctype html><html lang=\"pt\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Nexus OAuth</title><style>body{font:16px system-ui;background:#0c1423;color:#fff;max-width:580px;margin:8vh auto;padding:22px}section{border:1px solid #4b5e81;background:#17253a;padding:26px;border-radius:12px}input,button{font:inherit;padding:12px;border-radius:8px;box-sizing:border-box;width:100%;margin:12px 0}button{background:#467bff;border:0;color:white;cursor:pointer}input{background:#0c1423;border:1px solid #6c809a;color:#fff}small{color:#b9c8e2}</style><section>"+body+"</section></html>");
}
const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function bodyText(req,max=4096){
  let s="",n=0;
  for await(const chunk of req){n+=chunk.length;if(n>max)throw new Error("body_too_large");s+=chunk;}
  return s;
}
function validAuthorize(q){
  return q.get("response_type")==="code"&&q.get("client_id")===CLIENT_ID&&q.get("redirect_uri")===CALLBACK
    &&q.get("code_challenge_method")==="S256"&&/^[A-Za-z0-9_-]{43}$/.test(q.get("code_challenge")||"")
    &&q.get("resource")===RESOURCE&&(q.get("scope")||"").split(/\s+/).includes(SCOPE)
    &&(q.get("state")||"").length<=512;
}
function tokensForClient(){
  const access=nonce(),refresh=nonce(),now=Date.now();
  tokens.set(access,{client:CLIENT_ID,scope:SCOPE,resource:RESOURCE,exp:now+45*60*1000});
  refreshTokens.set(refresh,{client:CLIENT_ID,scope:SCOPE,resource:RESOURCE,exp:now+7*24*60*60*1000});
  return {access_token:access,token_type:"Bearer",expires_in:45*60,refresh_token:refresh,scope:SCOPE};
}
function oauthAccess(req){
  const auth=req.headers.authorization||"";
  if(!auth.startsWith("Bearer "))return false;
  clean();
  const tok=tokens.get(auth.slice(7));
  return !!tok&&tok.exp>Date.now()&&tok.scope===SCOPE&&tok.resource===RESOURCE&&tok.client===CLIENT_ID;
}
function challenge(res){
  send(res,401,{error:"unauthorized"},{'www-authenticate': 'Bearer resource_metadata="'+ISSUER+'/.well-known/oauth-protected-resource", scope="'+SCOPE+'"'});
}
async function handle(req,res,path,operatorToken){
  clean();
  if(path==="/.well-known/oauth-protected-resource"||path==="/.well-known/oauth-protected-resource/mcp"){
    if(req.method!=="GET")return send(res,405,{error:"method_not_allowed"});
    return send(res,200,{resource:RESOURCE,authorization_servers:[ISSUER],scopes_supported:[SCOPE]});
  }
  if(path==="/.well-known/oauth-authorization-server"||path==="/.well-known/openid-configuration"){
    if(req.method!=="GET")return send(res,405,{error:"method_not_allowed"});
    return send(res,200,{issuer:ISSUER,authorization_endpoint:ISSUER+"/oauth/authorize",token_endpoint:ISSUER+"/oauth/token",response_types_supported:["code"],grant_types_supported:["authorization_code","refresh_token"],code_challenge_methods_supported:["S256"],token_endpoint_auth_methods_supported:["none"],authorization_response_iss_parameter_supported:true,scopes_supported:[SCOPE]});
  }
  if(path==="/oauth/authorize"&&req.method==="GET"){
    const q=new URL(req.url,ISSUER).searchParams;
    if(!validAuthorize(q))return page(res,400,"<h2>Pedido OAuth inválido</h2><p>O ChatGPT enviou uma ligação incompatível. Não introduzas credenciais nesta página.</p>");
    const id=nonce();transactions.set(id,{client:CLIENT_ID,redirect:q.get("redirect_uri"),challenge:q.get("code_challenge"),state:q.get("state")||"",exp:Date.now()+5*60*1000,tries:0});
    return page(res,200,'<h2>Ligar Nexus ao ChatGPT</h2><p>Autorizar apenas <strong>diagnósticos de estado</strong> do Huawei. Sem acesso ao ecrã, sem instalação de APKs.</p><form method="post" action="/oauth/approve"><input type="hidden" name="tx" value="'+esc(id)+'"><label>Token do operador Nexus (do teu ficheiro privado)</label><input type="password" name="operator_token" required autocomplete="off" minlength="32"><button type="submit">Autorizar ligação</button></form><small>O token é enviado por HTTPS ao teu próprio servidor. Não fica guardado no navegador.</small>');
  }
  if(path==="/oauth/approve"&&req.method==="POST"){
    let v;
    try{v=new URLSearchParams(await bodyText(req));}catch{return page(res,400,"Pedido demasiado grande");}
    const id=v.get("tx")||"",tx=transactions.get(id);
    if(!tx||tx.exp<Date.now())return page(res,400,"Sessão expirada. Volta ao ChatGPT e inicia novamente a ligação.");
    if(lastFailure&&Date.now()-lastFailure<60*1000&&failed>=8)return page(res,429,"Demasiadas tentativas. Experimenta novamente mais tarde.");
    if(++tx.tries>4){transactions.delete(id);return page(res,429,"Demasiadas tentativas. Reinicia a ligação no ChatGPT.");}
    if(!safe(v.get("operator_token")||"",operatorToken)){
      if(Date.now()-lastFailure>60*1000)failed=0;
      failed++;lastFailure=Date.now();
      return page(res,403,"<h2>Token incorreto</h2><p>Volta ao ChatGPT e recomeça a autorização. Não coloques tokens numa conversa.</p>");
    }
    failed=0;transactions.delete(id);
    const code=nonce();codes.set(code,{...tx,exp:Date.now()+90*1000});
    const u=new URL(tx.redirect);u.searchParams.set("code",code);u.searchParams.set("iss",ISSUER);if(tx.state)u.searchParams.set("state",tx.state);
    res.writeHead(303,{location:u.toString(),"cache-control":"no-store","referrer-policy":"no-referrer"});res.end();
    return;
  }
  if(path==="/oauth/token"&&req.method==="POST"){
    let q;try{q=new URLSearchParams(await bodyText(req));}catch{return send(res,400,{error:"invalid_request"});}
    if(q.get("client_id")!==CLIENT_ID)return send(res,401,{error:"invalid_client"});
    if(q.get("resource")!==RESOURCE)return send(res,400,{error:"invalid_target"});
    if(q.get("grant_type")==="authorization_code"){
      const code=q.get("code")||"",record=codes.get(code);
      if(!record||record.exp<Date.now()||q.get("redirect_uri")!==record.redirect)return send(res,400,{error:"invalid_grant"});
      // Consume the code even when verification fails.
      codes.delete(code);
      const verifier=q.get("code_verifier")||"";
      if(!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier))return send(res,400,{error:"invalid_grant"});
      const derived=crypto.createHash("sha256").update(verifier).digest("base64url");
      if(!safe(derived,record.challenge))return send(res,400,{error:"invalid_grant"});
      return send(res,200,tokensForClient());
    }
    if(q.get("grant_type")==="refresh_token"){
      const old=q.get("refresh_token")||"",t=refreshTokens.get(old);
      if(!t||t.exp<Date.now())return send(res,400,{error:"invalid_grant"});
      refreshTokens.delete(old);return send(res,200,tokensForClient());
    }
    return send(res,400,{error:"unsupported_grant_type"});
  }
  return false;
}
module.exports={handle,oauthAccess,challenge,ISSUER,RESOURCE,SCOPE};
