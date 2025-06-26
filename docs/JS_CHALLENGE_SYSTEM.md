# JavaScript Challenge Anti-Bot System

This system implements a JavaScript-based challenge mechanism to prevent bot spam on your WhatsApp profile lookup API. It requires users to solve mathematical challenges that can only be completed by executing JavaScript code, effectively blocking simple bot requests while allowing legitimate users to access the service.

## How It Works

### 1. Challenge Generation
- Server generates mathematical expressions that require JavaScript evaluation
- Examples: `15 + 23`, `[1, 2, 3, 4].reduce((a, b) => a + b, 0)`, `'hello'.length + 'hello'.charCodeAt(0)`
- Each challenge has a unique ID and expiration time (5 minutes)

### 2. Client-Side Solving
- JavaScript challenges are automatically solved in the browser using safe evaluation
- Only allows mathematical operations, array methods, and string operations
- Blocks dangerous operations like `eval()`, `Function()`, etc.

### 3. Server-Side Validation
- Server validates the solution against the original challenge
- Checks challenge expiration and authenticity
- Only allows API requests with valid challenge solutions (for unauthenticated users)

## Implementation Details

### Files Created/Modified

#### New Files:
- `utils/jsChallenge.ts` - Core challenge generation and validation logic
- `composables/useJSChallenge.ts` - Vue composable for client-side challenge handling
- `components/JSChallengeStatus.vue` - Optional UI component to show challenge status
- `server/api/challenge/generate.ts` - API endpoint to generate challenges
- `server/api/challenge/validate.ts` - API endpoint to validate solutions

#### Modified Files:
- `server/api/phone/[number].ts` - Added challenge validation to phone lookup API
- `composables/usePhoneApi.ts` - Integrated challenge system into phone API calls
- `pages/[[number]].vue` - Added challenge status component
- `i18n/locales/translations/en.json` - Added challenge-related translations

### API Flow

#### For Unauthenticated Users:
1. User initiates phone lookup
2. System automatically generates and solves JavaScript challenge
3. Challenge solution is included in API request
4. Server validates challenge before processing request
5. Request proceeds if challenge is valid

#### For Authenticated Users:
- JavaScript challenges are bypassed for authenticated users
- Regular reCAPTCHA and rate limiting still apply

### Security Features

1. **Safe Evaluation**: Only allows mathematical expressions and safe operations
2. **Challenge Expiration**: Challenges expire after 5 minutes
3. **Unique IDs**: Each challenge has a unique identifier to prevent replay attacks
4. **Server-Side Validation**: All validation happens on the server
5. **Token-Based**: Challenge data is encoded in secure tokens

### Configuration

The system is designed to be:
- **Automatic**: Works transparently for users
- **Secure**: Prevents common bot attack vectors
- **User-Friendly**: No user interaction required
- **Scalable**: Minimal server resources required

### Error Handling

- Invalid challenges result in clear error messages
- Expired challenges automatically trigger new challenge generation
- Network errors are handled gracefully with fallbacks

### Testing

A comprehensive test suite is included (`tests/jsChallenge.test.ts`) covering:
- Challenge generation and solving
- Token creation and parsing
- Security validation
- Error handling scenarios

## Usage

The system is automatically integrated into your existing phone lookup flow. No additional user interaction is required - challenges are generated, solved, and validated transparently in the background for unauthenticated users.

## Benefits

1. **Bot Prevention**: Effectively blocks automated bot requests
2. **User Experience**: No impact on legitimate user experience
3. **Performance**: Minimal overhead on client and server
4. **Security**: Multiple layers of validation and security checks
5. **Scalability**: Efficient implementation suitable for high-traffic applications
