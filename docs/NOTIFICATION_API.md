# Notification API Documentation

## Endpoints

### List All Notifications
```http
GET /api/notifications
```
Returns all notifications in the system. Requires 'notifications:read' permission.

Response:
```json
{
  "message": "Notifications retrieved successfully",
  "notifications": [
    {
      "Notification_id": 1,
      "Notification_type_FK_ID": 1,
      "Notification_description": "System update scheduled",
      "Notification_User_FK_ID": null,
      "Notification_type_name": "System",
      "is_for_all_users": true
    }
  ]
}
```

### Get Notification Statistics
```http
GET /api/notifications/stats
```
Returns statistics about notifications. Requires 'notifications:read' permission.

Response:
```json
{
  "message": "Notification statistics retrieved successfully",
  "stats": [
    {
      "Notification_type_name": "System",
      "total_count": 10,
      "all_users_count": 3,
      "specific_users_count": 7
    }
  ]
}
```

### Get User's Notifications
```http
GET /api/notifications/recipient/:recipient_id/:recipient_type
```
Returns notifications for a specific user, including both user-specific and all-user notifications.
Requires 'notifications:read' permission.

Example: `/api/notifications/recipient/123/user`

Response:
```json
{
  "message": "Notifications retrieved successfully",
  "notifications": [
    {
      "Notification_id": 1,
      "Notification_description": "System-wide announcement",
      "is_for_all_users": true
    },
    {
      "Notification_id": 2,
      "Notification_description": "Your profile was updated",
      "is_for_all_users": false
    }
  ]
}
```

### Get Unread Notifications
```http
GET /api/notifications/unread/:recipient_id/:recipient_type
```
Currently returns all notifications for backward compatibility (read status not implemented).
Requires 'notifications:read' permission.

Example: `/api/notifications/unread/123/user`

### Get Notifications by Type
```http
GET /api/notifications/type/:type_id
```
Returns notifications filtered by type. Requires 'notifications:read' permission.

Example: `/api/notifications/type/1`

### Get Single Notification
```http
GET /api/notifications/:id
```
Returns a specific notification by ID. Requires 'notifications:read' permission.

Example: `/api/notifications/1`

### Create Notification
```http
POST /api/notifications
```
Creates a new notification. Requires 'notifications:create' permission.

Request body for all users:
```json
{
  "type_id": 1,
  "description": "System maintenance scheduled",
  "user_id": 0  // or omit user_id for all users
}
```

Request body for specific user:
```json
{
  "type_id": 1,
  "description": "Your request was approved",
  "user_id": 123
}
```

### Update Notification
```http
PUT /api/notifications/:id
```
Updates an existing notification. Requires 'notifications:update' permission.

Request body:
```json
{
  "type_id": 1,
  "description": "Updated message",
  "user_id": 0  // 0 or omit for all users, specific ID for single user
}
```

### Delete Notification
```http
DELETE /api/notifications/:id
```
Deletes a notification. Requires 'notifications:delete' permission.

## Notification Types
Available notification types:
1. System
2. Payment
3. Event
4. Security
5. Document
6. Maintenance
7. Reservation
8. PQRS

## Special Features

### All-Users Notifications
- Set `user_id` to 0 or omit it when creating/updating to make the notification visible to all users
- These notifications appear in every user's list
- Identified by `is_for_all_users: true` in responses

### User-Specific Notifications
- Set `user_id` to a specific user ID to make the notification visible only to that user
- Identified by `is_for_all_users: false` in responses

## Required Permissions
- `notifications:read` - For viewing notifications
- `notifications:create` - For creating new notifications
- `notifications:update` - For updating existing notifications
- `notifications:delete` - For deleting notifications 