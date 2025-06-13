# TIEMPO-104: Event image upload fails with 403 error during creation

## Issue Summary
When creating a new event and selecting an image to upload, the image upload fails with a 403 (Forbidden) error. The event is created successfully but without the image.

## Root Cause
The frontend was manually setting `Content-Type: 'multipart/form-data'` header without the required boundary parameter. When using FormData with axios, the Content-Type header must be omitted so axios can set it automatically with the proper boundary.

## Solution
Removed the manual Content-Type header from `src/app/utils/uploadEventImages.js`. Axios will now automatically set the correct multipart/form-data header with the required boundary parameter.

## Changes Made
- File: `src/app/utils/uploadEventImages.js`
- Change: Removed line setting `'Content-Type': 'multipart/form-data'` from headers object
- Result: Headers object is now empty initially, only adding Authorization header if authToken is provided

## Testing Notes
- Test event creation with image upload
- Verify image is successfully uploaded to Azure blob storage
- Confirm event is created with the uploaded image URL
- Test with different image formats (jpg, png, etc.)

## Risk Assessment
- Low risk - simple header fix
- No breaking changes - only affects image upload
- No backend changes required