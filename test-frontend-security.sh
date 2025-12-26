#!/usr/bin/env bash
# =============================================================================
# Bookfinder Frontend Security Test Suite
# Verifies Middleware "Bouncer", Robots.txt, and Bot Blocking
# =============================================================================

set -uo pipefail

# --- CONFIGURATION ---
# Change this if your local Next.js runs on a different port (e.g., 3000)
BASE_URL="http://localhost:9003"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}
╔══════════════════════════════════════════════════════════════════════════════╗
║             Frontend Security Shield Test (Middleware & Bots)                ║
║                  Targeting → $BASE_URL                          ║
╚══════════════════════════════════════════════════════════════════════════════╝${NC}
"

# --- Helper Function ---
check_status() {
  local url="$1"
  local agent="$2"
  local expected="$3"
  local test_name="$4"

  printf "${BLUE}%-50s${NC}" "$test_name"
  
  # Fetch HTTP Status Code Only
  local status
  status=$(curl -o /dev/null -s -w "%{http_code}" -A "$agent" "$url")

  if [[ "$status" == "$expected" ]]; then
    echo -e "${GREEN}PASS${NC} (Got $status)"
  else
    echo -e "${RED}FAIL${NC} (Expected $expected, Got $status)"
  fi
}

# =============================================================================
# TEST BLOCK 1: The "Bouncer" (Middleware)
# =============================================================================
echo -e "\n${YELLOW}Testing Middleware (Active Blocking)...${NC}"

# 1. GPTBot hitting Search (Should be BLOCKED)
# Logic: Middleware detects 'GPTBot' on '/search' and returns 429.
check_status "$BASE_URL/search?q=test" "Mozilla/5.0 GPTBot/1.0" "429" "1. GPTBot on /search (Should Block)"

# 2. GPTBot hitting Book Details (Should be BLOCKED)
# Logic: Middleware detects 'GPTBot' on '/book/...' and returns 429.
check_status "$BASE_URL/book/9780140449136" "GPTBot/1.0" "429" "2. GPTBot on /book (Should Block)"

# 3. GPTBot hitting Homepage (Should PASS)
# Logic: We typically ALLOW bots on the homepage so they know the site exists.
check_status "$BASE_URL/" "GPTBot/1.0" "200" "3. GPTBot on Homepage (Should Allow)"

# 4. Normal User hitting Search (Should PASS)
# Logic: Chrome/Regular user should NOT be blocked.
check_status "$BASE_URL/search?q=test" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" "200" "4. Real Human on /search (Should Allow)"

# 5. Bytespider (TikTok) hitting Search (Should be BLOCKED)
# Logic: Testing another bad bot from your blacklist.
check_status "$BASE_URL/search?q=tiktok" "Bytespider" "429" "5. Bytespider on /search (Should Block)"

# =============================================================================
# TEST BLOCK 2: The "Signage" (Robots.txt & Sitemap)
# =============================================================================
echo -e "\n${YELLOW}Testing Static Defenses (Robots & Sitemap)...${NC}"

# 6. Robots.txt Existence
# Logic: File must exist and return 200.
check_status "$BASE_URL/robots.txt" "curl/7.64.1" "200" "6. Robots.txt is accessible"

# 7. Check Robots.txt Content
# Logic: grep for the 'Disallow: /search' line.
printf "${BLUE}%-50s${NC}" "7. Robots.txt disallows /search"
content=$(curl -s "$BASE_URL/robots.txt")
if echo "$content" | grep -q "Disallow: /search"; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${RED}FAIL${NC} (Rule not found in robots.txt)"
fi

# 8. Sitemap Existence
# Logic: We direct bots here, so it better work.
check_status "$BASE_URL/sitemap.xml" "Googlebot/2.1" "200" "8. Sitemap.xml is accessible"

echo -e "\n${GREEN}Test Suite Complete.${NC}"