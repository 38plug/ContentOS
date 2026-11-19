#!/bin/bash
# startup.sh - restart contract for ContentOS preview
if curl -sf http://127.0.0.1:8080/ > /dev/null; then
  echo "App is already running"
  exit 0
fi

npm run dev > /tmp/contentos-dev.log 2>&1 &
echo "App started on 0.0.0.0:8080"
