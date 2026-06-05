#!/bin/bash
# Script de deploy para EC2 — ParkSmart + Parking API
# Ejecutar desde la raíz del repositorio: bash deploy.sh
set -e

echo "==> Construyendo frontend..."
cd parksmart-sede-maipú
npm install
npm run build

echo "==> Copiando build al servidor..."
rm -rf ../parking-api/public
cp -r dist ../parking-api/public

echo "==> Instalando dependencias de la API..."
cd ../parking-api
npm install --omit=dev

echo "==> Reiniciando servicio con PM2..."
pm2 restart parking-api 2>/dev/null || pm2 start src/app.js --name parking-api

pm2 save
echo ""
echo "Deploy completo. App corriendo en http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost')"
