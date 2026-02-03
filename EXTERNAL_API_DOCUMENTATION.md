# External API Documentation

This document describes how to use the External API system to allow third-party developers to access your platform's data.

## Overview

The External API system allows you to generate API keys for external developers who want to integrate with your poetry platform. Each API key can have specific permissions and rate limits.

## Admin Features

### Creating API Keys

1. Navigate to the PaaS Admin panel (Developer Dashboard)
2. Go to the "External API" tab
3. Click "New API Key"
4. Configure:
   - **Name**: Friendly name for the key
   - **Rate Limit**: Maximum requests per hour (default: 1000)
   - **Permissions**: Select which endpoints the key can access
     - Read Poems
     - Read Public Profiles
     - Read Contests
     - Read Badges
     - Read Workshops

5. Click "Generate" to create the key
6. **Important**: Copy the full API key immediately - it will only be shown once

### Managing API Keys

- **View Usage**: Click the eye icon to see request logs for a specific key
- **Toggle Status**: Activate or deactivate keys without deleting them
- **Delete**: Permanently remove an API key

### Monitoring

The dashboard shows:
- **Active Keys**: Number of currently active API keys
- **Total Requests**: All-time API request count
- **Requests This Hour**: Current hour's traffic
- **Avg Response Time**: Average response time in milliseconds

## Available Endpoints

### 1. Get Poems
**Endpoint**: `https://your-project.supabase.co/functions/v1/external-api-poems`

**Method**: `GET`

**Headers**:
```
X-API-Key: your_api_key_here
```

**Query Parameters**:
- `limit` (optional, default: 50): Number of poems to return
- `offset` (optional, default: 0): Pagination offset
- `public` (optional): Set to "true" to only return public poems

**Example Request**:
```bash
curl -X GET \
  "https://your-project.supabase.co/functions/v1/external-api-poems?limit=10&public=true" \
  -H "X-API-Key: sk_your_api_key_here"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Sample Poem",
      "content": "Poem content...",
      "form_type": "haiku",
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid",
      "is_public": true
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "count": 10
  }
}
```

### 2. Get Public Profiles
**Endpoint**: `https://your-project.supabase.co/functions/v1/external-api-profiles`

**Method**: `GET`

**Headers**:
```
X-API-Key: your_api_key_here
```

**Query Parameters**:
- `limit` (optional, default: 50): Number of profiles to return
- `offset` (optional, default: 0): Pagination offset

**Example Request**:
```bash
curl -X GET \
  "https://your-project.supabase.co/functions/v1/external-api-profiles?limit=20" \
  -H "X-API-Key: sk_your_api_key_here"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "poet123",
      "bio": "Aspiring poet",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 20
  }
}
```

### 3. Get Contests
**Endpoint**: `https://your-project.supabase.co/functions/v1/external-api-contests`

**Method**: `GET`

**Headers**:
```
X-API-Key: your_api_key_here
```

**Query Parameters**:
- `limit` (optional, default: 50): Number of contests to return
- `offset` (optional, default: 0): Pagination offset
- `status` (optional, default: "active"): Filter by contest status

**Example Request**:
```bash
curl -X GET \
  "https://your-project.supabase.co/functions/v1/external-api-contests?status=active" \
  -H "X-API-Key: sk_your_api_key_here"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Spring Poetry Contest",
      "description": "Contest description...",
      "start_date": "2024-03-01T00:00:00Z",
      "end_date": "2024-03-31T23:59:59Z",
      "status": "active",
      "prize_points": 1000,
      "created_at": "2024-02-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

## Rate Limiting

Each API key has a configurable rate limit (requests per hour). When exceeded, the API will return:

```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**HTTP Status**: `429 Too Many Requests`

## Error Responses

### 401 Unauthorized
Missing or invalid API key:
```json
{
  "error": "API key is required. Provide it in the X-API-Key header."
}
```

### 403 Forbidden
Key doesn't have permission:
```json
{
  "error": "This API key does not have permission to read poems"
}
```

### 500 Internal Server Error
Server error:
```json
{
  "error": "Error message here"
}
```

## Security Features

1. **API Key Hashing**: Full keys are stored securely in the database
2. **Permission System**: Granular control over what each key can access
3. **Rate Limiting**: Prevents abuse and ensures fair usage
4. **Usage Logging**: Every request is logged with:
   - Endpoint accessed
   - HTTP method
   - Status code
   - IP address
   - User agent
   - Response time
5. **Activation Control**: Keys can be deactivated without deletion

## Best Practices

1. **Never share API keys publicly** - treat them like passwords
2. **Use environment variables** to store API keys in applications
3. **Set appropriate rate limits** based on expected usage
4. **Grant minimal permissions** - only enable what's needed
5. **Rotate keys regularly** for enhanced security
6. **Monitor usage** to detect unusual patterns
7. **Deactivate unused keys** to reduce attack surface

## Integration Example

```javascript
// JavaScript/Node.js Example
const API_KEY = process.env.POETRY_API_KEY;
const BASE_URL = 'https://your-project.supabase.co/functions/v1';

async function getPoems(limit = 10) {
  const response = await fetch(
    `${BASE_URL}/external-api-poems?limit=${limit}&public=true`,
    {
      headers: {
        'X-API-Key': API_KEY
      }
    }
  );

  const data = await response.json();
  return data;
}

// Usage
getPoems(20)
  .then(result => {
    console.log(`Found ${result.data.length} poems`);
    result.data.forEach(poem => {
      console.log(`${poem.title} - ${poem.form_type}`);
    });
  })
  .catch(error => {
    console.error('Error fetching poems:', error);
  });
```

## Support

For questions or issues with the External API system, contact your platform administrator.
