# Reading List – Assignment 9

A full-stack Reading List app: an Express 5 REST API that keeps books in memory, and a React (Vite) client that uses it.

## How to install and run

### Server (port 3000)
```bash
cd server
npm install
npm run dev        # or: npm start
```
Environment variables (optional):
- `PORT` – server port, default `3000`
- `CLIENT_ORIGIN` – the only origin allowed by CORS, default `http://localhost:5173`

### Client (port 5173)
```bash
cd client
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:3000
npm run dev
```
Open http://localhost:5173. The server must be running. No Vite proxy is used; the server sends CORS headers with the `cors` package.

## File organization
```
server/
  server.js       Express app: CORS, express.json(), routes, 404 fallback, error middleware
  booksStore.js   In-memory data with async functions; every change creates a new array
  validate.js     Hand-written validation for ids, book bodies, PATCH merging and query options
client/
  .env.example    Documents VITE_API_URL
  src/api/books.js         All fetch calls and the shared request helper
  src/components/          FilterBar, BookForm, BookList, BookItem, Stats
  src/App.jsx              State, AbortController, handlers
```

## API
| Method and path | Success | Errors |
| --- | --- | --- |
| GET /api/books | 200 | 400 |
| GET /api/books/:id | 200 | 400, 404 |
| POST /api/books | 201 + Location | 400, 409 |
| PUT /api/books/:id | 200 | 400, 404, 409 |
| PATCH /api/books/:id | 200 | 400, 404, 409 |
| DELETE /api/books/:id | 204 | 400, 404 |
| GET /api/stats | 200 | – |

Query options for `GET /api/books`: `genre`, `read`, `q`, `sort` (title, author, year, rating; default id), `order` (asc, desc), `limit` (1–50, default 50), `page` (default 1). Invalid or repeated parameters return 400.

**Note about `GET /api/crash`:** this route deliberately throws an error inside an async handler. It is kept on purpose to prove that Express 5 forwards the error to the error middleware, which logs it and answers `500 {"error":"Something went wrong"}` without a stack trace.

## Testing evidence (curl)

### 200 - list with two query parameters (genre + sort + order)

```
$ curl --include http://localhost:3000/api/books?genre=fiction&sort=year&order=desc
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 209
ETag: W/"d1-oVKENv2c9tpMjKFv4Pdlqnz0H/M"
Date: Tue, 24 Nov 2026 19:42:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":5,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction","read":false,"rating":null},{"id":2,"title":"1984","author":"George Orwell","year":1949,"genre":"fiction","read":true,"rating":4}]
```

### 200 - one book

```
$ curl --include http://localhost:3000/api/books/1
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 107
ETag: W/"6b-XxKSi89u7rLLw+38HeuzCc6EiR0"
Date: Tue, 24 Nov 2026 19:42:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"The Hobbit","author":"J.R.R Tolkien","year":1937,"genre":"fantasy","read":true,"rating":5}
```

### 200 - stats BEFORE the change

```
$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 111
ETag: W/"6f-9Com2+fTwt9FBQlaxdwBSBytRYA"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":6,"read":4,"unread":2,"averageRating":4.3,"byGenre":{"fantasy":2,"fiction":2,"science":1,"history":1}}
```

### 201 - create a book (see the Location header)

```
$ curl --include -X POST http://localhost:3000/api/books -H Content-Type: application/json -d {"title":"Cosmos","author":"Carl Sagan","year":1980,"genre":"science"}
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/7
Content-Type: application/json; charset=utf-8
Content-Length: 104
ETag: W/"68-uVi4dmo0zj/pOVyXCji8yfYzh9o"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Cosmos","author":"Carl Sagan","year":1980,"genre":"science","read":false,"rating":null,"id":7}
```

### 200 - stats AFTER the change

```
$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 111
ETag: W/"6f-uy/Vi5wMrHRhlLUypDLnDHEwaKs"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":7,"read":4,"unread":3,"averageRating":4.3,"byGenre":{"fantasy":2,"fiction":2,"science":2,"history":1}}
```

