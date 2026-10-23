# Nexus USB Lab 0.2 - Windows PowerShell 5.1 / 7
# Test strictly over ADB reverse and 127.0.0.1. Not an internet service.
param([string]$AdbPath = ".\adb.exe")
$ErrorActionPreference = "Stop"
$token = "NEXUS_USB_LOCAL_TEST_ONLY_2026_NOT_FOR_INTERNET"
$jobId = "nexus-usb-status-2026"
$port = 8765
$received = $false
if (!(Test-Path $AdbPath)) {
  Write-Host "ERRO: Executa este script na pasta do scrcpy que contem adb.exe." -ForegroundColor Red
  exit 1
}
Write-Host "=== NEXUS USB LAB 0.2 ===" -ForegroundColor Cyan
$devices = & $AdbPath devices
if ($LASTEXITCODE -ne 0 -or -not ($devices -match "\s+device\s*$")) {
  Write-Host "ERRO: Huawei nao esta autorizado no ADB." -ForegroundColor Red
  exit 2
}
& $AdbPath reverse tcp:8765 tcp:8765 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "ERRO: adb reverse falhou." -ForegroundColor Red; exit 3 }
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
try {
  $listener.Start()
  Write-Host "Servidor local pronto: 127.0.0.1:8765" -ForegroundColor Green
  Write-Host "Agora abre 'Nexus USB Lab 0.2' no Huawei e carrega 'INICIAR TESTE USB'."
  Write-Host "Este teste envia apenas 'status'. Nao apaga nem altera dados."
  Write-Host "Para cancelar, prime Ctrl+C."
  $utf8 = [System.Text.UTF8Encoding]::new($false)
  while (!$received) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 15000
      $client.SendTimeout = 15000
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, $utf8, $false, 4096, $true)
      $request = $reader.ReadLine()
      if ([string]::IsNullOrEmpty($request)) { continue }
      $parts = $request.Split(' ')
      $method = $parts[0]
      $path = $parts[1]
      $headers = @{}
      while ($true) {
        $line = $reader.ReadLine()
        if ($null -eq $line -or $line.Length -eq 0) { break }
        $colon = $line.IndexOf(':')
        if ($colon -gt 0) { $headers[$line.Substring(0,$colon).ToLowerInvariant()] = $line.Substring($colon+1).Trim() }
      }
      $length = 0
      if ($headers.ContainsKey('content-length')) { $length = [int]$headers['content-length'] }
      if ($length -gt 4096) { throw "Corpo de pedido demasiado grande" }
      $body = ""
      if ($length -gt 0) {
        $chars = New-Object 'char[]' $length
        $index=0
        while ($index -lt $length) {
          $n = $reader.Read($chars,$index,$length-$index)
          if ($n -le 0) { throw "Pedido HTTP incompleto" }
          $index += $n
        }
        $body = -join $chars
      }
      $code = "200 OK"
      $response = '{"ok":true}'
      if ($headers['authorization'] -cne ("Bearer " + $token)) {
        $code="401 Unauthorized"; $response='{"error":"unauthorized"}'
      } elseif ($method -eq "GET" -and $path -eq "/device/next") {
        $response = '{"has_job":true,"id":"'+$jobId+'","command":"status"}'
      } elseif ($method -eq "POST" -and $path -eq "/device/result") {
        $data = $body | ConvertFrom-Json
        if ($data.id -ne $jobId) {
          $code="400 Bad Request"; $response='{"error":"wrong_job_id"}'
        } elseif ($data.ok -eq $true -and $data.result -match "^Android ") {
          Write-Host ""
          Write-Host "TESTE PASSOU: mensagem recebida do Huawei" -ForegroundColor Green
          Write-Host ("Resposta: " + $data.result)
          $received = $true
        } else {
          Write-Host "Resposta de erro do agente: $body" -ForegroundColor Yellow
          $received = $true
        }
      } else { $code="404 Not Found"; $response='{"error":"not_found"}' }
      $responseBytes = $utf8.GetBytes($response)
      $crlf = [string][char]13 + [string][char]10
      $headerText = "HTTP/1.1 $code" + $crlf + "Content-Type: application/json; charset=utf-8" + $crlf + "Content-Length: " + $responseBytes.Length + $crlf + "Connection: close" + $crlf + "Cache-Control: no-store" + $crlf + $crlf
      $headerBytes = $utf8.GetBytes($headerText)
      $stream.Write($headerBytes,0,$headerBytes.Length)
      $stream.Write($responseBytes,0,$responseBytes.Length)
      $stream.Flush()
    } catch {
      Write-Host ("Pedido falhou: " + $_.Exception.Message) -ForegroundColor Yellow
    } finally { $client.Close() }
  }
  Write-Host "Concluido. Podes parar o Nexus USB Lab no Huawei."
} finally {
  $listener.Stop()
  & $AdbPath reverse --remove tcp:8765 2>$null | Out-Null
}
