# VPS 서버 배포 가이드

이 문서는 타로 카드 Nuxt 3 애플리케이션을 VPS 서버(AWS EC2, DigitalOcean, 카페24 등)에 배포하는 방법을 설명합니다.

## 사전 준비사항

- VPS 서버 (Rocky Linux 9)
- 도메인 (선택사항)
- SSH 접속 권한

## 1. 서버 초기 설정

### 1.1 서버 접속
```bash
ssh root@your-server-ip
# 또는
ssh username@your-server-ip
```

### 1.2 패키지 업데이트
```bash
sudo dnf update -y
sudo dnf upgrade -y
```

### 1.3 Node.js 설치 (v18 이상)
```bash
# NVM을 통한 Node.js 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js LTS 버전 설치
nvm install --lts
nvm use --lts

# 설치 확인
node -v
npm -v
```

### 1.4 PM2 설치 (프로세스 관리자)
```bash
npm install -g pm2
```

### 1.5 Git 설치
```bash
sudo dnf install git -y
```

## 2. 애플리케이션 배포

### 2.1 프로젝트 클론
```bash
# 홈 디렉토리로 이동
cd ~

# Git 저장소 클론 (본인의 저장소 주소로 변경)
git clone https://github.com/your-username/tarot.git
cd tarot
```

### 2.2 의존성 설치
```bash
npm install
```

### 2.3 프로덕션 빌드
```bash
npm run build
```

### 2.4 PM2로 애플리케이션 실행

#### ecosystem.config.cjs 파일 확인
프로젝트에 이미 `ecosystem.config.cjs` 파일이 포함되어 있습니다. 내용은 다음과 같습니다:

```javascript
module.exports = {
  apps: [{
    name: 'tarot-app',
    script: './.output/server/index.mjs',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,ecosystem.config.cjs
}
```

**중요 설정 설명:**
- `script`: Nuxt 3 빌드 후 생성되는 서버 진입점
- `cwd`: 현재 디렉토리를 작업 디렉토리로 설정
- `instances: 1`: 단일 인스턴스 실행 (안정성 우선)
- `exec_mode: 'fork'`: fork 모드 사용 (cluster보다 안정적)
- `HOST: '0.0.0.0'`: 모든 네트워크 인터페이스에서 접속 허용

#### PM2 설정 검증 (선택사항)

프로젝트에 이미 `test-pm2.sh` 검증 스크립트가 포함되어 있습니다. 이 스크립트는 PM2 실행 전에 모든 설정이 올바른지 확인합니다.

```bash
# 검증 스크립트 실행 권한 부여
chmod +x test-pm2.sh

# 설정 검증 실행
./test-pm2.sh
```

만약 `test-pm2.sh` 파일이 없다면, 프로젝트 루트에서 다음 명령어로 생성하세요:

```bash
cat > test-pm2.sh << 'EOF'
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
EOF

# 실행 권한 부여
chmod +x test-pm2.sh
```

#### PM2로 앱 시작
```bash
# 앱 시작
pm2 start ecosystem.config.cjs

# PM2 설정 저장 (서버 재시작 시 자동 실행)
pm2 save

# 부팅 시 자동 시작 설정
pm2 startup
```

마지막 `pm2 startup` 명령어 실행 후 나오는 명령어를 복사해서 실행하세요.
예: `sudo env PATH=$PATH:/home/username/.nvm/versions/node/v20.x.x/bin pm2 startup ...`

### 2.5 PM2 주요 명령어
```bash
# 앱 상태 확인
pm2 status

# 로그 확인
pm2 logs tarot-app

# 앱 재시작
pm2 restart tarot-app

# 앱 중지
pm2 stop tarot-app

# 앱 삭제
pm2 delete tarot-app
```

## 3. Nginx 설정 (리버스 프록시)

### 3.1 Nginx 설치
```bash
sudo dnf install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3.2 Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/conf.d/tarot.conf
```

아래 내용을 입력합니다:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 도메인이 있다면 입력, 없으면 서버 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.3 기본 설정 파일 확인 및 수정

Rocky Linux의 Nginx는 `/etc/nginx/nginx.conf`에서 기본 서버 설정이 있을 수 있습니다. 이를 확인하고 수정해야 합니다.