### 400 - invalid body (year in the future)

```
$ curl --include -X POST http://localhost:3000/api/books -H Content-Type: application/json -d {"title":"Future Book","author":"Someone","year":3000,"genre":"science"}
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 57
ETag: W/"39-2hxkQVGUygT77eAZY8u2BQSh9Ts"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"year must be an integer between 1000 and 2026"}
```

### 400 - repeated query parameter

```
$ curl --include http://localhost:3000/api/books?genre=fiction&genre=history
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-6mT0mDMdSpAfOdjXJoHaV9ooo4w"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Query parameter \"genre\" must not be repeated"}
```

### 404 - missing book

```
$ curl --include http://localhost:3000/api/books/999
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 38
ETag: W/"26-NCNuNg8Bq8kpSh64K6XedJL3BrE"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book with id 999 not found"}
```

### 409 - duplicate (same title and author, different case)

```
$ curl --include -X POST http://localhost:3000/api/books -H Content-Type: application/json -d {"title":"cosmos","author":"carl sagan","year":1980,"genre":"science"}
HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 67
ETag: W/"43-Ns0oU53C+GosTOBRuE9ls39glLQ"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with this title and author already exists (id 7)"}
```

### PUT - replace the whole book (every field must be sent)

```
$ curl --include -X PUT http://localhost:3000/api/books/7 -H Content-Type: application/json -d {"title":"Cosmos","author":"Carl Sagan","year":1980,"genre":"science","read":true,"rating":5}
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 100
ETag: W/"64-/ts9con/OYrAmc1rWXTzuDXcppc"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Cosmos","author":"Carl Sagan","year":1980,"genre":"science","read":true,"rating":5,"id":7}
```

### PUT with only one field - 400 because PUT needs a complete book

```
$ curl --include -X PUT http://localhost:3000/api/books/7 -H Content-Type: application/json -d {"rating":4}
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 73
ETag: W/"49-CbnR+uYCFHPnSLYiIGW8T54j3Lw"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"title is required and must be a string of 1 to 100 characters"}
```

### PATCH with only one field - 200, other fields are kept

```
$ curl --include -X PATCH http://localhost:3000/api/books/7 -H Content-Type: application/json -d {"rating":4}
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 100
ETag: W/"64-Sp9yEalLza11qQqrVG4VHryOQkY"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Cosmos","author":"Carl Sagan","year":1980,"genre":"science","read":true,"rating":4,"id":7}
```

### 204 - delete

```
$ curl --include -X DELETE http://localhost:3000/api/books/7
HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5


```

### 404 - the same delete repeated

```
$ curl --include -X DELETE http://localhost:3000/api/books/7
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 36
ETag: W/"24-HIfh0codT9o3vSyTciAegQybDnI"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book with id 7 not found"}
```

### 400 - malformed JSON (JSON error, not HTML)

```
$ curl --include -X POST http://localhost:3000/api/books -H Content-Type: application/json -d {"title": 
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 42
ETag: W/"2a-Kp6r6EoQdfa9J08PVdn0M1MJ9NY"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Malformed JSON in request body"}
```

### 404 - unknown route under /api

