const express = require("express");
const morgan = require("morgan");


let movies = [
    {
        id: 1,
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010,
        genre: "Sci-Fi"
    },
    {
        id: 2,
        title: "The Matrix",
        director: "The Wachowskis",
        year: 1999,
        genre: "Sci-Fi"
    },
    {
        id:3,
        title: "Parasite",
        director: "Bong Joon-ho",
        year:2019,
        genre: "Thriller"

    }
];

let nextId = 4;

function validateMovie(body, partial = false) {
  const errors = [];
  const maximumYear = new Date().getFullYear() + 5;

  if (!partial && body.title === undefined) {
    errors.push("title is required");
  }

  if (
    body.title !== undefined &&
    (typeof body.title !== "string" || body.title.trim().length === 0)
  ) {
    errors.push("title must be a non-empty string");
  }

  if (!partial && body.year === undefined) {
    errors.push("year is required");
  }

  if (
    body.year !== undefined &&
    (
      !Number.isInteger(body.year) ||
      body.year < 1888 ||
      body.year > maximumYear
    )
  ) {
    errors.push("year must be a valid integer");
  }

  if (!partial && body.genre === undefined) {
    errors.push("genre is required");
  }

  if (
    body.genre !== undefined &&
    (typeof body.genre !== "string" || body.genre.trim().length === 0)
  ) {
    errors.push("genre must be a non-empty string");
  }

  return errors;
}


const app = express();

function simpleLogger(req,res, next){
    console.log(req.method, req.originalUrl);
    next();
}

app.use(express.json());

app.use(morgan("dev"));

app.listen(3000, () =>{
    console.log("Server running on http://localhost:3000");
});

app.get("/movies", (req, res) => {
    const genre = req.query.genre;
    let result = [...movies];

    if (genre !== undefined) {
        result = result.filter((movie) =>
            movie.genre.toLowerCase() === genre.toLowerCase()
        );
    }

    const minYear = req.query.minYear;

    if(minYear != undefined){
        const year = Number(minYear);

        if(minYear.trim() == "" || !Number.isInteger(year)) {
            return res.status(400).json({
                error:{
                    code:"INVALID_QUERY",
                    message: "minYear must be a valid integer"
                }
            });
        }
        
        result = result.filter((movie) => movie.year >= year);
    }

    const sort = req.query.sort;

    if(sort != undefined){
        if(sort == "year"){
            result.sort((a, b) => a.year - b.year);
        }
        else if (sort == "title"){
            result.sort((a, b) => a.title.localeCompare(b.title));
        }
        else{
            return res.status(400).json({
                error:{
                    code: "INVALID_QUERY",
                    message:"sort must be year or title"
                }
            })
        }
    }
    res.json(result);
});

app.get("/movies/:id", (req, res) => {
    const movie = movies.find((movie) => movie.id == req.params.id);

    if (!movie) {
        return res.status(404).json({
            error: {
                code: "MOVIE_NOT_FOUND",
                message: "Movie not found"
            }
        });
    }

    res.json(movie);
});

app.post("/movies", (req,res) =>{
    const errors = validateMovie(req.body);
    if(errors.length > 0){
        return res.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Movie data is invalid",
                details: errors
            }
        });

    }
    const newMovie ={
        id: nextId++,
        title: req.body.title,
        genre: req.body.genre,
        year: req.body.year
    };

    movies.push(newMovie);

    res.status(201).json(newMovie);
})

app.patch("/movies/:id", (req, res) =>{
    const movie = movies.find((movie) => movie.id == req.params.id);

    if(!movie){
        return res.status(404).json({
            error:{
            "code":  "MOVIE_NOT_FOUND",
            "message": "Movie not found"
            }
        });
    }
    const errors = validateMovie(req.body, true);
    
    if(errors.length > 0 ){
        return res.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message:"Movie data is invalid",
                details: errors
            }
        })
    }
    if (req.body.title != undefined) movie.title = req.body.title;
    if (req.body.director != undefined) movie.director = req.body.director;
    if(req.body.year != undefined) movie.year = req.body.year;
    if(req.body.genre != undefined) movie.genre = req.body.genre;

    res.json(movie);
})

app.delete("/movies/:id", (req, res) =>{
    const index = movies.findIndex((movie) => movie.id == req.params.id);

    if(index == -1){
        return res.status(404).json({
            error:{
            "code": "MOVIE_NOT_FOUND",
            "message": "Movie not found"
            }
        });
    }

    movies.splice (index, 1);
    res.status(204).end();
});

app.put("/movies/:id", (req,res) =>{
    const index = movies.findIndex((movie) => movie.id == req.params.id);

    if(index === -1){
        return res.status(404).json({
            error:{
            "code": "MOVIE_NOT_FOUND",
            "message": "Movie not found"
            }
        });
    }

    const errors = validateMovie(req.body);

    if(errors.length > 0){
        return res.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Movie data is invalid",
                details: errors
            }
        });
    }

    const updatedMovie = {
        id: movies[index].id,
        title: req.body.title,
        year: req.body.year,
        genre: req.body.genre
    };

    movies[index] = updatedMovie;
    res.status(200).json(updatedMovie);
})

app.use((req, res) => {
    res.status(404).json({
        error: {
            code: "ROUTE_NOT_FOUND",
            message: "The requested route does not exist"
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected server error occurred"
        }
    });
})