```bash
# 기본 nginx.conf 파일 확인
sudo cat /etc/nginx/nginx.conf
```

`nginx.conf` 파일의 `http` 블록 안에 `server` 블록이 있다면 주석 처리하거나 제거해야 합니다.

```bash
# nginx.conf 파일 수정
sudo nano /etc/nginx/nginx.conf
```

`http` 블록 안의 기본 `server` 블록을 찾아서 **주석 처리** 하거나 **삭제**하세요:

```nginx
http {
    # ... 기타 설정들 ...

    # 아래 server 블록을 주석 처리하거나 삭제
    # server {
    #     listen       80;
    #     listen       [::]:80;
    #     server_name  _;
    #     root         /usr/share/nginx/html;
    #     ...
    # }

    # conf.d 디렉토리의 설정 파일들을 포함 (이 줄은 유지)
    include /etc/nginx/conf.d/*.conf;
}
```

### 3.4 설정 활성화 및 테스트

```bash
# Nginx 설정 파일 문법 검사
sudo nginx -t

# 설정이 올바르면 Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx

# 설정된 서버 블록 확인
sudo nginx -T | grep -A 20 "server {"
```

### 3.5 방화벽 설정 (firewalld)
```bash
# HTTP, HTTPS 포트 열기
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp

# 방화벽 재로드
sudo firewall-cmd --reload

# 설정 확인
sudo firewall-cmd --list-all
```

## 4. SSL 인증서 설정 (HTTPS)

도메인이 있는 경우 Let's Encrypt로 무료 SSL 인증서를 설치할 수 있습니다.

### 4.1 EPEL 저장소 및 Certbot 설치
```bash
# EPEL 저장소 설치 (Rocky Linux 9에서 필요)
sudo dnf install epel-release -y

# Certbot 설치
sudo dnf install certbot python3-certbot-nginx -y
```

### 4.2 SSL 인증서 발급
```bash
sudo certbot --nginx -d your-domain.com
```

이메일 입력 후 약관 동의하면 자동으로 HTTPS가 설정됩니다.

### 4.3 자동 갱신 설정
```bash
# 갱신 테스트
sudo certbot renew --dry-run
```

인증서는 자동으로 갱신됩니다.

## 5. 코드 업데이트 방법

### 5.1 수동 업데이트
```bash
cd ~/tarot
git pull origin main
npm install
npm run build
pm2 restart tarot-app
```

### 5.2 자동 배포 스크립트 생성

프로젝트 루트에 `deploy.sh` 파일 생성:

```bash
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
```

실행 권한 부여:
```bash
chmod +x deploy.sh
```

사용법:
```bash
./deploy.sh
```

## 6. 모니터링

### 6.1 PM2 모니터링
```bash
# 실시간 모니터링
pm2 monit

# 웹 대시보드 (선택사항)
pm2 install pm2-server-monit
```

### 6.2 로그 확인
```bash
# 실시간 로그
pm2 logs tarot-app --lines 100

# 에러 로그만
pm2 logs tarot-app --err
```

## 7. 문제 해결

### 빠른 진단 체크리스트

문제가 발생했을 때 순서대로 확인하세요:

```bash
# 1. PM2 앱 상태 확인
pm2 status

# 2. 앱이 3000번 포트에서 실행 중인지 확인
sudo ss -tulpn | grep :3000
curl http://localhost:3000

# 3. Nginx 상태 확인
sudo systemctl status nginx

# 4. Nginx 설정이 올바른지 확인
sudo nginx -t
sudo nginx -T | grep -A 20 "server {"

# 5. 방화벽 상태 확인
sudo firewall-cmd --list-all

# 6. SELinux 확인
getenforce
sudo setsebool -P httpd_can_network_connect 1

# 7. 로그 확인
pm2 logs tarot-app --lines 50
sudo tail -20 /var/log/nginx/error.log
```

### PM2 오류: "No script path - aborting"
이 오류는 빌드가 완료되지 않았거나 경로가 잘못된 경우 발생합니다.

