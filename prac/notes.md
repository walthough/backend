## Week 1 Notes
What does backend actually do?
- Receives HTTP request
- Validates input and permissions
- Apply business rules?
- 

What is a Request?
- 


Anatomy of HTTP request?
- Method POST 
- Path /api/movies
- Headers Content-Type
- Body {...}

POST /api/movies HTTP/1.1
Host: localhost:3000
Content-Type: application/json
{
    "title": "Inception",
    "year": 2010;
}

Anatomy of HTTP response
- Status

HTTP/1.1 201 Created
Content-Type: application/json

{
    "id:" 42,
    "title": "Inception",
    "year": 2010
}

REST
- design URLs around nouns. use HTTP methods for operations.

Resource-Based

GET /movies
GET /movies/42
POST /movies
PATCH /movies/42
DELETE /movies/42

CRUD maps naturally to HTTP

CREATE, READ, UPDATE, DELETE

CREATE POST /movies Add a movie
READ GET /movies/42 Fetch a movie
UPDATE PATCH /movies/42 Change fields
DELETE DELETE /movies/42 Remove a movie

Status codes 

- SUCCESS
200 OK
201 Created
204 No Content


- CLIENT ERROR



JSON
{
    "id": 42,
    "title": "Inception",
    "year":2010
}


npm init -y ?