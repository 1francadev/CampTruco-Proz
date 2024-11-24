const divSemTime = document.getElementById('semTime');
const divTeams = document.getElementById('teams');
const inputNomeTime = document.getElementById('inputNomeTime');
const confirmar = document.getElementById('confirmar');

const players = [];
const teams = [];
const playersSelected = [];
let teamIndexSelected = null;

const modoDeJogo = localStorage.getItem('modoDeJogo');

if (modoDeJogo) {
    console.log("Modo de jogo escolhido: " + modoDeJogo);
    document.getElementById("modoEscolhido").textContent = `Modo de Jogo: ${modoDeJogo}`;
} else {
    console.log("Nenhum modo de jogo foi selecionado.");
}

async function buscarSemTime() {
    try {
        const response = await fetch('http://localhost:3001/api/teams/SemTime');
        const playersWithoutTeam = await response.json();
        console.log(playersWithoutTeam)
        renderSemTimes(playersWithoutTeam);
    } catch (erro) {
        console.error("Erro ao buscar dados das APIs:", erro);
    }
}

async function buscarTimes() {
    try {
        const response = await fetch('http://localhost:3001/api/teams/ComTimes');
        if (!response.ok) throw new Error('Erro ao buscar times do banco de dados.');
        const teamsFromDB = await response.json();
        console.log(teamsFromDB)

        teams.length = 0;
        teamsFromDB.forEach(team => {
            const members = team.players.map(player => ({
                id: player.id,
                username: player.username || 'Unknown'
            }));

            teams.push({
                nome: team.teamName,
                members
            });
        });

        renderTimes();
    } catch (erro) {
        console.error("Erro ao buscar dados das APIs:", erro);
    }
}

function renderSemTimes(players) {
    divSemTime.innerHTML = '<h3>Players sem Time</h3>';
    players.forEach(player => {
        const divPlayer = document.createElement('div');
        divPlayer.classList.add('player');
        divPlayer.textContent = player.username;
        divPlayer.addEventListener('click', () => selecionarPlayer(player, divPlayer));
        divSemTime.appendChild(divPlayer);
    });
}

function renderTimes() {
    divTeams.innerHTML = '<h3>Times Formados</h3>';
    teams.forEach((team, index) => {
        const divTeam = document.createElement('div');
        divTeam.classList.add('teams');
        const player1 = team.members[0]?.username || 'Unknown';
        const player2 = team.members[1]?.username || 'Unknown';
        divTeam.textContent = team.nome ? `${team.nome} (${player1} e ${player2})` : `${player1} e ${player2}`;
        divTeam.addEventListener('click', () => selecionarTeam(index, divTeam));
        if (index === teamIndexSelected) divTeam.classList.add('selected');
        divTeams.appendChild(divTeam);
    });

    inputNomeTime.style.display = 'none';
    confirmar.style.display = 'none';
}

function selecionarPlayer(player, element) {
    const index = playersSelected.indexOf(player);

    if (index !== -1) {
        playersSelected.splice(index, 1);
        element.classList.remove('selected');
    } else {
        if (playersSelected.length === 2) {
            const firstSelected = playersSelected.shift();
            const firstElement = [...divSemTime.getElementsByClassName('player')].find(
                el => el.textContent === firstSelected.username
            );
            if (firstElement) {
                firstElement.classList.remove('selected');
            }
        }

        playersSelected.push(player);
        element.classList.add('selected');
    }
}


function selecionarTeam(index, element) {
    if (index === teamIndexSelected) {
        teamIndexSelected = null;
        element.classList.remove('selected');
    } else {
        teamIndexSelected = index;
        renderTimes();
    }
}

document.getElementById('formarTime').addEventListener('click', async () => {
    if (playersSelected.length === 2) {
        const teamName = prompt('Digite um nome para o time:');
        if (!teamName) {
            alert('Você precisa digitar um nome para o time!');
            return;
        }

        const newTeam = {
            nome: teamName,
            members: [...playersSelected],
        };

        const salvo = await salvarTimeNoBanco({
            nome: newTeam.nome,
            members: playersSelected,
        }, 'N');

        if (salvo) {
            teams.push(newTeam);
            playersSelected.forEach(player => {
                const index = players.findIndex(p => p.id === player.id);
                if (index !== -1) players.splice(index, 1);
            });
            playersSelected.length = 0;
            buscarSemTime();
            renderTimes();
        }
    }
});

