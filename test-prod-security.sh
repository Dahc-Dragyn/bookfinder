#!/usr/bin/env bash
set -uo pipefail

# --- TARGETING PRODUCTION ---
BASE_URL="https://bookfinder-frontend-140939405627.us-west1.run.app"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}
╔══════════════════════════════════════════════════════════════════════════════╗
║             PRODUCTION Security Shield Test (Cloud Run Edge)                 ║
║                  Targeting → $BASE_URL                              ║
╚══════════════════════════════════════════════════════════════════════════════╝${NC}
"

check_status() {
  local url="$1"
  local agent="$2"
  local expected="$3"
  local test_name="$4"
  printf "${BLUE}%-50s${NC}" "$test_name"
  local status
  status=$(curl -o /dev/null -s -w "%{http_code}" -A "$agent" "$url")
  if [[ "$status" == "$expected" ]]; then
    echo -e "${GREEN}PASS${NC} (Got $status)"
  else
    echo -e "${RED}FAIL${NC} (Expected $expected, Got $status)"
  fi
}

echo -e "\n${YELLOW}Testing Amazonbot Defense (Production)...${NC}"
# We expect 429 (Too Many Requests) or 410 (Gone) depending on your middleware logic
check_status "$BASE_URL/search?q=witches" "Amazonbot/0.1" "429" "6. Amazonbot on /search (Should Block)"
check_status "$BASE_URL/book/9781663625458" "Amazonbot/0.1" "429" "7. Amazonbot on /book (Should Block)"
check_status "$BASE_URL/" "Amazonbot/0.1" "200" "8. Amazonbot on Homepage (Should Allow)"

echo -e "\n${YELLOW}Testing Behavioral Honeypot (Production)...${NC}"
check_status "$BASE_URL/wp-admin-trap" "SuspiciousBot/1.0" "500" "9. Hitting /wp-admin-trap (Should error)"

echo -e "\n${GREEN}Production Verification Complete.${NC}"
