#!/bin/bash

# PM2 설정 테스트 스크립트
# Rocky Linux 9 서버에서 실행하세요

echo "🔍 PM2 설정 검증 시작..."
echo ""

# 1. Node.js 버전 확인
echo "1️⃣ Node.js 버전 확인"
node -v
npm -v
echo ""

# 2. PM2 설치 확인
echo "2️⃣ PM2 설치 확인"
if command -v pm2 &> /dev/null; then
    pm2 -v
    echo "✅ PM2가 설치되어 있습니다."
else
    echo "❌ PM2가 설치되지 않았습니다. 다음 명령어로 설치하세요:"
    echo "npm install -g pm2"
    exit 1
fi
echo ""

# 3. 빌드 디렉토리 확인
echo "3️⃣ 빌드 출력 디렉토리 확인"
if [ -d ".output" ]; then
    echo "✅ .output 디렉토리가 존재합니다."
    if [ -f ".output/server/index.mjs" ]; then
        echo "✅ .output/server/index.mjs 파일이 존재합니다."
    else
        echo "❌ .output/server/index.mjs 파일이 없습니다."
        echo "npm run build를 실행하세요."
        exit 1
    fi
else
    echo "❌ .output 디렉토리가 없습니다."
    echo "npm run build를 실행하세요."
    exit 1
fi
echo ""

# 4. ecosystem.config.cjs 확인
echo "4️⃣ ecosystem.config.cjs 파일 확인"
if [ -f "ecosystem.config.cjs" ]; then
    echo "✅ ecosystem.config.cjs 파일이 존재합니다."
    echo ""
    echo "📄 설정 내용:"
    cat ecosystem.config.cjs
else
    echo "❌ ecosystem.config.cjs 파일이 없습니다."
    exit 1
fi
echo ""

# 5. PM2로 앱 시작 테스트
echo "5️⃣ PM2로 앱 시작 테스트"
echo "다음 명령어로 앱을 시작할 수 있습니다:"
echo "pm2 start ecosystem.config.cjs"
echo ""
echo "시작 후 다음 명령어로 상태를 확인하세요:"
echo "pm2 status"
echo "pm2 logs tarot-app"
echo ""

echo "✅ 모든 검증이 완료되었습니다!"
