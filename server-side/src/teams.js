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

router.post("/startGame", (req, res) => {
    const { name } = req.body;

    console.log(name)
});

module.exports = router;
