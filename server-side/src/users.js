const express = require('express');
const router = express.Router();
const db = require('../db');

const handleQuery = (res, query, params, callback) => {
  db.query(query, params, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ data: { success: false }, error: 'Erro ao executar a consulta!' });
      return;
    }
    callback(results);
  });
};

router.get('/', (req, res) => {
  handleQuery(res, "SELECT * FROM users", [], results => {
    res.json(results);
    console.log("get Users Used!")
  });
});

router.get('/:id', (req, res) => {
  handleQuery(res, "SELECT * FROM users WHERE id = ?", req.params.id, results => {
    res.json({ data: { success: true, results } });
  });
});

router.get('/nameid/:id', (req, res) => {
  handleQuery(res, "SELECT username FROM users WHERE id = ?", req.params.id, results => {
    res.json({ data: { success: true, results } });
  });
});

router.put('/:id', (req, res) => {
  const { email, username, password } = req.body;
  const params = [username, email, password, req.params.id];

  handleQuery(res, "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?", params, () => {
    res.json({ data: { success: true, message: 'Usuário atualizado com sucesso!' } });
  });
});

router.delete('/:id', (req, res) => {
  handleQuery(res, "DELETE FROM users WHERE id = ?", req.params.id, () => {
    res.json({ data: { success: true, message: 'Usuário excluído com sucesso!' } });
  });
});

router.post('/register', (req, res) => {
  const { email, username, password } = req.body;
  const params = [email, username, password];

  handleQuery(res, "INSERT INTO users (email, username, password) VALUES (?, ?, ?)", params, result => {
    console.log("API /register Usada!", username);
    const userId = result.insertId;

    res.json({ data: { success: true, message: 'Usuário registrado com sucesso!', id: userId } });

    if (userId > 0 && userId <= 4) {
      db.query("UPDATE users SET isAdmin = 1 WHERE id = ?", [userId], (err) => {
        if (err) {
          console.error("Erro ao atualizar para administrador:", err);
        } else {
          console.log("Primeiro usuário promovido a administrador.");
        }
      });
    }
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)

  handleQuery(res, "SELECT * FROM users WHERE username = ? AND password = ?", [username, password], results => {
    console.log("API /login Usada!", username);
    if (results.length > 0) {
      res.json({ data: { success: true, message: 'Login bem-sucedido!' } });
    } else {
      res.json({ data: { success: false, message: 'Usuário ou senha inválidos!' } });
    }
  });
});

module.exports = router;
