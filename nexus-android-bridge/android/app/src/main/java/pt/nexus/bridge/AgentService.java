package pt.nexus.bridge;
import android.app.*;
import android.content.Intent;
import android.os.*;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
public final class AgentService extends Service {
 private static final int NOTIFY_ID=2026;
 private volatile boolean running=false;private Thread worker;
 @Override public int onStartCommand(Intent intent,int flags,int startId){
  if(intent==null)return START_NOT_STICKY;
  String endpoint=intent.getStringExtra("endpoint"),token=intent.getStringExtra("token");
  boolean allowed=BuildConfig.DEBUG
   ?MainActivity.TEST_ENDPOINT.equals(endpoint)&&MainActivity.TEST_TOKEN.equals(token)
   :endpoint!=null&&endpoint.startsWith("https://")&&token!=null&&token.length()>=32;
  if(!allowed){stopSelf();return START_NOT_STICKY;}
  startForeground(NOTIFY_ID,notice());
  running=false;if(worker!=null)worker.interrupt();running=true;
  worker=new Thread(()->loop(endpoint,token),"nexus-poll");worker.start();return START_NOT_STICKY;
 }
 private Notification notice(){
  NotificationManager mgr=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
  mgr.createNotificationChannel(new NotificationChannel("remote_agent","Nexus Remote Control",NotificationManager.IMPORTANCE_LOW));
  PendingIntent pi=PendingIntent.getActivity(this,0,new Intent(this,MainActivity.class),PendingIntent.FLAG_UPDATE_CURRENT);
  return new Notification.Builder(this,"remote_agent").setSmallIcon(android.R.drawable.stat_sys_upload).setContentTitle(BuildConfig.DEBUG?"Nexus USB test ativo":"Nexus Agent ativo").setContentText("Abre a aplicacao para parar").setContentIntent(pi).setOngoing(true).build();
 }
 private void loop(String endpoint,String token){
  while(running){
   try{
    JSONObject job=request(endpoint+"/device/next","GET",token,null);
    if(job.optBoolean("has_job",false)){
     String id=job.optString("id"),cmd=job.optString("command");
     boolean ok=false;String result="";
     if(cmd.equals("status")){ok=true;result="Android "+Build.VERSION.RELEASE+"; "+Build.MODEL;}
     else if(!BuildConfig.DEBUG&&(cmd.equals("back")||cmd.equals("home")||cmd.equals("tap")||cmd.equals("swipe"))){
      ok=ControlAccessibilityService.action(cmd,job.optInt("x"),job.optInt("y"),job.optInt("x2"),job.optInt("y2"));
      result=ok?"executed":"Accessibility disabled or gesture failed";
     }else result="unsupported command";
     JSONObject response=new JSONObject();response.put("id",id);response.put("ok",ok);response.put("result",result);
     request(endpoint+"/device/result","POST",token,response);
    }
    Thread.sleep(2500);
   }catch(Exception e){android.util.Log.w("NexusUSB", "Connection failed: "+e.getClass().getSimpleName());try{Thread.sleep(7000);}catch(InterruptedException ignored){break;}}
  }
 }
 private JSONObject request(String target,String method,String token,JSONObject payload)throws Exception {
  HttpURLConnection c=(HttpURLConnection)new URL(target).openConnection();
  c.setConnectTimeout(8000);c.setReadTimeout(8000);c.setRequestMethod(method);c.setRequestProperty("Authorization","Bearer "+token);
  if(payload!=null){c.setDoOutput(true);c.setRequestProperty("Content-Type","application/json");
   try(OutputStream out=c.getOutputStream()){out.write(payload.toString().getBytes(StandardCharsets.UTF_8));}}
  int code=c.getResponseCode();if(code<200||code>=300){c.disconnect();throw new IOException("HTTP "+code);}
  ByteArrayOutputStream b=new ByteArrayOutputStream();
  try(InputStream in=c.getInputStream()){byte[] a=new byte[2048];int n;while((n=in.read(a))!=-1){b.write(a,0,n);if(b.size()>65536)throw new IOException("response too large");}}
  c.disconnect();return new JSONObject(b.toString("UTF-8"));
 }
 @Override public void onDestroy(){running=false;if(worker!=null)worker.interrupt();super.onDestroy();}
 @Override public IBinder onBind(Intent intent){return null;}
}
