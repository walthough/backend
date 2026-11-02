//Create a server by using Express

const express = require ("express");

const app = express();

app.use(express.json());

const PORT = 3000;

let movies = [
    {
        id: 1,
        title:"Inception",
        director:"Christopher Nolan",
        year: 2010
    }
];
// The first rest enpoint just sending a message to the client

app.get("/", (req, res) => {
    res.send("Hello from my new Express server");
})

app.get("/movies", (req, res)=>
{
    res.json(movies);
})

app.get("/movies/:id", (req, res) =>{
    const id = Number(req.params.id);
    const movie = movies.find((movie) => movie.id === id);

    if(!movie){
        return res.status(404).json({ error: "That movie is not in our listing"})
    }

    res.json(movie);
});

//Create a new movie
app.post("/movies", (req, res) => {
    const { title, director, year } = req.body;

    if(!title || !director || !year){
        return res.status(400).json({
            error: "title, director and year are required"
        });
    }
    const newMovie = {
        id: movies.length + 1,
        title,
        director,
        year
    };
    movies.push( newMovie );
    res.status(201).json(newMovie);
})

app.listen(PORT, () => {
    console.log("Server listening at port 3000")
});
