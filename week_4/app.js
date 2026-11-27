require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const pool = require("./db");


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

  if (!partial && body.director === undefined) {
    errors.push("director is required");
  }

  if (
    body.director !== undefined &&
    (typeof body.director !== "string" || body.director.trim().length === 0)
  ) {
    errors.push("director must be a non-empty string");
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

const port = Number(process.env.PORT);

app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});

app.get("/movies", async (req, res, next) => {
    const { director, year, sortBy = "id" } = req.query;

    if (!["id", "year", "title"].includes(sortBy)) {
        return res.status(400).json({ error: "sortBy must be id, year or title" });
    }

    if (director !== undefined && typeof director !== "string") {
        return res.status(400).json({ error: "Enter one director" });
    }

    const releaseYear = Number(year);
    if (year !== undefined && (typeof year !== "string" || year.trim() === "" || !Number.isInteger(releaseYear))) {
        return res.status(400).json({ error: "year must be an integer" });
    }

    try {
        const databaseResult = await pool.query(`
            SELECT id, title, director, release_year AS year
            FROM movies
            ORDER BY id
        `);

        let result = databaseResult.rows;

        if (director !== undefined) {
            const directorName = director.toLowerCase();
            result = result.filter((movie) => movie.director.toLowerCase() === directorName);
        }

        if (year !== undefined) {
            result = result.filter((movie) => movie.year === releaseYear);
        }

        if (sortBy === "year") {
            result.sort((a, b) => a.year - b.year);
        } else if (sortBy === "title") {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
});

app.get("/movies/:id", async (req, res, next) => {
    const id = req.params.id;

    if (id.startsWith("0")){
        return res.status(400).json( { error: "Invalid movie ID" });
    }

    for(const character of id){
        if(character < "0" || character > "9") {
            return res.status(400).json({ error: "Invalid movie ID" });
        }
    }

    try {
        const result = await pool.query(`
            SELECT
            id,
            title,
            director,
            release_year AS year
            FROM movies
            WHERE id = $1
            `, [id]);

        if (result.rows.length == 0){
            return res.status(404).json({ error: "Movie not found" });
        }
        res.json(result.rows[0]);
    }
    catch (error){
        if(error.code == "22003"){
            return res.status(400).json({ error: "Invalid movie ID"});
        }
        next(error);
    }
});

app.post("/movies", async (req,res, next) =>{
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
    const { title, director, year} = req.body;

    try{
        const result = await pool.query(`
            INSERT INTO movies (title, director, release_year)
            VALUES ($1, $2, $3)
            RETURNING id, title, director, release_year AS YEAR
            `, [title, director, year]);

            res.status(201).json(result.rows[0]);
    }
    catch (error){
        next(error);
    }
});

app.patch("/movies/:id", async (req, res, next) => {
    const body = req.body || {};
    const errors = validateMovie(body, true);

    if (errors.length > 0) {
        return res.status(400).json({ error: "Invalid movie data", details: errors });
    }

    const allowedFields = {
        title: "title",
        director: "director",
        year: "release_year"
    };

    const changes = [];
    const values = [];

    for (const field of Object.keys(allowedFields)) {
        if (body[field] !== undefined) {
            const column = allowedFields[field];
            values.push(body[field]);
            changes.push(`${column} = $${values.length}`);
        }
    }

    if (changes.length === 0) {
        return res.status(400).json({ error: "Send at least one movie field" });
    }

    values.push(req.params.id);
    const idParameter = values.length;

    try {
        const result = await pool.query(`
            UPDATE movies
            SET ${changes.join(", ")}
            WHERE id = $${idParameter}
            RETURNING id, title, director, release_year AS year
        `, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        // PostgreSQL rejected the ID as an invalid or out-of-range integer.
        if (error.code === "22P02" || error.code === "22003") {
            return res.status(400).json({ error: "Invalid movie ID" });
        }

        next(error);
    }
});

app.delete("/movies/:id", async (req, res, next) => {
    const id = req.params.id;

    try {
        const result = await pool.query(`
            DELETE FROM movies
            WHERE id = $1
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

app.put("/movies/:id", async (req,res, next) =>{
    const id = req.params.id

    if(id.startsWith("0")){
        return res.status(400).json({
            error: "Invalid movie ID"
        });
    }

    for(const character of id){
        if(character < "0" || character > "9"){
            return res.status(400).json({
                error: "Invalid movie ID"
            });
        }
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

    const { title, director, year} = req.body;

    try{
        const result = await pool.query (`
            UPDATE movies
            SET title = $1,
            director = $2,
            release_year = $3
            WHERE id = $4
            RETURNING id, title, director, release_year AS year
            ` ,[title, director, year, id]);

        if(result.rows.length == 0){
            return res.status(404).json({
                error: "Movie not found"
            });
        }
        res.json(result.rows[0]);
    }
    catch(error){
        if(error.code == "22003"){
            return res.status(400).json({ error: "Invalid movie ID"});
        }
        next(error);
    }
})

app.get("/health/database", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW() AS database_time");

        res.json({
            status: "ok",
            databaseTime: result.rows[0].database_time
        });
    } catch (error) {
        next(error);
    }
});

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
