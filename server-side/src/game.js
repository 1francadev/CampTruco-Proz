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


/*
Não tem como eu pegar essas informações do body, vou ter que dar um post para acessar essas informações
*/


//função para inserir o ganhador
router.post('/ganhador', (req, res) => {
    const { vencedor, time1, time2 } = req.body;

    if (!vencedor || !time1 || !time2) {
        return res.status(400).json({ error: 'Dados incompletos fornecidos.' });
    }

    // Query para buscar os IDs dos times pelo nome
    const queryBuscarTimes = `
        SELECT id, name
        FROM teams
        WHERE name IN (?, ?)
    `;

    db.query(queryBuscarTimes, [time1, time2], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar os IDs dos times:', erro);
            return res.status(500).json({ error: 'Erro no servidor ao buscar os times.' });
        }

        if (resultados.length !== 2) {
            return res.status(404).json({ error: 'Um ou mais times não encontrados.' });
        }

        // Mapeando os IDs
        const team1_id = resultados.find(team => team.name === time1)?.id;
        const team2_id = resultados.find(team => team.name === time2)?.id;
        const winner_team_id = resultados.find(team => team.name === vencedor)?.id;

        if (!team1_id || !team2_id || !winner_team_id) {
            return res.status(404).json({ error: 'Erro ao mapear IDs dos times.' });
        }

        // Inserindo os dados na tabela matches
        const queryInserirMatch = `
            INSERT INTO matches (team1_id, team2_id, winner_team_id)
            VALUES (?, ?, ?)
        `;

        db.query(queryInserirMatch, [team1_id, team2_id, winner_team_id], (erroInsercao, resultado) => {
            if (erroInsercao) {
                console.error('Erro ao inserir no banco:', erroInsercao);
                return res.status(500).json({ error: 'Erro no servidor ao inserir partida.' });
            }

            res.json({ message: 'Dados do vencedor registrados com sucesso!', id: resultado.insertId });
        });
    });
});

// função para recuperar ganhador:

router.get('/recuperar-ganhador', (req, res) => {
    // Lógica para recuperar o ganhador no banco de dados
    const query = `
        SELECT t.name AS vencedor
        FROM matches m
        JOIN teams t ON t.id = m.winner_team_id
        ORDER BY m.created_at DESC LIMIT 1
    `;

    db.query(query, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao recuperar o ganhador:', erro);
            return res.status(500).json({ error: 'Erro ao recuperar o ganhador' });
        }

        if (resultados.length > 0) {
            const vencedor = resultados[0].vencedor;
            res.json({ vencedor });
        } else {
            res.status(404).json({ error: 'Nenhum ganhador encontrado' });
        }
    });
});

router.get("/:matchId", (req, res) => {
    const matchId = req.params.matchId;
    const query = "SELECT team1_id, team2_id FROM matches WHERE id = ?";
    console.log("line 102 game", matchId);

    handleQuery(res, query, [matchId], async results => {
        let team1Id, team2Id;

        if (results.length > 0) {
            team1Id = results[0].team1_id;
            team2Id = results[0].team2_id;
        } else {
            res.status(404).json({ error: 'ID dos players invalidos' });
        }

        const [teams1_name] = await db.promise().query("SELECT name FROM teams WHERE id = ?", [team1Id]);
        const [teams2_name] = await db.promise().query("SELECT name FROM teams WHERE id = ?", [team2Id]);

        console.log("Print dos Nomes: Team 1 Nome = " , teams1_name , ", Team 2 Nome = " , teams2_name);

        res.status(201).json({ data: { success: true, team1_id: teams1_name, team2_id: teams2_name } });
    });
});


module.exports = router;