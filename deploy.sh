#!/bin/bash

echo "🚀 배포 시작..."

# Git 최신 코드 가져오기
git pull origin main

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# PM2 재시작
pm2 restart tarot-app

echo "✅ 배포 완료!"
