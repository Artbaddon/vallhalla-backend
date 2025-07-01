# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Blue = [System.ConsoleColor]::Blue

# Base URL
$BaseUrl = "http://localhost:3000/api"

# Test users
$adminUser = @{
    username = "testadmin"
    password = "admin123"
    email = "admin@test.com"
}

$ownerUser = @{
    username = "testowner"
    password = "owner123"
    email = "owner@test.com"
}

# Store tokens
$adminToken = ""
$ownerToken = ""

# Helper function to make authenticated requests
function Invoke-ApiRequest {
    param (
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Token = $null,
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$BaseUrl$Endpoint"
        Method = $Method
        Headers = $headers
        ContentType = "application/json"
    }
    
    if ($Body -and ($Method -eq "POST" -or $Method -eq "PUT" -or $Method -eq "PATCH")) {
        $params["Body"] = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{
            status = 200
            data = $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.ErrorDetails.Message
        
        if ($errorMessage) {
            try {
                $errorData = $errorMessage | ConvertFrom-Json
            }
            catch {
                $errorData = @{ error = $errorMessage }
            }
        }
        else {
            $errorData = @{ error = $_.Exception.Message }
        }
        
        return @{
            status = $statusCode
            data = $errorData
        }
    }
}

# Login function
function Login-User {
    param (
        [string]$Username,
        [string]$Password
    )
    
    $body = @{
        username = $Username
        password = $Password
    }
    
    $result = Invoke-ApiRequest -Endpoint "/auth/login" -Method "POST" -Body $body
    
    if ($result.status -eq 200 -and $result.data.token) {
        return $result.data.token
    }
    
    return $null
}

# Test functions for each module
function Test-UsersModule {
    param (
        [string]$Role,
        [string]$Token
    )
    
    Write-Host "`n--- Testing Users Module as $Role ---" -ForegroundColor Cyan
    
    # Get all users
    Write-Host "`nGET /users" -ForegroundColor Yellow
    $allUsers = Invoke-ApiRequest -Endpoint "/users" -Token $Token
    Write-Host "Status: $($allUsers.status)"
    Write-Host "Success: $($allUsers.data.success)"
    Write-Host "Count: $($allUsers.data.count)"
    
    # Get user profile
    Write-Host "`nGET /users/me/profile" -ForegroundColor Yellow
    $profile = Invoke-ApiRequest -Endpoint "/users/me/profile" -Token $Token
    Write-Host "Status: $($profile.status)"
    Write-Host "Success: $($profile.data.success)"
    
    if ($Role -eq "Admin") {
        # Create a new user (admin only)
        Write-Host "`nPOST /users" -ForegroundColor Yellow
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $newUser = @{
            username = "testuser_$timestamp"
            password = "test123"
            email = "test$timestamp@example.com"
            user_status_id = 1
            role_id = 3
        }
        
        $createUser = Invoke-ApiRequest -Endpoint "/users" -Method "POST" -Token $Token -Body $newUser
        Write-Host "Status: $($createUser.status)"
        Write-Host "Success: $($createUser.data.success)"
        
        if ($createUser.data.success) {
            $userId = $createUser.data.data.id
            
            # Update user
            Write-Host "`nPUT /users/$userId" -ForegroundColor Yellow
            $updateTimestamp = Get-Date -Format "yyyyMMddHHmmss"
            $updateUser = Invoke-ApiRequest -Endpoint "/users/$userId" -Method "PUT" -Token $Token -Body @{
                email = "updated$updateTimestamp@example.com"
            }
            Write-Host "Status: $($updateUser.status)"
            Write-Host "Success: $($updateUser.data.success)"
            
            # Delete user
            Write-Host "`nDELETE /users/$userId" -ForegroundColor Yellow
            $deleteUser = Invoke-ApiRequest -Endpoint "/users/$userId" -Method "DELETE" -Token $Token
            Write-Host "Status: $($deleteUser.status)"
            Write-Host "Success: $($deleteUser.data.success)"
        }
    }
}

function Test-ReservationsModule {
    param (
        [string]$Role,
        [string]$Token
    )
    
    Write-Host "`n--- Testing Reservations Module as $Role ---" -ForegroundColor Cyan
    
    # Get all reservations
    Write-Host "`nGET /reservations" -ForegroundColor Yellow
    $allReservations = Invoke-ApiRequest -Endpoint "/reservations" -Token $Token
    Write-Host "Status: $($allReservations.status)"
    Write-Host "Success: $($allReservations.data.success)"
    Write-Host "Count: $($allReservations.data.count)"
    
    # Create a new reservation
    Write-Host "`nPOST /reservations" -ForegroundColor Yellow
    $today = Get-Date -Format "yyyy-MM-dd"
    $newReservation = @{
        reservation_date = $today
        reservation_start_time = "10:00:00"
        reservation_end_time = "12:00:00"
        reservation_type_id = 1
        owner_id = 1
        notes = "Test reservation"
    }
    
    $createReservation = Invoke-ApiRequest -Endpoint "/reservations" -Method "POST" -Token $Token -Body $newReservation
    Write-Host "Status: $($createReservation.status)"
    Write-Host "Success: $($createReservation.data.success)"
    
    if ($createReservation.data.success) {
        $reservationId = $createReservation.data.data.id
        
        # Get specific reservation
        Write-Host "`nGET /reservations/$reservationId" -ForegroundColor Yellow
        $getReservation = Invoke-ApiRequest -Endpoint "/reservations/$reservationId" -Token $Token
        Write-Host "Status: $($getReservation.status)"
        Write-Host "Success: $($getReservation.data.success)"
        
        # Update reservation
        Write-Host "`nPUT /reservations/$reservationId" -ForegroundColor Yellow
        $updateReservation = Invoke-ApiRequest -Endpoint "/reservations/$reservationId" -Method "PUT" -Token $Token -Body @{
            notes = "Updated test reservation"
        }
        Write-Host "Status: $($updateReservation.status)"
        Write-Host "Success: $($updateReservation.data.success)"
        
        if ($Role -eq "Admin") {
            # Delete reservation (admin only)
            Write-Host "`nDELETE /reservations/$reservationId" -ForegroundColor Yellow
            $deleteReservation = Invoke-ApiRequest -Endpoint "/reservations/$reservationId" -Method "DELETE" -Token $Token
            Write-Host "Status: $($deleteReservation.status)"
            Write-Host "Success: $($deleteReservation.data.success)"
        }
    }
}

function Test-PetsModule {
    param (
        [string]$Role,
        [string]$Token
    )
    
    Write-Host "`n--- Testing Pets Module as $Role ---" -ForegroundColor Cyan
    
    # Get all pets
    Write-Host "`nGET /pets" -ForegroundColor Yellow
    $allPets = Invoke-ApiRequest -Endpoint "/pets" -Token $Token
    Write-Host "Status: $($allPets.status)"
    Write-Host "Success: $($allPets.data.success)"
    Write-Host "Count: $($allPets.data.count)"
    
    # Create a new pet
    Write-Host "`nPOST /pets" -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $newPet = @{
        pet_name = "Test Pet $timestamp"
        pet_type = "Dog"
        pet_breed = "Mixed"
        pet_color = "Brown"
        pet_age = 3
        owner_id = 1
    }
    
    $createPet = Invoke-ApiRequest -Endpoint "/pets" -Method "POST" -Token $Token -Body $newPet
    Write-Host "Status: $($createPet.status)"
    Write-Host "Success: $($createPet.data.success)"
    
    if ($createPet.data.success) {
        $petId = $createPet.data.data.id
        
        # Get specific pet
        Write-Host "`nGET /pets/$petId" -ForegroundColor Yellow
        $getPet = Invoke-ApiRequest -Endpoint "/pets/$petId" -Token $Token
        Write-Host "Status: $($getPet.status)"
        Write-Host "Success: $($getPet.data.success)"
        
        # Update pet
        Write-Host "`nPUT /pets/$petId" -ForegroundColor Yellow
        $updateTimestamp = Get-Date -Format "yyyyMMddHHmmss"
        $updatePet = Invoke-ApiRequest -Endpoint "/pets/$petId" -Method "PUT" -Token $Token -Body @{
            pet_name = "Updated Pet $updateTimestamp"
        }
        Write-Host "Status: $($updatePet.status)"
        Write-Host "Success: $($updatePet.data.success)"
        
        # Delete pet
        Write-Host "`nDELETE /pets/$petId" -ForegroundColor Yellow
        $deletePet = Invoke-ApiRequest -Endpoint "/pets/$petId" -Method "DELETE" -Token $Token
        Write-Host "Status: $($deletePet.status)"
        Write-Host "Success: $($deletePet.data.success)"
    }
}

# Main test function
function Run-Tests {
    Write-Host "=== API ENDPOINT TESTS ===" -ForegroundColor Green
    
    # Login as admin
    Write-Host "`nLogging in as admin..." -ForegroundColor Magenta
    $script:adminToken = Login-User -Username $adminUser.username -Password $adminUser.password
    
    if ($adminToken) {
        Write-Host "✅ Admin login successful" -ForegroundColor Green
        
        # Run admin tests
        Test-UsersModule -Role "Admin" -Token $adminToken
        Test-ReservationsModule -Role "Admin" -Token $adminToken
        Test-PetsModule -Role "Admin" -Token $adminToken
    }
    else {
        Write-Host "❌ Admin login failed" -ForegroundColor Red
    }
    
    # Login as owner
    Write-Host "`nLogging in as owner..." -ForegroundColor Magenta
    $script:ownerToken = Login-User -Username $ownerUser.username -Password $ownerUser.password
    
    if ($ownerToken) {
        Write-Host "✅ Owner login successful" -ForegroundColor Green
        
        # Run owner tests
        Test-UsersModule -Role "Owner" -Token $ownerToken
        Test-ReservationsModule -Role "Owner" -Token $ownerToken
        Test-PetsModule -Role "Owner" -Token $ownerToken
    }
    else {
        Write-Host "❌ Owner login failed" -ForegroundColor Red
    }
    
    Write-Host "`n=== ALL TESTS COMPLETED ===" -ForegroundColor Green
}

# Run the tests
Run-Tests

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