#!/bin/bash

# Bash script to test API endpoints
BASE_URL="http://localhost:3000/api"

# Test users
ADMIN_USERNAME="testadmin"
ADMIN_PASSWORD="admin123"
ADMIN_EMAIL="admin@test.com"

OWNER_USERNAME="testowner"
OWNER_PASSWORD="owner123"
OWNER_EMAIL="owner@test.com"

# Store tokens
ADMIN_TOKEN=""
OWNER_TOKEN=""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Helper function to make authenticated requests
function make_request() {
  local endpoint="$1"
  local method="${2:-GET}"
  local token="$3"
  local data="$4"
  
  local headers=(-H "Content-Type: application/json")
  
  if [ -n "$token" ]; then
    headers+=(-H "Authorization: Bearer $token")
  fi
  
  if [ -n "$data" ] && [[ "$method" == "POST" || "$method" == "PUT" || "$method" == "PATCH" ]]; then
    response=$(curl -s -X "$method" "${headers[@]}" -d "$data" "$BASE_URL$endpoint")
  else
    response=$(curl -s -X "$method" "${headers[@]}" "$BASE_URL$endpoint")
  fi
  
  echo "$response"
}

# Login function
function login() {
  local username="$1"
  local password="$2"
  
  local data="{\"username\":\"$username\",\"password\":\"$password\"}"
  local response=$(make_request "/auth/login" "POST" "" "$data")
  
  # Extract token from response
  local token=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  echo "$token"
}

