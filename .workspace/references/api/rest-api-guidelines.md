# REST API Guidelines

## Naming

GET /users

POST /users

PUT /users/:id

DELETE /users/:id

## Responses

Always return:

success

message

data

errors (when applicable)

## Status Codes

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error
