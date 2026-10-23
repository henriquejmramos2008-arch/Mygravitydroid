package pt.nexus.bridge;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.*;
public final class MainActivity extends Activity {
 static final String TEST_ENDPOINT = "http://127.0.0.1:8765";
 static final String TEST_TOKEN = "NEXUS_USB_LOCAL_TEST_ONLY_2026_NOT_FOR_INTERNET";
 private EditText endpoint, token;
 @Override public void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setPadding(30,40,30,30);
  TextView title=new TextView(this);
  title.setText(BuildConfig.DEBUG
    ? "NEXUS USB LAB 0.2\n\nTESTE LOCAL apenas por USB/ADB.\nNao funciona pela internet.\nNo PC inicia o servidor primeiro e depois prime INICIAR TESTE."
    : "NEXUS ANDROID BRIDGE 0.2\n\nVersao remota experimental.\nExige servidor HTTPS e credenciais privadas.");
  root.addView(title);
  endpoint=new EditText(this);endpoint.setHint("URL do servidor");endpoint.setSingleLine(true);
  endpoint.setText(BuildConfig.DEBUG?TEST_ENDPOINT:getPreferences(0).getString("endpoint",""));endpoint.setEnabled(!BuildConfig.DEBUG);root.addView(endpoint);
  token=new EditText(this);token.setHint("Token privado do dispositivo");token.setSingleLine(true);token.setInputType(129);
  if(BuildConfig.DEBUG){token.setText(TEST_TOKEN);token.setEnabled(false);}root.addView(token);
  Button acc=new Button(this);acc.setText("Acessibilidade (para testes de gestos futuros)");
  acc.setOnClickListener(v->startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)));root.addView(acc);
  Button start=new Button(this);start.setText(BuildConfig.DEBUG?"INICIAR TESTE USB":"INICIAR LAB");start.setOnClickListener(v->{
    String e=endpoint.getText().toString().trim(),t=token.getText().toString().trim();
    boolean valid=BuildConfig.DEBUG?(e.equals(TEST_ENDPOINT)&&t.equals(TEST_TOKEN)):(e.startsWith("https://")&&t.length()>=32);
    if(!valid){Toast.makeText(this,"Endereco ou token nao permitido",Toast.LENGTH_LONG).show();return;}
    if(!BuildConfig.DEBUG)getPreferences(0).edit().putString("endpoint",e).apply();
    Intent i=new Intent(this,AgentService.class);i.putExtra("endpoint",e);i.putExtra("token",t);
    startForegroundService(i);Toast.makeText(this,"Agente iniciado",Toast.LENGTH_SHORT).show();
  });root.addView(start);
  Button stop=new Button(this);stop.setText("PARAR AGENTE");stop.setOnClickListener(v->{
    stopService(new Intent(this,AgentService.class));Toast.makeText(this,"Agente parado",Toast.LENGTH_SHORT).show();
  });root.addView(stop);setContentView(root);
 }
}
