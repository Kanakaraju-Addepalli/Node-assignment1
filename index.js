const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "database.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/users/", async (request, response) => {
  getUsersQuery = `SELECT * FROM users ORDER BY user_id;`;
  const usersArray = await db.all(getUsersQuery);
  response.send(usersArray);
});

app.get("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const getUserQuery = `
    SELECT
      *
    FROM
      users
    WHERE
      user_id = ${userId};`;
  const user = await db.get(getUserQuery);
  response.send(user);
});

app.post("/users/", async (request, response) => {
  const userDetails = request.body;
  const { name, email, phone } = userDetails;
  const addUserQuery = `INSERT INTO users ( name, email, phone) VALUES ('${name}', '${email}', '${phone}');`;
  const dbResponse = await db.run(addUserQuery);
  const userLastId = dbResponse.lastID;
  response.send({ userLastId: userLastId });
});

app.delete("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const deleteUserQuery = `
    DELETE FROM
      users
    WHERE
      user_id = ${userId};`;
  await db.run(deleteUserQuery);
  response.send("User Deleted Successfully");
});

app.put("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const userUpdateDetails = request.body;
  const { name, email, phone } = userUpdateDetails;
  const updateUserQuery = `
    UPDATE
      users
    SET
      name = ?,
      email = ?,
      phone = ?
    WHERE
      user_id = ?;`;

  await db.run(updateUserQuery, [name, email, phone, userId]);
  response.send("User Updated Successfully");
});
