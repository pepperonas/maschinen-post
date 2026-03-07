#!/usr/bin/env bash
set -euo pipefail

VPS="celox"
APP_DIR="/root/apps/maschinenpost"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== MaschinenPost Deploy ==="

# 1. Build frontend
echo "--- Building frontend ---"
cd "$PROJECT_DIR/frontend"
npm run build

# 2. Build backend JAR
echo "--- Building backend JAR ---"
cd "$PROJECT_DIR/backend"
mvn package -DskipTests -q

JAR_VERSION=$(mvn help:evaluate -Dexpression=project.version -q -DforceStdout)
JAR_FILE="target/maschinenpost-${JAR_VERSION}.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "ERROR: Expected JAR not found: $JAR_FILE"
    exit 1
fi
echo "JAR: $JAR_FILE"

# 3. Deploy frontend
echo "--- Deploying frontend ---"
rsync -avz --delete "$PROJECT_DIR/frontend/dist/" "$VPS:$APP_DIR/frontend/"
ssh "$VPS" "chmod -R o+rX $APP_DIR/frontend/"

# 4. Deploy backend JAR
echo "--- Deploying backend JAR ---"
scp "$JAR_FILE" "$VPS:$APP_DIR/backend/maschinenpost.jar"

# 5. Restart service
echo "--- Restarting service ---"
ssh "$VPS" "systemctl restart maschinenpost"

# 6. Wait and check status
sleep 3
echo "--- Service status ---"
ssh "$VPS" "systemctl is-active maschinenpost && echo 'OK' || (journalctl -u maschinenpost --no-pager -n 20 && exit 1)"

echo "=== Deploy complete ==="
echo "https://maschinenpost.celox.io"
