#!/usr/bin/env bash
# =============================================================================
# Bookfinder Frontend Security Test Suite
# Verifies Middleware "Bouncer", Amazonbot Defense, and Honeypots
# =============================================================================

set -uo pipefail

# --- CONFIGURATION ---
BASE_URL="http://localhost:9003"
#APP_URL="https://bookfinder-frontend-140939405627.us-west1.run.app"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}
╔══════════════════════════════════════════════════════════════════════════════╗
║             Frontend Security Shield Test (Middleware & Bots)                ║
║                  Targeting → $BASE_URL                              ║
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
# TEST BLOCK 1: The "Bouncer" (General Bots)
# =============================================================================
echo -e "\n${YELLOW}Testing Middleware (General Bots)...${NC}"

# 1. GPTBot hitting Search (Should be BLOCKED)
check_status "$BASE_URL/search?q=test" "Mozilla/5.0 GPTBot/1.0" "429" "1. GPTBot on /search (Should Block)"

# 2. GPTBot hitting Book Details (Should be BLOCKED)
check_status "$BASE_URL/book/9780140449136" "GPTBot/1.0" "429" "2. GPTBot on /book (Should Block)"

# 3. GPTBot hitting Homepage (Should PASS)
check_status "$BASE_URL/" "GPTBot/1.0" "200" "3. GPTBot on Homepage (Should Allow)"

# 4. Normal User hitting Search (Should PASS)
check_status "$BASE_URL/search?q=test" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" "200" "4. Real Human on /search (Should Allow)"

# 5. Bytespider hitting Search (Should be BLOCKED)
check_status "$BASE_URL/search?q=tiktok" "Bytespider" "429" "5. Bytespider on /search (Should Block)"

# =============================================================================
# TEST BLOCK 2: The "Amazonbot" Defense (New Priority)
# =============================================================================
echo -e "\n${YELLOW}Testing Amazonbot Defense (The Primary Culprit)...${NC}"

# 6. Amazonbot hitting Search (Should be BLOCKED)
check_status "$BASE_URL/search?q=witches" "Amazonbot/0.1" "429" "6. Amazonbot on /search (Should Block)"

# 7. Amazonbot hitting a Book Page (Should be BLOCKED)
check_status "$BASE_URL/book/9781663625458" "Amazonbot/0.1" "429" "7. Amazonbot on /book (Should Block)"

# 8. Amazonbot hitting Homepage (Should PASS)
check_status "$BASE_URL/" "Amazonbot/0.1" "200" "8. Amazonbot on Homepage (Should Allow)"

# =============================================================================
# TEST BLOCK 3: The Honeypot (Deception Layer)
# =============================================================================
echo -e "\n${YELLOW}Testing Behavioral Honeypot (The Trap)...${NC}"

# 9. Triggering the Trap
check_status "$BASE_URL/wp-admin-trap" "SuspiciousBot/1.0" "500" "9. Hitting /wp-admin-trap (Should error)"

# =============================================================================
# TEST BLOCK 4: Static Defenses
# =============================================================================
echo -e "\n${YELLOW}Testing Static Defenses (Robots & Sitemap)...${NC}"

# 10. Robots.txt Existence
check_status "$BASE_URL/robots.txt" "curl/7.64.1" "200" "10. Robots.txt is accessible"

# 11. Check Robots.txt Content
printf "${BLUE}%-50s${NC}" "11. Robots.txt disallows /search"
content=$(curl -s "$BASE_URL/robots.txt")
if echo "$content" | grep -q "Disallow: /search"; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${RED}FAIL${NC} (Rule not found in robots.txt)"
fi

# 12. Sitemap Existence
check_status "$BASE_URL/sitemap.xml" "Googlebot/2.1" "200" "12. Sitemap.xml is accessible"

echo -e "\n${GREEN}Test Suite Complete.${NC}"
