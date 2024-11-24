const express = require('express');
const router = express.Router();
const db = require('../db');

const handleQuery = (res, query, params, callback) => {
    db.query(query, params, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao executar a consulta!' });
            console.log(err);
            return;
        }
        callback(results);
    });
};

async function TeamsFilter(api, callback) {
    try {
        const [users] = await db.promise().query('SELECT * FROM users');
        const [teams] = await db.promise().query('SELECT name, player1_id, player2_id FROM teams');

        const userMap = new Map(users.map(user => [user.id, user.username]));

        const playersComTime = [];

        teams.forEach(team => {
            const player1Name = userMap.get(team.player1_id);
            const player2Name = userMap.get(team.player2_id);

            playersComTime.push({
                teamName: team.name,
                players: [
                    { id: team.player1_id, username: player1Name },
                    { id: team.player2_id, username: player2Name }
                ]
            });
        });

        const playersSemTime = users.filter(user => !playersComTime.some(team =>
            team.players.some(player => player.id === user.id)
        )).map(player => ({
            id: player.id,
            username: player.username
        }));

        const playersComTeam = playersComTime.map(team => ({
            teamName: team.teamName,
            players: team.players
        }));

        if (api === 'Y') {
            callback(playersComTeam);
        } else if (api === 'N') {
            callback(playersSemTime);
        }
    } catch (err) {
        console.error('Erro ao consultar jogadores sem time:', err);
    }
}


router.get("/", (req, res) => {
    const query = "SELECT * FROM teams";
    handleQuery(res, query, [], results => {
        res.json(results);
        console.log("get Teams Used!")
    });
});

router.get('/SemTime', (req, res) => {
    TeamsFilter("N", players => {
        res.json(players);
    });
});

router.get('/ComTimes', (req, res) => {
    TeamsFilter("Y", players => {
        res.json(players);
        // console.log(JSON.stringify(players, null, 2));
    });
});

router.post("/", (req, res) => {
    const { name, player1_id, player2_id } = req.body;

    if (!name || !player1_id || !player2_id) {
        return res.status(400).json({ error: 'Nome do time e IDs dos jogadores são obrigatórios.' });
    }

    const query = "INSERT INTO teams (name, player1_id, player2_id) VALUES (?, ?, ?)";
    const params = [name, player1_id, player2_id];
    handleQuery(res, query, params, result => {
        res.json({ message: "Dupla criada com sucesso!", id: result.insertId });
    });
});

router.delete("/:name", (req, res) => {
    const { name } = req.params;
    const query = "DELETE FROM teams WHERE name = ?";
    const params = [name];
    handleQuery(res, query, params, () => {
        res.json({ message: "Dupla excluída com sucesso!" });
    });
});

router.put("/:oldTeam", (req, res) => {
    const { oldTeam } = req.params;
    const { newTeam } = req.body;

    if (!newTeam || !oldTeam) {
        return res.status(400).json({ error: 'Nome antigo do time e o novo, está indefinido "NULL"'});
    }

    handleQuery(res, "UPDATE teams SET name = ? WHERE name = ?", [newTeam, oldTeam], () => {
        res.json({ data: { success: true, message: 'Time atualizado com sucesso!' } });
    });
});

async function teamConsult(team1, team2) {
    try {
        if (!team1 || !team2) {
            throw new Error('Os nomes dos times estão indefinidos.');
        }

        const [teams1] = await db.promise().query("SELECT id FROM teams WHERE name = ?", [team1]);
        const [teams2] = await db.promise().query("SELECT id FROM teams WHERE name = ?", [team2]);

        if (!teams1.length || !teams2.length) {
            throw new Error('Um ou ambos os times não foram encontrados no banco de dados.');
        }

        return {
            team1_id: teams1[0].id,
            team2_id: teams2[0].id,
        };
    } catch (err) {
        throw err;
    }
}

async function verifyMatch(team1_id, team2_id) {
    try {
        const [match] = await db.promise().query(
            "SELECT * FROM matches WHERE ((team1_id = ? AND team2_id = ?) OR (team1_id = ? AND team2_id = ?)) AND status = 'in_progress'",
            [team1_id, team2_id, team2_id, team1_id]
        );

        return match.length === 0; // Retorna true se não houver partidas em andamento
    } catch (err) {
        throw err;
    }
}

router.post("/startGame", async (req, res) => {
    const { team1_name, team2_name } = req.body;

    try {
        const teams = await teamConsult(team1_name, team2_name);

        const matchAvailable = await verifyMatch(teams.team1_id, teams.team2_id);

        if (!matchAvailable) {
            return res.status(400).json({ success: false, error: 'Jogo já iniciado.' });
        }

        const query = "INSERT INTO matches (team1_id, team2_id) VALUES (?, ?)";
        const params = [teams.team1_id, teams.team2_id];

        const [result] = await db.promise().query(query, params);
        const matchId = result.insertId;
        console.log("start game", matchId)

        res.status(201).json({ success: true, message: 'Jogo iniciado com sucesso!', matchId: matchId });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
