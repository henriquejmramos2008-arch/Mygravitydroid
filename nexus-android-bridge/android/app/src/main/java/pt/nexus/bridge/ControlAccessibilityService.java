package pt.nexus.bridge;
import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.view.accessibility.AccessibilityEvent;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
public final class ControlAccessibilityService extends AccessibilityService {
 static volatile ControlAccessibilityService active;
 @Override protected void onServiceConnected(){super.onServiceConnected();active=this;}
 @Override public void onAccessibilityEvent(AccessibilityEvent event){}
 @Override public void onInterrupt(){}
 @Override public void onDestroy(){if(active==this)active=null;super.onDestroy();}
 static boolean action(String type,int x,int y,int x2,int y2)throws InterruptedException{
  ControlAccessibilityService a=active;if(a==null)return false;
  if(type.equals("home"))return a.performGlobalAction(GLOBAL_ACTION_HOME);
  if(type.equals("back"))return a.performGlobalAction(GLOBAL_ACTION_BACK);
  if(!type.equals("tap")&&!type.equals("swipe"))return false;
  if(x<0||y<0||x2<0||y2<0||x>4096||y>4096||x2>4096||y2>4096)return false;
  Path p=new Path();p.moveTo(x,y);if(type.equals("swipe"))p.lineTo(x2,y2);
  GestureDescription d=new GestureDescription.Builder().addStroke(new GestureDescription.StrokeDescription(p,0,type.equals("tap")?100:450)).build();
  CountDownLatch latch=new CountDownLatch(1);final boolean[] ok={false};
  a.dispatchGesture(d,new GestureResultCallback(){
   @Override public void onCompleted(GestureDescription g){ok[0]=true;latch.countDown();}
   @Override public void onCancelled(GestureDescription g){latch.countDown();}
  },null);
  return latch.await(3,TimeUnit.SECONDS)&&ok[0];
 }
}
