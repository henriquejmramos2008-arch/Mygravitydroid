package pt.nexus.bridge;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.*;
public final class MainActivity extends Activity {
 private EditText endpoint,token;
 @Override public void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setPadding(30,40,30,30);
  TextView title=new TextView(this);
  title.setText("NEXUS ANDROID BRIDGE - 0.1\n\nLaboratorio remoto experimental.\nO controlo funciona APENAS depois de configurar o servidor HTTPS e autorizar a acessibilidade.\n\nNao introduzas contas ou dados pessoais de teste.");
  root.addView(title);
  endpoint=new EditText(this);endpoint.setHint("URL HTTPS do servidor");endpoint.setSingleLine(true);
  endpoint.setText(getPreferences(0).getString("endpoint",""));root.addView(endpoint);
  token=new EditText(this);token.setHint("Token privado do dispositivo");token.setSingleLine(true);token.setInputType(129);root.addView(token);
  Button acc=new Button(this);acc.setText("1. Autorizar acessibilidade");acc.setOnClickListener(v->startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)));root.addView(acc);
  Button start=new Button(this);start.setText("2. INICIAR LAB");start.setOnClickListener(v->{
    String e=endpoint.getText().toString().trim(),t=token.getText().toString().trim();
    if(!e.startsWith("https://") || t.length()<32){Toast.makeText(this,"Precisas de HTTPS e token de pelo menos 32 caracteres",Toast.LENGTH_LONG).show();return;}
    getPreferences(0).edit().putString("endpoint",e).apply();
    Intent i=new Intent(this,AgentService.class);i.putExtra("endpoint",e);i.putExtra("token",t);
    startForegroundService(i);Toast.makeText(this,"Agente iniciado",Toast.LENGTH_SHORT).show();
  });root.addView(start);
  Button stop=new Button(this);stop.setText("PARAR CONTROLO REMOTO");stop.setOnClickListener(v->{
    stopService(new Intent(this,AgentService.class));Toast.makeText(this,"Agente parado",Toast.LENGTH_SHORT).show();
  });root.addView(stop);setContentView(root);
 }
}
