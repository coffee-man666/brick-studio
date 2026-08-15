#!/bin/sh
# 部署到 Vercel production,并把 brick-studio.vercel.app 指向最新部署
set -e
cd "$(dirname "$0")/.."

vercel deploy --prod -y

url=$(vercel ls --format json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log("https://"+JSON.parse(s).deployments[0].url))')
vercel alias set "$url" brick-studio.vercel.app

echo ""
echo "✓ 已上线: https://brick-studio.vercel.app"
