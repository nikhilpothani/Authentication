const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
const dbPath = path.join(__dirname, "userData.db");

app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};

initializeDbAndServer();

//Register User API
app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const getUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(getUserQuery);
  if (username !== dbUser.username && dbUser.username === undefined) {
    if (password.length >= 5) {
      const hashedPassword = await bcrypt.hash(request.body.password, 10);
      const postUserQuery = `
          INSERT INTO
            user (username, name, password, gender, location)
          VALUES
            ('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
      await db.run(postUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
