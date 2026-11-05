# Generate distributable PCM WAV narration; no speech service is required at runtime.
# Run from the project root: powershell -NoProfile -File scripts/build-narration.ps1
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot 'narration-manifest.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Could not build narration manifest.' }
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice('Microsoft Zira Desktop')
$speaker.Rate = -1
$outputDir = Join-Path $PSScriptRoot '../public/narration'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$lines = Get-Content (Join-Path $PSScriptRoot 'narration.json') -Raw -Encoding UTF8 | ConvertFrom-Json
try {
  foreach ($line in $lines.PSObject.Properties) {
    $speaker.SetOutputToWaveFile((Join-Path $outputDir ($line.Name + '.wav')))
    $speaker.Speak([string]$line.Value)
    $speaker.SetOutputToNull()
  }
} finally { $speaker.Dispose() }
