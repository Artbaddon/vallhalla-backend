#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Base URL
BASE_URL="http://localhost:3000/api"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 - Success${NC}"
    else
        echo -e "${RED}✗ $2 - Failed${NC}"
    fi
}

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=""
    
    if [ ! -z "$TOKEN" ]; then
        auth_header="-H 'Authorization: Bearer $TOKEN'"
    fi
    
    if [ ! -z "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method $auth_header -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method $auth_header "$BASE_URL$endpoint")
    fi
    
    http_code=${response: -3}
    body=${response:0:${#response}-3}
    
    # Check if status code is in 2xx range
    if [[ $http_code =~ ^2[0-9][0-9]$ ]]; then
        return 0
    else
        echo "Response: $body"
        return 1
    fi
}

echo -e "${BLUE}Starting API Endpoint Tests${NC}"
echo "================================"

# Test Auth Endpoints
echo -e "\n${BLUE}Testing Auth Endpoints${NC}"
echo "------------------------"

# Register a test user
echo "Testing user registration..."
make_request "POST" "/auth/register" '{"username":"testuser","password":"testpass","email":"test@example.com"}' 
print_result $? "Register User"

# Login and get token
echo "Testing login..."
response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"testuser","password":"testpass"}' "$BASE_URL/auth/login")
TOKEN=$(echo $response | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login - Success${NC}"
else
    echo -e "${RED}✗ Login - Failed${NC}"
    exit 1
fi

# Test User Endpoints
echo -e "\n${BLUE}Testing User Endpoints${NC}"
echo "------------------------"
make_request "GET" "/users/" && print_result $? "Get All Users"
make_request "GET" "/users/1" && print_result $? "Get User by ID"

# Test Apartment Endpoints
echo -e "\n${BLUE}Testing Apartment Endpoints${NC}"
echo "------------------------"
make_request "GET" "/apartments/" && print_result $? "Get All Apartments"
make_request "POST" "/apartments" '{"apartment_number":"101","status_id":1,"tower_id":1,"owner_id":1}' && print_result $? "Create Apartment"

# Test Owner Endpoints
echo -e "\n${BLUE}Testing Owner Endpoints${NC}"
echo "------------------------"
make_request "GET" "/owners/" && print_result $? "Get All Owners"
make_request "POST" "/owners" '{"user_id":1}' && print_result $? "Create Owner"

# Test PQRS Endpoints
echo -e "\n${BLUE}Testing PQRS Endpoints${NC}"
echo "------------------------"
make_request "GET" "/pqrs/" && print_result $? "Get All PQRS"
make_request "POST" "/pqrs" '{"title":"Test Issue","description":"Test Description","category_id":1,"owner_id":1}' && print_result $? "Create PQRS"

# Test Visitor Endpoints
echo -e "\n${BLUE}Testing Visitor Endpoints${NC}"
echo "------------------------"
make_request "GET" "/visitors/" && print_result $? "Get All Visitors"
make_request "POST" "/visitors" '{"name":"John Doe","identification":"123456789","host_id":1}' && print_result $? "Create Visitor"

# Test Guard Endpoints
echo -e "\n${BLUE}Testing Guard Endpoints${NC}"
echo "------------------------"
make_request "GET" "/guards/" && print_result $? "Get All Guards"
make_request "POST" "/guards" '{"name":"John Smith","identification":"987654321","shift":"morning"}' && print_result $? "Create Guard"

# Test Reservation Endpoints
echo -e "\n${BLUE}Testing Reservation Endpoints${NC}"
echo "------------------------"
make_request "GET" "/reservations/" && print_result $? "Get All Reservations"
make_request "POST" "/reservations" '{"owner_id":1,"facility_id":1,"start_date":"2024-03-20T10:00:00","end_date":"2024-03-20T12:00:00"}' && print_result $? "Create Reservation"

# Test Role and Permission Endpoints
echo -e "\n${BLUE}Testing Role & Permission Endpoints${NC}"
echo "------------------------"
make_request "GET" "/roles/" && print_result $? "Get All Roles"
make_request "GET" "/permissions/" && print_result $? "Get All Permissions"
make_request "GET" "/role-permissions/" && print_result $? "Get All Role Permissions"

# Test Module Endpoints
echo -e "\n${BLUE}Testing Module Endpoints${NC}"
echo "------------------------"
make_request "GET" "/modules/" && print_result $? "Get All Modules"

# Test User Status Endpoints
echo -e "\n${BLUE}Testing User Status Endpoints${NC}"
echo "------------------------"
make_request "GET" "/user-status/" && print_result $? "Get All User Statuses"

# Test Payment Endpoints
echo -e "\n${BLUE}Testing Payment Endpoints${NC}"
echo "------------------------"
make_request "GET" "/payments/" && print_result $? "Get All Payments"
make_request "POST" "/payments" '{"amount":1000,"owner_id":1}' && print_result $? "Create Payment"

echo -e "\n${BLUE}Test Execution Complete${NC}"
echo "================================" 