# Test functions for each module
function test_users_module() {
  local role="$1"
  local token="$2"
  
  echo -e "\n${CYAN}--- Testing Users Module as $role ---${NC}"
  
  # Get all users
  echo -e "\n${YELLOW}GET /users${NC}"
  local all_users=$(make_request "/users" "GET" "$token")
  echo "Response: $all_users"
  
  # Get user profile
  echo -e "\n${YELLOW}GET /users/me/profile${NC}"
  local profile=$(make_request "/users/me/profile" "GET" "$token")
  echo "Response: $profile"
  
  if [ "$role" == "Admin" ]; then
    # Create a new user (admin only)
    echo -e "\n${YELLOW}POST /users${NC}"
    local timestamp=$(date +%s)
    local new_user="{\"username\":\"testuser_$timestamp\",\"password\":\"test123\",\"email\":\"test$timestamp@example.com\",\"user_status_id\":1,\"role_id\":3}"
    
    local create_user=$(make_request "/users" "POST" "$token" "$new_user")
    echo "Response: $create_user"
    
    # Extract user ID from response
    local user_id=$(echo "$create_user" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    
    if [ -n "$user_id" ]; then
      # Update user
      echo -e "\n${YELLOW}PUT /users/$user_id${NC}"
      local update_timestamp=$(date +%s)
      local update_user="{\"email\":\"updated$update_timestamp@example.com\"}"
      local update_response=$(make_request "/users/$user_id" "PUT" "$token" "$update_user")
      echo "Response: $update_response"
      
      # Delete user
      echo -e "\n${YELLOW}DELETE /users/$user_id${NC}"
      local delete_response=$(make_request "/users/$user_id" "DELETE" "$token")
      echo "Response: $delete_response"
    fi
  fi
}

function test_reservations_module() {
  local role="$1"
  local token="$2"
  
  echo -e "\n${CYAN}--- Testing Reservations Module as $role ---${NC}"
  
  # Get all reservations
  echo -e "\n${YELLOW}GET /reservations${NC}"
  local all_reservations=$(make_request "/reservations" "GET" "$token")
  echo "Response: $all_reservations"
  
  # Create a new reservation
  echo -e "\n${YELLOW}POST /reservations${NC}"
  local today=$(date +%Y-%m-%d)
  local new_reservation="{\"reservation_date\":\"$today\",\"reservation_start_time\":\"10:00:00\",\"reservation_end_time\":\"12:00:00\",\"reservation_type_id\":1,\"owner_id\":1,\"notes\":\"Test reservation\"}"
  
  local create_reservation=$(make_request "/reservations" "POST" "$token" "$new_reservation")
  echo "Response: $create_reservation"
  
  # Extract reservation ID from response
  local reservation_id=$(echo "$create_reservation" | grep -o '"id":[0-9]*' | cut -d':' -f2)
  
  if [ -n "$reservation_id" ]; then
    # Get specific reservation
    echo -e "\n${YELLOW}GET /reservations/$reservation_id${NC}"
    local get_reservation=$(make_request "/reservations/$reservation_id" "GET" "$token")
    echo "Response: $get_reservation"
    
    # Update reservation
    echo -e "\n${YELLOW}PUT /reservations/$reservation_id${NC}"
    local update_reservation="{\"notes\":\"Updated test reservation\"}"
    local update_response=$(make_request "/reservations/$reservation_id" "PUT" "$token" "$update_reservation")
    echo "Response: $update_response"
    
    if [ "$role" == "Admin" ]; then
      # Delete reservation (admin only)
      echo -e "\n${YELLOW}DELETE /reservations/$reservation_id${NC}"
      local delete_response=$(make_request "/reservations/$reservation_id" "DELETE" "$token")
      echo "Response: $delete_response"
    fi
  fi
}

function test_pets_module() {
  local role="$1"
  local token="$2"
  
  echo -e "\n${CYAN}--- Testing Pets Module as $role ---${NC}"
  
  # Get all pets
  echo -e "\n${YELLOW}GET /pets${NC}"
  local all_pets=$(make_request "/pets" "GET" "$token")
  echo "Response: $all_pets"
  
  # Create a new pet
  echo -e "\n${YELLOW}POST /pets${NC}"
  local timestamp=$(date +%s)
  local new_pet="{\"pet_name\":\"Test Pet $timestamp\",\"pet_type\":\"Dog\",\"pet_breed\":\"Mixed\",\"pet_color\":\"Brown\",\"pet_age\":3,\"owner_id\":1}"
  
  local create_pet=$(make_request "/pets" "POST" "$token" "$new_pet")
  echo "Response: $create_pet"
  
  # Extract pet ID from response
  local pet_id=$(echo "$create_pet" | grep -o '"id":[0-9]*' | cut -d':' -f2)
  
  if [ -n "$pet_id" ]; then
    # Get specific pet
    echo -e "\n${YELLOW}GET /pets/$pet_id${NC}"
    local get_pet=$(make_request "/pets/$pet_id" "GET" "$token")
    echo "Response: $get_pet"
    
    # Update pet
    echo -e "\n${YELLOW}PUT /pets/$pet_id${NC}"
    local update_timestamp=$(date +%s)
    local update_pet="{\"pet_name\":\"Updated Pet $update_timestamp\"}"
    local update_response=$(make_request "/pets/$pet_id" "PUT" "$token" "$update_pet")
    echo "Response: $update_response"
    
    # Delete pet
    echo -e "\n${YELLOW}DELETE /pets/$pet_id${NC}"
    local delete_response=$(make_request "/pets/$pet_id" "DELETE" "$token")
    echo "Response: $delete_response"
  fi
}

# Main test function
function run_tests() {
  echo -e "${GREEN}=== API ENDPOINT TESTS ===${NC}"
  
  # Login as admin
  echo -e "\n${MAGENTA}Logging in as admin...${NC}"
  ADMIN_TOKEN=$(login "$ADMIN_USERNAME" "$ADMIN_PASSWORD")
  
  if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Admin login successful${NC}"
    
    # Run admin tests
    test_users_module "Admin" "$ADMIN_TOKEN"
    test_reservations_module "Admin" "$ADMIN_TOKEN"
    test_pets_module "Admin" "$ADMIN_TOKEN"
  else
    echo -e "${RED}❌ Admin login failed${NC}"
  fi
  
  # Login as owner
  echo -e "\n${MAGENTA}Logging in as owner...${NC}"
  OWNER_TOKEN=$(login "$OWNER_USERNAME" "$OWNER_PASSWORD")
  
  if [ -n "$OWNER_TOKEN" ]; then
    echo -e "${GREEN}✅ Owner login successful${NC}"
    
    # Run owner tests
    test_users_module "Owner" "$OWNER_TOKEN"
    test_reservations_module "Owner" "$OWNER_TOKEN"
    test_pets_module "Owner" "$OWNER_TOKEN"
  else
    echo -e "${RED}❌ Owner login failed${NC}"
  fi
  
  echo -e "\n${GREEN}=== ALL TESTS COMPLETED ===${NC}"
}

# Run the tests
run_tests 