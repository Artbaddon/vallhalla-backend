# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Blue = [System.ConsoleColor]::Blue

# Base URL
$BaseUrl = "http://localhost:3000/api"

# Function to print test results
function Print-Result {
    param (
        [bool]$success,
        [string]$message
    )
    
    if ($success) {
        Write-Host "✓ $message - Success" -ForegroundColor $Green
    } else {
        Write-Host "✗ $message - Failed" -ForegroundColor $Red
    }
}

# Function to make API calls
function Make-Request {
    param (
        [string]$method,
        [string]$endpoint,
        [string]$body = "",
        [hashtable]$headers = @{}
    )
    
    try {
        $fullUrl = "$BaseUrl$endpoint"
        Write-Host "Testing URL: $fullUrl" -ForegroundColor $Blue
        $headers["Content-Type"] = "application/json"
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        if ($body -ne "") {
            $response = Invoke-RestMethod -Method $method -Uri $fullUrl -Headers $headers -Body $body -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Method $method -Uri $fullUrl -Headers $headers
        }
        
        Write-Host "Response: $($response | ConvertTo-Json -Depth 1)" -ForegroundColor $Blue
        if ($response.token) {
            $script:Token = $response.token
            Write-Host "Token received: $Token" -ForegroundColor $Blue
        }
        return $true
    } catch {
        Write-Host "Response: $($_.Exception.Message)" -ForegroundColor $Red
        return $false
    }
}

Write-Host "Starting API Endpoint Tests" -ForegroundColor $Blue
Write-Host "================================"

# Test Auth Endpoints (Public)
Write-Host "`nTesting Auth Endpoints" -ForegroundColor $Blue
Write-Host "------------------------"

# Register a test user
Write-Host "Testing user registration..."
$registerSuccess = Make-Request -method "POST" -endpoint "/auth/register" -body '{"username":"testuser","password":"testpass","email":"test@example.com","user_status_id":1,"role_id":2}'
Print-Result -success $registerSuccess -message "Register User"

# Login and get token
Write-Host "Testing login..."
$loginSuccess = Make-Request -method "POST" -endpoint "/auth/login" -body '{"username":"testuser","password":"testpass"}'
Print-Result -success $loginSuccess -message "Login"

if (-not $loginSuccess) {
    Write-Host "Login failed. Cannot continue with protected endpoint tests." -ForegroundColor $Red
    exit
}

# Test Protected Endpoints (require authentication)

# Core System Management
Write-Host "`nTesting Core System Management" -ForegroundColor $Blue
Write-Host "------------------------"
$success = Make-Request -method "GET" -endpoint "/users"
Print-Result -success $success -message "Get All Users"

$success = Make-Request -method "GET" -endpoint "/user-status"
Print-Result -success $success -message "Get All User Statuses"

$success = Make-Request -method "GET" -endpoint "/profile"
Print-Result -success $success -message "Get All Profiles"

$success = Make-Request -method "GET" -endpoint "/roles"
Print-Result -success $success -message "Get All Roles"

$success = Make-Request -method "GET" -endpoint "/permissions"
Print-Result -success $success -message "Get All Permissions"

$success = Make-Request -method "GET" -endpoint "/role-permissions"
Print-Result -success $success -message "Get All Role Permissions"

$success = Make-Request -method "GET" -endpoint "/modules"
Print-Result -success $success -message "Get All Modules"

# Property Management
Write-Host "`nTesting Property Management" -ForegroundColor $Blue
Write-Host "------------------------"
$success = Make-Request -method "GET" -endpoint "/owners"
Print-Result -success $success -message "Get All Owners"

$success = Make-Request -method "GET" -endpoint "/apartments"
Print-Result -success $success -message "Get All Apartments"

$success = Make-Request -method "GET" -endpoint "/apartment-status"
Print-Result -success $success -message "Get All Apartment Statuses"

# Payment System
Write-Host "`nTesting Payment System" -ForegroundColor $Blue
Write-Host "------------------------"
$success = Make-Request -method "GET" -endpoint "/payments"
Print-Result -success $success -message "Get All Payments"

# Security & Access
Write-Host "`nTesting Security & Access" -ForegroundColor $Blue
Write-Host "------------------------"
$success = Make-Request -method "GET" -endpoint "/guards"
Print-Result -success $success -message "Get All Guards"

$success = Make-Request -method "GET" -endpoint "/visitors"
Print-Result -success $success -message "Get All Visitors"

# Business Operations
Write-Host "`nTesting Business Operations" -ForegroundColor $Blue
Write-Host "------------------------"
$success = Make-Request -method "GET" -endpoint "/reservations"
Print-Result -success $success -message "Get All Reservations"

$success = Make-Request -method "GET" -endpoint "/pqrs"
Print-Result -success $success -message "Get All PQRS"

$success = Make-Request -method "GET" -endpoint "/pqrs-categories"
Print-Result -success $success -message "Get All PQRS Categories"

$success = Make-Request -method "GET" -endpoint "/notifications"
Print-Result -success $success -message "Get All Notifications"

# Legacy Routes
Write-Host "`nTesting Legacy Routes" -ForegroundColor $Blue
Write-Host "------------------------"
$success = Make-Request -method "GET" -endpoint "/api-users"
Print-Result -success $success -message "Get All API Users"

$success = Make-Request -method "GET" -endpoint "/web-users"
Print-Result -success $success -message "Get All Web Users"

Write-Host "`nTest Execution Complete" -ForegroundColor $Blue
Write-Host "================================" 