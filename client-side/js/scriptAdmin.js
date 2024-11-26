const createTeamsButton = document.getElementById('createTeams');
const manageMatchesButton = document.getElementById('manageMatches');
const logoutButton = document.getElementById('logout');

const matchesSection = document.querySelector('.content');
const buttonsSection = document.querySelector('.buttons');
const matchList = document.getElementById('matchList');
const backButton = document.getElementById('backButton')

createTeamsButton.addEventListener('click', () => {
    window.location.href = 'optionPage.html';
});

backButton.addEventListener('click', () => {
    buttonsSection.style.display = "flex";
    matchesSection.style.display = "none";
});

manageMatchesButton.addEventListener('click', () => {
    buttonsSection.style.display = "none";
    matchesSection.style.display = "block";
    loadmatches();
});

logoutButton.addEventListener('click', () => {
    window.location.href = 'loginPage.html';
});

async function loadmatches() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/matches');
        if (!response.ok) {
            throw new Error('Erro ao carregar as partidas');
        }
        const data = await response.json();
        if (data.data.success) {
            await displayMatches(data.data.matches);
        } else {
            matchList.innerHTML = '<p>Não há partidas em andamento.</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
        matchList.innerHTML = '<p>Erro ao carregar as partidas. Tente novamente mais tarde.</p>';
    }
}

async function displayMatches(matches) {
    matchList.innerHTML = '';
    for (const match of matches) {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';

        const teamsName = await getTeamNameById(match.team1_id, match.team2_id);
        console.log(teamsName.data);
        let matchStatus;

        if (match.status === "in_progress") {
            matchStatus = "Partida em Andamento ou Em Aberto!";
        } else if (match.status === "completed") {
            matchStatus = "Partida Finalizada";
        } else {
            matchStatus = "Partida Cancelada";
        }

        matchItem.innerHTML = `
            <div class="info">
                <p>ID da Partida: ${match.id}</p>
                <p>Time 1: ${teamsName.data.teams.team1_name} (ID: ${match.team1_id})</p>
                <p>Time 2: ${teamsName.data.teams.team2_name} (ID: ${match.team2_id})</p>
                <p>Status: ${matchStatus}</p>
                <p>Iniciado em: ${new Date(match.started_at).toLocaleString()}</p>
                ${match.ended_at ? `<p>Finalizado em: ${new Date(match.ended_at).toLocaleString()}</p>` : ''}
            </div>
            <div class="btns">
                <div id="buttonMatch" class="buttonMatch" onclick="matchEnter(${match.id})">Entrar</div>
                <div id="buttonMatchDelete" class="buttonMatchDelete" onclick="deleteMatch(${match.id})">Deletar</div>
            </div>
        `;

        matchList.appendChild(matchItem);
    }
}

async function getTeamNameById(team1_id, team2_id) {
    const response = await fetch(`http://localhost:3001/api/admin/getTeamName`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            team1_id: team1_id,
            team2_id: team2_id,
        }),
    });

    if (!response.ok) throw new Error('Erro ao obter os nomes dos times.');

    const data = await response.json();
    console.log("Dados recebidos:", data);

    return data;
}

function matchEnter(matchId) {
    console.log("Entrando na partida com ID", matchId)
    window.open (`gamePage.html?matchId=${matchId}`, '_blank');
}

async function deleteMatch(matchId) {
    if (confirm('Tem certeza que deseja deletar a partida?')) {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/matches/${matchId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar a partida.');
            }

            const data = await response.json();
            console.log(data)

            if (data.data.success) {
                alert('Partida deletada com sucesso.');
                loadmatches();
            } else {
                alert('Partida não deletada.');
            }

        } catch (error) {
            console.error('Erro ao deletar a partida:', error);
            alert("Erro ao deletar a partida.");
        }
    }
}