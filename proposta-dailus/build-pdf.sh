#!/usr/bin/env bash
# Gera um PDF offline (apresentacao + loja + catalogo) do deal briefing Nexia x Dailus,
# capturando como um navegador desktop largo (1440px @2x), sem margens, fiel ao site.
# Requer: Google Chrome, Node + puppeteer-core, img2pdf e o servidor local (porta 8802).
#   Uso: bash proposta-dailus/build-pdf.sh
set -u

DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/pdf"
mkdir -p "$OUT"

echo "1/2 capturando telas em alta resolucao..."
node "$DIR/capture.js" || { echo "falha na captura"; exit 1; }

echo "2/2 montando o PDF (sem margens)..."
# 2880px de largura (1440 @2x) -> ~15in a 192dpi
img2pdf --dpi 192 --pagesize "" "$OUT"/frames/*.jpg -o "$OUT/NEXIA-DAILUS-dossie.pdf" 2>/dev/null \
  || img2pdf --dpi 192 "$OUT"/frames/*.jpg -o "$OUT/NEXIA-DAILUS-dossie.pdf"

echo "PRONTO: $OUT/NEXIA-DAILUS-dossie.pdf ($(du -h "$OUT/NEXIA-DAILUS-dossie.pdf" | cut -f1))"
