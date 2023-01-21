const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (db) => {
  return {
    playerId: db.player_id,
    playerName: db.player_name,
    jerseyNumber: db.jersey_number,
    role: db.role,
  };
};

//Returns a list of all players in the team
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT 
            *
            FROM
            cricket_team
            ORDER BY 
            player_id;
            `;

  const playersArray = await db.all(getPlayersQuery);
  response.send(
  playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Creates a new player in the team (database)
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES
        (
            '${playerName}',
             ${jerseyNumber},
              '${role}'
        );`;

  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Returns a player based on a player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `
        SELECT 
        *
        FROM
        cricket_team
        WHERE 
        player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(
    convertDbObjectToResponseObject(player)
    );
});

//Updates the details of a player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE
            player_id = ${playerId}; `;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
        DELETE
        FROM
        cricket_team
        WHERE
        player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
