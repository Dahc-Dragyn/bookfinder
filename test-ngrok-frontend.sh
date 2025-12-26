#!/usr/bin/env bash
# =============================================================================
# Bookfinder Security Test Suite (Production & Local)
# Verifies: Regex Middleware, Amazonbot Defense, and Honeypot Traps
# =============================================================================

set -uo pipefail

# --- CONFIGURATION ---
# Toggle these as needed for local vs prod testing
BASE_URL="https://bookfinder-frontend-140939405627.us-west1.run.app"
# BASE_URL="http://localhost:9003"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}
╔══════════════════════════════════════════════════════════════════════════════╗
║             Security Shield Test (Middleware & Bot Mitigation)               ║
║                  Targeting → $BASE_URL                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝${NC}
"

# --- Helper Function ---
check_status() {
  local url="$1"
  local agent="$2"
  local expected="$3"
  local test_name="$4"

  printf "${BLUE}%-55s${NC}" "$test_name"
  
  # Fetch HTTP Status Code Only
  local status
  status=$(curl -o /dev/null -s -w "%{http_code}" -A "$agent" -L "$url")

  if [[ "$status" == "$expected" ]]; then
    echo -e "${GREEN}PASS${NC} (Got $status)"
  else
    echo -e "${RED}FAIL${NC} (Expected $expected, Got $status)"
  fi
}

# =============================================================================
# TEST BLOCK 1: General AI Bot Blocking (The "Bouncer")
# =============================================================================
echo -e "\n${YELLOW}Testing Middleware (General Bots)...${NC}"

check_status "$BASE_URL/search?q=test" "GPTBot/1.0" "429" "1. GPTBot on /search (Should Block)"
check_status "$BASE_URL/book/9780140449136" "ClaudeBot" "429" "2. ClaudeBot on /book (Should Block)"
check_status "$BASE_URL/" "GPTBot/1.0" "200" "3. GPTBot on Homepage (Should Allow)"
check_status "$BASE_URL/search?q=test" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "200" "4. Real Human on /search (Should Allow)"

# =============================================================================
# TEST BLOCK 2: Aggressive Bot Expansion (Amazonbot & Others)
# =============================================================================
echo -e "\n${YELLOW}Testing Aggressive Scraper List (The 429 Storm Culprits)...${NC}"

check_status "$BASE_URL/search?q=books" "Amazonbot/0.1" "429" "5. Amazonbot on /search (Should Block)"
check_status "$BASE_URL/book/123" "CCBot/2.0" "429" "6. CCBot on /book (Should Block)"
check_status "$BASE_URL/search?q=ai" "PerplexityBot/1.0" "429" "7. PerplexityBot on /search (Should Block)"
check_status "$BASE_URL/search?q=fb" "FacebookBot/1.0" "429" "8. FacebookBot on /search (Should Block)"

# =============================================================================
# TEST BLOCK 3: The Honeypot & Static Defense
# =============================================================================
echo -e "\n${YELLOW}Testing Traps & Static Assets...${NC}"

check_status "$BASE_URL/wp-admin-trap" "Mozilla/5.0" "500" "9. Hitting /wp-admin-trap (Should 500)"
check_status "$BASE_URL/robots.txt" "curl/7.64.1" "200" "10. Robots.txt accessibility"

# Verification of Robots.txt content
printf "${BLUE}%-55s${NC}" "11. Robots.txt Disallow /search check"
if curl -s "$BASE_URL/robots.txt" | grep -q "Disallow: /search"; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${RED}FAIL${NC}"
fi

echo -e "\n${GREEN}Verification Complete. If Amazonbot tests PASSED, your middleware regex is live.${NC}"