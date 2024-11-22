let pontuacaoDupla1 = 0;
let pontuacaoDupla2 = 0;
let contagemVencedor = false;

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

//document.addEventListener o documento é carregado junto com a pagina 

document.addEventListener("DOMContentLoaded", () => {
  const dupla1 = document.getElementById('dupla1');
  const dupla2 = document.getElementById('dupla2');
  
  function renderTimes() {
      // Lê os times do localStorage
      const time1 = localStorage.getItem('dupla1');
      const time2 = localStorage.getItem('dupla2');

      // Exibe os nomes dos times
      if (time1) {
          dupla1.textContent = time1; // Exibe o nome do primeiro time
      } else {
          dupla1.textContent = 'Time 1'; // Caso não tenha nome no localStorage
      }

      if (time2) {
          dupla2.textContent = time2; // Exibe o nome do segundo time
      } else {
          dupla2.textContent = 'Time 2'; // Caso não tenha nome no localStorage
      }
  }

  renderTimes(); // Chama a função para rodar logo após o carregamento
});

// Função para iniciar uma nova partida
function novaPartida() {
    pontuacaoDupla1 = 0;
    pontuacaoDupla2 = 0;
    contagemVencedor = false;
    atualizarPlacar();
}