document.getElementById('desfazerTime').addEventListener('click', async () => {
    if (teamIndexSelected !== null) {
        const teamToRemove = teams[teamIndexSelected];

        try {
            const response = await fetch(`http://localhost:3001/api/teams/${teamToRemove.nome}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            console.log(result.message);

            players.push(...teamToRemove.members);
            teams.splice(teamIndexSelected, 1);
            teamIndexSelected = null;

            renderTimes();
            buscarSemTime();
        } catch (erro) {
            console.error('Erro ao excluir time:', erro);
            alert('Erro ao desfazer o time. Tente novamente.');
        }
    } else {
        alert('Nenhum time selecionado para desfazer.');
    }
});


document.getElementById('renomearTime').addEventListener('click', () => {
    if (teamIndexSelected !== null) {
        inputNomeTime.style.display = 'block';
        confirmar.style.display = 'block';
    }
});

confirmar.addEventListener('click', async () => {
    if (teamIndexSelected !== null && inputNomeTime.value.trim()) {
        try {
            const newTeam = inputNomeTime.value.trim();
            const oldTeam = teams[teamIndexSelected];

            const response = await fetch(`http://localhost:3001/api/teams/${oldTeam.nome}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newTeam: newTeam,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao modificar o time no banco.');
            }

            teams[teamIndexSelected].nome = inputNomeTime.value.trim();
            inputNomeTime.value = '';
            teamIndexSelected = null;

            renderTimes();
        } catch (erro) {
            console.error('Erro ao renomear time:', erro);
            alert('Erro ao renomear time. Tente novamente');
        }
    }
});

async function salvarTimeNoBanco(teams, start) {
    try {
        if (start === 'N') {
            const response = await fetch('http://localhost:3001/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: teams.nome,
                    player1_id: teams.members[0].id,
                    player2_id: teams.members[1].id,
                }),
            });

            if (!response.ok) throw new Error('Erro ao salvar o time no banco.');

            const data = await response.json();
            console.log('Time salvo com sucesso:', data);
            return { success: true, message: 'Time salvo no banco de dados.' };
        }

        if (start === 'Y') {
            if (teams.length < 2) {
                throw new Error('Não há times suficientes para iniciar o jogo.');
            }

            const response = await fetch('http://localhost:3001/api/teams/startGame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team1_name: teams[0].teamName,
                    team2_name: teams[1].teamName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro desconhecido ao iniciar o jogo.');
            }

            console.log('Jogo iniciado com sucesso:', data);
            return data;
        }
    } catch (erro) {
        console.error('Erro:', erro.message);
        return { success: false, error: erro.message };
    }
}

async function verificarTimesEAvancar() {
    try {
        const response = await fetch('http://localhost:3001/api/teams/ComTimes');
        if (!response.ok) throw new Error('Erro ao buscar times do banco de dados.');

        const teamsFromDB = await response.json();

        if (teamsFromDB.length >= 2 && localStorage.getItem('modoDeJogo') === '2 duplas') {
            const result = await salvarTimeNoBanco(teamsFromDB.slice(0, 2), "Y");

            const matchId = result.matchId;

            if (result.success) {
                alert(result.message);
                window.location.href = `gamePage.html?matchId=${matchId}`;
            } else {
                alert(result.error);
            }

        } else {
            alert(`Times encontrados: ${teamsFromDB.length}. Não há times suficientes para começar o jogo.`);
        }
    } catch (erro) {
        console.error('Erro ao verificar os times e avançar:', erro.message);
        alert(erro.message);
    }
}



document.getElementById('comecarJogo').addEventListener('click', verificarTimesEAvancar);

buscarSemTime();
buscarTimes();