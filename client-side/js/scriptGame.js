let pontuacaoDupla1 = 0;
let pontuacaoDupla2 = 0;
let contagemVencedor = false;

const urlParams = new URLSearchParams(window.location.search);
const matchId = urlParams.get('matchId');
if (matchId) {
  console.log('Match ID:', matchId);
  // Use o matchId como necessário
} else {
  console.error('Match ID não foi encontrado na URL');
}


function atualizarPlacar() {
  document.getElementById('resultado').textContent = `${pontuacaoDupla1} x ${pontuacaoDupla2}`;
}

// Função para adicionar pontos e verificar se há um vencedor
function adicionarPontos(dupla) {
  if (contagemVencedor) return; // Evita adicionar pontos após ter um vencedor

  if (dupla === 'dupla1') {
    pontuacaoDupla1 += 2;
  } else if (dupla === 'dupla2') {
    pontuacaoDupla2 += 2;
  }
  atualizarPlacar();
  verificarVencedor();
}

// Função para verificar o vencedor
function verificarVencedor() {
  if (pontuacaoDupla1 >= 12) {
    console.log('A dupla 1 é vencedora!');
    contagemVencedor = true;
    enviarParaAPI(contagemVencedor, 'dupla1');
  } else if (pontuacaoDupla2 >= 12) {
    console.log('A dupla 2 é vencedora!');
    contagemVencedor = true;
    enviarParaAPI(contagemVencedor, 'dupla2');
  }
}

// Função para enviar o valor atualizado para a API
async function enviarParaAPI(valor, duplaVencedora) {
  try {
    const resposta = await fetch('https://api.exemplo.com/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vencedor: valor, dupla: duplaVencedora }),
    });

    if (resposta.ok) {
      console.log('Resultado enviado com sucesso:', { vencedor: valor, dupla: duplaVencedora });
    } else {
      console.error('Erro ao enviar o resultado');
    }
  } catch (erro) {
    console.error('Erro na requisição:', erro);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const dupla1 = document.getElementById('dupla1');
  const dupla2 = document.getElementById('dupla2');

  async function fetchTeams() {
    try {
      const response = await fetch(`http://localhost:3001/api/game/${matchId}`);

      if (!response.ok) {
        throw new Error('Erro ao recuperar os times do banco de dados.');
      }

      const times = await response.json();
      const team1Name = times.data.team1_id?.[0]?.name || "Nome do Time 1 não disponível";
      const team2Name = times.data.team2_id?.[0]?.name || "Nome do Time 2 não disponível";

      if (!team2Name || !team2Name) {
        console.warn('Não há times suficientes no banco.');
        dupla1.textContent = 'Time 1';
        dupla2.textContent = 'Time 2';
        return;
      }

      dupla1.textContent = team1Name || 'Time 1';
      dupla2.textContent = team2Name || 'Time 2';
    } catch (erro) {
      console.error('Erro ao buscar os times:', erro.message);
      dupla1.textContent = 'Time 1';
      dupla2.textContent = 'Time 2';
    }
  }

  await fetchTeams();
});

// Função para iniciar uma nova partida
function novaPartida() {
  pontuacaoDupla1 = 0;
  pontuacaoDupla2 = 0;
  contagemVencedor = false;
  atualizarPlacar();
}