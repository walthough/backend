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

let nextId = 4;

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
        id: nextId++,
        title: req.body.title,
        director: req.body.director,
        year: req.body.year
    };

    movies.push(newMovie);

    res.status(201).json(newMovie);
})

app.patch("/movies/:id", (req, res) =>{
    const movie = movies.find((movie) => movie.id == req.params.id);

    if(!movie){
        return res.status(404).json({error: "Movie not found"});
    }

    if (req.body.title != undefined) movie.title = req.body.title;
    if (req.body.director != undefined) movie.director = req.body.director;
    if(req.body.year != undefined) movie.year = req.body.year;

    res.json(movie);
})

app.delete("/movies/:id", (req, res) =>{
    const index = movies.findIndex((movie) => movie.id == req.params.id);

    if(index == -1){
        return res.status(404).json({error: "Movie not found"});
    }

    movies.splice (index, 1);
    res.status(204).end();
});