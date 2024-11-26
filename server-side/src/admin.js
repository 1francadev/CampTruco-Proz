const express = require('express');
const router = express.Router();
const db = require('../db');

const handleQuery = (res, query, params, callback) => {
    db.query(query, params, (err, results) => {
        if (err) {
            res.status(500).json({ data: { success: false }, error: 'Erro ao executar a consulta!' });
            console.log(err)
            return
        }
        callback(results)
    });
};

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    handleQuery(res, "SELECT * FROM users WHERE (username = ? AND password = ? AND isAdmin = true)", [username, password], results => {
        console.log("API /login Usada!", username);

        if (results.length > 0) {
            res.json({ data: { success: true, message: 'Login bem-sucedido!' } });
        } else {
            res.json({ data: { success: false, message: 'Usuário ou senha inválidos!' } });
        }
    });
});

router.get("/matches", (req, res) => {
    handleQuery(res, "SELECT * FROM matches WHERE status = 'in_progress'", [], results => {
        res.json({ data: { success: true, matches: results } });
        console.log("Matches Consultada com sucesso.")
    });
});

async function teamConsult2(team1_id, team2_id) {
    try {
        if (!team1_id || !team2_id) {
            throw new Error('Os IDs dos times estão indefinidos.');
        }

        const [teams1] = await db.promise().query("SELECT name FROM teams WHERE id = ?", [team1_id]);
        const [teams2] = await db.promise().query("SELECT name FROM teams WHERE id = ?", [team2_id]);

        if (!teams1.length || !teams2.length) {
            throw new Error('Um ou ambos os times não foram encontrados no banco de dados.');
        }

        return {
            team1_name: teams1[0].name,
            team2_name: teams2[0].name,
        };
    } catch (err) {
        throw err;
    }
}

router.post("/getTeamName", async (req, res) => {
    const { team1_id, team2_id } = req.body;
    console.log(team1_id, team2_id)

    try {
        const teams = await teamConsult2(team1_id, team2_id);
        console.log("teams: ", teams)
        res.json({ data: { success: true, teams } });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;