let movies = [
    {
        id: 1,
        title: "Inception",
        director: "Christopher Nolan",
        year: 2010
        
    },
    {
        id: 2,
        title: "The Matrix",
        director: "The Wachowskis",
        year: 1999
    },
    {
        id:3,
        title: "Parasite",
        director: "Bong Joon-ho",
        year:2019
    }
];

const express = require("express");

const app = express();

app.use(express.json());

app.listen(3000, () =>{
    console.log("Server running on http://localhost:3000");
});

app.get("/movies", (req, res) =>{
    res.json(movies);
});

app.get("/movies/:id", (req,res) =>{
    const movie = movies.find((movie) => movie.id == req.params.id);

    if(!movie){
        return res.status(404).json({error: "Movie not found"});
    }
    res.json(movie);
})

app.post("/movies", (req,res) =>{
    if(!req.body || !req.body.title || !req.body.director || !req.body.year){
        return res.status(400).json({
            error: "title, director and year are required"
        });
    }
    const newMovie ={
        id: movies.length + 1,
        title: req.body.title,
        director: req.body.director,
        year: req.body.year
    };

    movies.push(newMovie);

    res.status(201).json(newMovie);
})