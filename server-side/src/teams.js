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
        const [teams] = await db.promise().query('SELECT player1_id, player2_id FROM teams');

        const playersComTime = new Set();
        teams.forEach(team => {
            playersComTime.add(team.player1_id);
            playersComTime.add(team.player2_id);
        });

        const playersSemTime = users.filter(user => !playersComTime.has(user.id)).map(player => ({
            id: player.id,
            username: player.username
        }));

        const playersComTeam = users.filter(user => playersComTime.has(user.id)).map(player => ({
            id: player.id,
            username: player.username
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
        console.log("get Teams Used!", results)
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

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM teams WHERE id = ?";
    const params = [id];
    handleQuery(res, query, params, () => {
        res.json({ message: "Dupla excluída com sucesso!" });
    });
});

module.exports = router;
