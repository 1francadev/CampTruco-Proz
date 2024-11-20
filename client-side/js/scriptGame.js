let pontuacaoDupla1 = 0;
let pontuacaoDupla2 = 0;
let contagemVencedor = false;
let team1_id = 1; // Exemplo de id do time 1, você deve definir isso de acordo com o que for armazenado no localStorage ou no banco
let team2_id = 2; // Exemplo de id do time 2, o mesmo vale para este

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
        enviarParaAPI(contagemVencedor, 'dupla1', team1_id);
    } else if (pontuacaoDupla2 >= 12) {
        console.log('A dupla 2 é vencedora!');
        contagemVencedor = true;
        enviarParaAPI(contagemVencedor, 'dupla2', team2_id);
    }
}

// Função para enviar o valor atualizado para a API
async function enviarParaAPI(valor, duplaVencedora, teamVencedorId) {
  try {
    const resposta = await fetch('https://api.exemplo.com/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vencedor: valor, dupla: duplaVencedora, winner_team_id: teamVencedorId }),
    });

    if (resposta.ok) {
      console.log('Resultado enviado com sucesso:', { vencedor: valor, dupla: duplaVencedora, winner_team_id: teamVencedorId });
    } else {
      console.error('Erro ao enviar o resultado');
    }
  } catch (erro) {
    console.error('Erro na requisição:', erro);
  }
}

// Função para iniciar uma nova partida
function novaPartida() {
    pontuacaoDupla1 = 0;
    pontuacaoDupla2 = 0;
    contagemVencedor = false;
    atualizarPlacar();
    verificarVencedor(); // Verifica quem é o vencedor ao clicar no botão "Nova Partida"
}
