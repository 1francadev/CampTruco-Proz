const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const usersSrc = require('./src/users');
const adminSrc = require('./src/admin');
const gameSrc = require('./src/game');
const teamsSrc = require('./src/teams');

app.use('/api/users', usersSrc);
app.use('/api/admin', adminSrc);
app.use('/api/game', gameSrc);
app.use('/api/teams', teamsSrc);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});