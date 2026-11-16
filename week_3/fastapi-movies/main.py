from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

movies = [
    {
        "id" :1,
        "title": "Inception",
        "director": "Christopher Nolan",
        "year" :2010,
        "genre": "Sci-Fi"
    },
    {
        "id": 2,
        "title": "The Matrix",
        "director": "The Wachowskis",
        "year": 1999,
        "genre": "Sci-Fi"
    },
    {
        "id": 3,
        "title": "Parasite",
        "director": "Bong Joon-ho",
        "year": 2019,
        "genre": "Thriller"
    }
]

next_id = 4

class MovieCreate(BaseModel):
    title:str
    director: str
    year: int
    genre: str

class MovieUpdate(BaseModel):
    title: str | None = None
    director: str | None = None
    year: int | None = None
    genre: str | None = None

@app.get("/")
def root():
    return {"message" : "Hello from FastAPI"}

@app.get("/movies")
def get_movies(genre: str | None = None, minYear: int | None = None):
    result = []

    for movie in movies:
        if genre is not None and movie["genre"].lower() != genre.lower():
            continue

        if minYear is not None and movie["year"] < minYear:
            continue

        result.append(movie)
        
    return result


@app.get("/movies/{movie_id}")
def get_movie(movie_id: int):
    for movie in movies:
        if movie["id"] == movie_id:
            return movie

    raise HTTPException(status_code=404, detail="Movie not found")

@app.post("/movies", status_code = 201)
def create_movie(movie: MovieCreate):
    global next_id

    new_movie = {"id": next_id, **movie.model_dump()}
    next_id += 1
    movies.append(new_movie)

    return new_movie

@app.put("/movies/{movie_id}")
def replace_movie(movie_id: int, updated_movie: MovieCreate):
    for movie in movies:
        if movie["id"] == movie_id:
            movie.update(updated_movie.model_dump())
            return movie

    raise HTTPException(status_code=404, detail="Movie not found")

@app.patch("/movies/{movie_id}")
def update_movie(movie_id: int, updated_movie: MovieUpdate):
    for movie in movies:
        if movie["id"] == movie_id:
            changes = updated_movie.model_dump(exclude_unset = True)
            movie.update(changes)
            return movie

    raise HTTPException(status_code=404, detail="Movie not found")

@app.delete("/movies/{movie_id}", status_code = 204)
def delete_movie(movie_id: int):
    for movie in movies:
        if movie["id"] == movie_id:
            movies.remove(movie)
            return
    raise HTTPException(status_code = 404, detail = "Movie not found")


