"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const http=require("node:http");
const oauth=require("../oauth.cjs");
const token="test_operator_token_abcdefghijklmnopqrstuvwxyz";
const client="nexus-chatgpt-operator";
test("single-owner authorization code PKCE flow",async()=>{
 const s=http.createServer((req,res)=>{
   oauth.handle(req,res,new URL(req.url,"http://localhost").pathname,token).then(x=>{if(x===false){res.writeHead(404);res.end();}}).catch(e=>{res.writeHead(500);res.end();});
 });
 await new Promise(resolve=>s.listen(0,"127.0.0.1",resolve));
 const base="http://127.0.0.1:"+s.address().port;
 try{
  const get=(path,opts)=>fetch(base+path,{redirect:"manual",...opts});
  const verifier=crypto.randomBytes(48).toString("base64url");
  const challenge=crypto.createHash("sha256").update(verifier).digest("base64url");
  const params=new URLSearchParams({response_type:"code",client_id:client,
   redirect_uri:"https://chatgpt.com/connector_platform_oauth_redirect",
   code_challenge:challenge,code_challenge_method:"S256",scope:"nexus.read",
   resource:oauth.RESOURCE,state:"test_state"});
  const meta=await get("/.well-known/oauth-authorization-server");
  assert.equal(meta.status,200);
  assert.ok((await meta.json()).code_challenge_methods_supported.includes("S256"));
  const a=await get("/oauth/authorize?"+params);
  assert.equal(a.status,200);
  const html=await a.text();
  const tx=html.match(/name="tx" value="([^"]+)"/)?.[1];assert.ok(tx);
  const bad=await get("/oauth/approve",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({tx,operator_token:"bad"})});
  assert.equal(bad.status,403);
  const again=await get("/oauth/authorize?"+params);
  const next=(await again.text()).match(/name="tx" value="([^"]+)"/)?.[1];assert.ok(next);
  const accepted=await get("/oauth/approve",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({tx:next,operator_token:token})});
  assert.equal(accepted.status,303);
  const u=new URL(accepted.headers.get("location"));
  assert.equal(u.origin,"https://chatgpt.com");
  assert.equal(u.searchParams.get("state"),"test_state");
  assert.equal(u.searchParams.get("iss"),oauth.ISSUER);
  const code=u.searchParams.get("code");assert.ok(code);
  const login=await get("/oauth/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"authorization_code",client_id:client,redirect_uri:"https://chatgpt.com/connector_platform_oauth_redirect",resource:oauth.RESOURCE,code,code_verifier:verifier})});
  assert.equal(login.status,200);
  const pair=await login.json();
  assert.equal(pair.token_type,"Bearer");
  assert.ok(pair.access_token.length>=32);
  assert.ok(pair.refresh_token.length>=32);
  assert.ok(oauth.oauthAccess({headers:{authorization:"Bearer "+pair.access_token}}));
  assert.equal(oauth.oauthAccess({headers:{authorization:"Bearer "+token}}),false);
  const replay=await get("/oauth/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"authorization_code",client_id:client,redirect_uri:"https://chatgpt.com/connector_platform_oauth_redirect",resource:oauth.RESOURCE,code,code_verifier:verifier})});
  assert.equal(replay.status,400);
  const refresh=await get("/oauth/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"refresh_token",client_id:client,resource:oauth.RESOURCE,refresh_token:pair.refresh_token})});
  assert.equal(refresh.status,200);
  const replacement=await refresh.json();assert.notEqual(replacement.refresh_token,pair.refresh_token);
 }finally{await new Promise(resolve=>s.close(resolve));}
});
