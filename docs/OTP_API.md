# OTP API Endpoints

This documentation describes the OTP (One-Time Password) API endpoints that act as a proxy to the external OTP service.

## Base URL
All OTP endpoints are available under: `/api/otp/`

## External Service
The endpoints proxy requests to: `http://104.234.204.107:3720`

## Template System

The OTP service supports various message templates that can be customized with placeholders. When using the `template` parameter in the send endpoint, you can specify which template to use along with the appropriate data.

### Common Templates:
- **default**: Basic OTP message with OTP, expiry, and company name
- **login**: OTP for user login with personalized greeting
- **verification**: OTP for verifying user actions
- **transaction**: OTP for financial transactions
- **registration**: OTP for new user registration
- **resetPassword**: OTP for password reset

### Template Placeholders:
Different templates support different placeholders:
- `{{otp}}`: The generated OTP code
- `{{name}}`: User's name (use with `name` parameter)
- `{{company}}`: Company name (use with `company` parameter)
- `{{expiry}}`: Expiry time in minutes
- `{{amount}}`: Transaction amount (for transaction template)

Use the `/api/otp/templates` endpoint to get the complete list of available templates and their supported placeholders.

## Endpoints

### 1. Get OTP Templates
**GET** `/api/otp/templates`

Retrieves available OTP message templates for different use cases.

**Query Parameters:**
- `language` (optional): 2-letter language code (default: "en")

**Example Request:**
```
GET /api/otp/templates?language=en
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "language": "en",
    "supportedLanguages": {
      "en": "English",
      "es": "Spanish",
      "zh": "Chinese (Mandarin)"
    },
    "templates": [
      {
        "name": "default",
        "description": "Basic OTP message with OTP, expiry, and company name",
        "placeholders": ["{{otp}}", "{{expiry}}", "{{company}}"],
        "messagePreview": "Your OTP is {{otp}}. It will expire in {{expiry}} minutes. - {{company}}"
      }
    ]
  },
  "timestamp": "2025-07-06T..."
}
```

### 2. Send OTP
**GET** `/api/otp/send`

Sends an OTP to the specified phone number.

**Query Parameters:**
- `phone` (required): Phone number (10-15 digits)
- `length` (optional): OTP length (4-8 digits, default: 6)
- `expiry` (optional): Expiry time in minutes (1-30, default: 5)
- `company` (optional): Company name (default: "Your Company")
- `language` (optional): 2-letter language code (default: "en")
- `image` (optional): Image URL for the OTP message
- `name` (optional): User's name for personalized messages
- `template` (optional): Template name for the OTP message

**Example Request:**
```
GET /api/otp/send?phone=1234567890&length=6&expiry=5&company=My%20Company&language=en&name=Eduardo&template=login&image=https%3A%2F%2Fexample.com%2Fimage.jpg
```
  "company": "My Company",
  "language": "en",
  "image": "https://cdn.pixabay.com/photo/2023/03/15/20/46/background-7855413_640.jpg",
  "name": "Eduardo",
  "template": "login"
}
```

**Example Query String Request:**
```
POST /api/otp/send?phone=59898297150&image=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2023%2F03%2F15%2F20%2F46%2Fbackground-7855413_640.jpg&name=Eduardo&company=Test%20Company&template=login&language=en
```

**Example Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": { /* Response from external service */ },
  "timestamp": "2025-07-06T...",
  "phone": "123****7890"
}
```

### 3. Verify OTP
**GET** `/api/otp/verify`

Verifies an OTP for the specified phone number.

**Query Parameters:**
- `phone` (required): Phone number (10-15 digits)
- `otp` (required): OTP code (4-8 digits)

**Example Request:**
```
GET /api/otp/verify?phone=1234567890&otp=123456
```

**Request Body (JSON) or Query Parameters:**
- `phone` (required): Phone number (10-15 digits)
- `otp` (required): OTP code (4-8 digits)

**Example Request:**
```json
POST /api/otp/verify
{
  "phone": "1234567890",
  "otp": "123456"
}
```

**Example Success Response:**
```json
{
  "success": true,
  "message": "OTP verification completed",
  "data": { /* Response from external service */ },
  "timestamp": "2025-07-06T...",
  "phone": "123****7890"
}
```

**Example Failure Response:**
```json
{
  "success": false,
  "message": "OTP verification failed",
  "error": "Invalid or expired OTP",
  "timestamp": "2025-07-06T..."
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `405`: Method Not Allowed
- `500`: Internal Server Error
- `503`: Service Unavailable (external service down)

## Security Features

1. **Input Validation**: All parameters are validated for format and range
2. **Phone Number Masking**: Phone numbers are masked in responses
3. **Timeout Protection**: Requests have appropriate timeouts
4. **CORS Support**: Includes CORS headers for cross-origin requests
5. **Error Logging**: Errors are logged for debugging

## Rate Limiting

Consider implementing rate limiting for these endpoints to prevent abuse, especially for the send OTP endpoint.

## Usage Examples

### Frontend JavaScript Example:
```javascript
// Send OTP with all parameters
const sendOTP = async (phone, options = {}) => {
  const {
    company = "My App",
    length = 6,
    expiry = 5,
    language = "en",
    image,
    name,
    template
  } = options;

  const params = new URLSearchParams({
    phone,
    company,
    length: length.toString(),
    expiry: expiry.toString(),
    language,
    ...(image && { image }),
    ...(name && { name }),
    ...(template && { template })
  });

  const response = await fetch(`/api/otp/send?${params.toString()}`);
  return response.json();
};

// Send OTP with personalized template
const sendPersonalizedOTP = async (phone, name, template = "login") => {
  return sendOTP(phone, { 
    name, 
    template, 
    company: "My App",
    image: "https://example.com/logo.png"
  });
};

// Verify OTP
const verifyOTP = async (phone, otp) => {
  const params = new URLSearchParams({ phone, otp });
  const response = await fetch(`/api/otp/verify?${params.toString()}`);
  return response.json();
};
  const response = await fetch('/api/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp })
  });
  return response.json();
};

// Get templates
const getTemplates = async (language = 'en') => {
  const response = await fetch(`/api/otp/templates?language=${language}`);
  return response.json();
};
```