```
$ curl --include http://localhost:3000/api/nothing
HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 500 - GET /api/crash throws inside an async handler

```
$ curl --include http://localhost:3000/api/crash
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 32
ETag: W/"20-cI8B1wZuBEyTE5ClDvphKZx7wd0"
Date: Tue, 24 Nov 2026 19:42:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Something went wrong"}
```



## Preflight evidence

![Preflight request](preflight.png)

When I clicked "Mark as read", the browser first sent an `OPTIONS` request to `/api/books/[id]` before the `PATCH`, because the request uses the PATCH method and a `Content-Type: application/json` header. The preflight answered `204` with `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE` and `Access-Control-Allow-Headers: content-type`. After that the browser sent the real PATCH.

## Reasoning questions

**1. Parameters.** The id identifies one specific resource, so it belongs in the path: `/api/books/3` is the address of book 3. `genre` and `sort` do not identify a resource; they only filter or order the list at `/api/books`, so they are optional query parameters. If the id were in the query string (`/api/books?id=3`), the URL would look like a filtered list instead of a single resource, and the route could not clearly answer 404 for a missing book.

**2. Body parsing (experiment).** I moved `express.json()` below the routes. [Ne gördüğünü yaz: req.body undefined oldu, POST ... status ve mesaj ile döndü.] This happens because middleware runs in order, so the body was not parsed yet when the route ran.

**3. One response (experiment).** I removed the `return` before the 404 in `GET /api/books/:id` and requested id 999. [Ne gördüğünü yaz: client 404 aldı ama sunucu terminalinde "Cannot set headers after they are sent to the client" hatası çıktı.] Without `return` the function continued and tried to send a second response after the first one was already sent.

**4. PUT and PATCH.** PATCH is better when I only want to change one field, for example marking a book as read: I send `{"read": true}` and everything else stays the same. PUT is better when the user edits the whole book in the form and I want to replace all fields at once. In my curl evidence the same `{"rating":4}` body returns 400 with PUT but 200 with PATCH.

**5. CORS (experiment).** I started the server with `CLIENT_ORIGIN=http://localhost:9999`. [Konsolda gördüğün hatayı yaz: "...has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header..."] The server still received and answered the request (status [ne gördüysen] in the Network tab), but the response had no allow header, so the browser refused to give it to my JavaScript. curl still works because CORS is a rule enforced only by browsers; curl does not check these headers.

**6. Validation.** Client-side checks can be bypassed easily: anyone can send a request with curl, Postman or the browser console without using my form. The server is the only place that protects the data, so it must validate every request itself. Some rules, like the duplicate check, can only be done on the server because only it knows all the books.

**7. State (experiment).** After I added a book and restarted the server, [ne gördüğünü yaz: eklediğim kitap kayboldu, liste ilk 6 kitaba döndü]. The data lives only in the server's memory (a JavaScript variable), so it disappears when the process stops. To keep it, the data must be saved in a persistent store such as a database or a file.

## Self-study notes

- **URLSearchParams:** [kendi cümlelerinle: query string'i güvenli kurar, boşluk ve özel karakterleri otomatik kodlar. getBooks fonksiyonunda kullandım.]
- **localeCompare:** [metinleri alfabetik karşılaştırır, sort için -1/0/1 döner. Sunucudaki applyQuery'de title/author sıralamasında kullandım. Ayrıca kopyayı sıralamak için toSorted kullandım.]
- **import.meta.env and VITE_ prefix:** [Vite env değişkenlerini import.meta.env ile verir; sadece VITE_ ile başlayanlar tarayıcıya açılır ki gizli değişkenler sızmasın. .env değişince dev sunucusu yeniden başlatılmalı.]
- **204 in Express 5:** [res.status(204).end() kullandım; 204'te gövde gönderilmez. Client tarafında 204 gelince response.json() çağırmıyorum.]
- **AbortController and AbortError:** [useEffect içinde controller oluşturup signal'i fetch'e veriyorum; cleanup'ta abort() çağırıyorum. İptal edilen fetch AbortError fırlatıyor, err.name === 'AbortError' ise hatayı yok sayıyorum.]

## Challenges

- I ran `npm run dev` from the project root instead of the `server` folder and got an `ENOENT ... package.json` error. I learned that npm commands must run where `package.json` is.
- I forgot to import `getBookById`, and Express returned an HTML error page with a stack trace. This showed why the JSON error middleware is needed.
- Another project was using port 5173, so Vite started on 5174 and the browser blocked my requests with a CORS error, because the server only allows `http://localhost:5173`. Stopping the other project fixed it.
- [Kendi eklemek istediğin başka bir zorluk varsa yaz.]