**해결 방법:**
```bash
# 1. .output 디렉토리가 있는지 확인
ls -la .output/server/index.mjs

# 2. 없다면 다시 빌드
npm run build

# 3. 빌드 후 PM2 재시작
pm2 delete tarot-app
pm2 start ecosystem.config.cjs

# 4. 로그 확인
pm2 logs tarot-app
```

### 앱이 시작되지 않을 때
```bash
# PM2 로그 확인
pm2 logs tarot-app --lines 50

# 실시간 로그 모니터링
pm2 logs tarot-app

# 포트 사용 확인
sudo netstat -tulpn | grep :3000

# 또는 (Rocky Linux 9)
sudo ss -tulpn | grep :3000

# PM2 프로세스 상태 확인
pm2 status
pm2 describe tarot-app
```

### Nginx 기본 페이지가 나오는 경우

브라우저에서 접속 시 Nginx 기본 페이지("Welcome to nginx")가 나온다면, `/etc/nginx/nginx.conf`의 기본 서버 블록이 우선 적용되고 있는 것입니다.

**해결 방법:**

```bash
# 1. PM2로 앱이 실행 중인지 확인
pm2 status
pm2 logs tarot-app

# 2. 앱이 3000번 포트에서 실행 중인지 확인
sudo ss -tulpn | grep :3000
# 또는
curl http://localhost:3000

# 3. nginx.conf 확인
sudo cat /etc/nginx/nginx.conf | grep -A 30 "server {"

# 4. nginx.conf에 기본 server 블록이 있다면 주석 처리
sudo nano /etc/nginx/nginx.conf

# http 블록 안의 기본 server 블록을 찾아 주석 처리:
# server {
#     listen       80;
#     listen       [::]:80;
#     server_name  _;
#     root         /usr/share/nginx/html;
#     ...
# }

# 5. tarot.conf 파일이 제대로 생성되었는지 확인
ls -la /etc/nginx/conf.d/tarot.conf
cat /etc/nginx/conf.d/tarot.conf

# 6. Nginx 설정 테스트
sudo nginx -t

# 7. Nginx 재시작
sudo systemctl restart nginx

# 8. Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# 9. 다시 브라우저에서 접속 테스트
curl -I http://your-server-ip
```

**추가 확인 사항:**
- `server_name`을 서버 IP 주소로 설정했는지 확인
- SELinux가 Nginx의 프록시 연결을 차단하고 있는지 확인:
  ```bash
  sudo setsebool -P httpd_can_network_connect 1
  ```

### Nginx 오류
```bash
# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# Nginx 액세스 로그 확인
sudo tail -f /var/log/nginx/access.log

# Nginx 설정 테스트
sudo nginx -t

# 전체 Nginx 설정 확인 (모든 include 포함)
sudo nginx -T
```

### 메모리 부족
```bash
# 스왑 메모리 추가 (2GB)
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구적으로 적용
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 확인
sudo swapon --show
```

## 8. 보안 권장사항

1. **SSH 포트 변경**: 기본 22번 포트 대신 다른 포트 사용
2. **SSH 키 인증**: 비밀번호 대신 SSH 키 사용
3. **정기 업데이트**: `sudo dnf update -y` 정기 실행
4. **fail2ban 설치**: 무차별 대입 공격 방지
   ```bash
   sudo dnf install fail2ban -y
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```
5. **SELinux 설정**: Rocky Linux는 기본적으로 SELinux가 활성화되어 있습니다
   ```bash
   # SELinux 상태 확인
   getenforce

   # Nginx가 네트워크 연결을 허용하도록 설정
   sudo setsebool -P httpd_can_network_connect 1
   ```

## 9. 접속 확인

- HTTP: `http://your-server-ip` 또는 `http://your-domain.com`
- HTTPS: `https://your-domain.com` (SSL 설정 후)

## 참고사항

- 이 앱은 SSR(Server Side Rendering)을 사용하므로 Node.js 서버가 계속 실행되어야 합니다.
- 서버 재부팅 시 PM2가 자동으로 앱을 시작합니다 (`pm2 startup` 설정 필요).
- 프로덕션 환경에서는 반드시 환경 변수(.env)를 안전하게 관리하세요.
