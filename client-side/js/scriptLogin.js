function enviarDados(url, metodo, dados, mensagemSucesso, mensagemErro, callback) {
    const requestOptions = {
        method: metodo,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (metodo === 'POST') {
        requestOptions.body = JSON.stringify(dados);
    } else if (metodo === 'GET') {
        const queryParams = new URLSearchParams(dados).toString();
        url = `${url}?${queryParams}`;
    }

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(responseData => {
            if (responseData && responseData.data && responseData.data.success) {
                console.log(mensagemSucesso);
                if (callback) callback(true);
            } else {
                console.log(mensagemErro);
                if (callback) callback(false);
            }
        })
}

/*
Essa função vai ser usada no proprio arquivo que ela está. Basicamente é uma função que envia os dados para o banco

Se você ver ela na outras funções vai entender como funciona.
*/

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    if (username === "" || password === "") {
        errorMessage.textContent = "Por favor, preencha todos os campos!";
        return;
    }

    enviarDados('http://localhost:3001/api/users/login', "POST", { username: username, password: password },
        'Login realizado com sucesso!', 'Erro ao realizar o login!',
        function(success) {
            if (success) {
                window.location.href = "gamePage.html";
            } else {
                errorMessage.textContent = "Login ou senha incorretos!";
            }
        }
    );
});


/* 
Esse get element by id pega o login de um formulario. Por causa do eventlistener submit, as informações do formulario
serão pegas quando ele for enviado.

O formulario pegara as informações como o "username" e o password e verifica se tem no banco, se tiver faz o login.
*/

document.getElementById("SingupForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const pass = document.getElementById("pass").value;
    const errorMessage2 = document.getElementById("errorMessage2");

    if (name === "" || pass === "" || email === "") {
        errorMessage2.textContent = "Por favor, preencha todos os campos!";
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorMessage2.textContent = "Por favor, insira um email válido!";
        return;
    }

    enviarDados('http://localhost:3001/api/users/register', "POST", { email: email, username: name, password: pass },
        'Usuário cadastrado com sucesso!', 'Erro ao cadastrar o usuário!',
        function(success) {
            if (success) {
                navigate('Login');
            } else {
                errorMessage2.textContent = "Email já cadastrado!";
            }
        }
    );
});


/* 
Aqui pegamos o name, email e pass e adicionamos no banco de dados se tiver tudo configurado certinho.
*/

document.getElementById("admForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const Useradm = document.getElementById("Useradm").value;
    const Passadm = document.getElementById("Passadm").value;
    const errorMessage3 = document.getElementById("errorMessage3");

    if (Useradm === "" || Passadm === "") {
        errorMessage3.textContent = "Por favor, preencha todos os campos!";
        return;
    }

    enviarDados('http://localhost:3001/api/admin/login', "POST", { username: Useradm, password: Passadm },
        'Login realizado com sucesso!', 'Erro ao realizar o login!',
        function(success) {
            if (success) {
                window.location.href = "optionPage.html";
            } else {
                errorMessage3.textContent = "Login ou senha incorretos!";
            }
        }
    );
});

/* 
Aqui pegamos o name, email e pass e adicionamos no banco de dados se tiver tudo configurado certinho.

*/

function navigate(state) {
    const Login = document.querySelector(".loginForm");
    const SingUP = document.querySelector(".SingupForm");

    if (state === 'Login') {
        Login.style.display = "block";
        SingUP.style.display = "none";
    } else if (state === 'Register') {
        Login.style.display = "none";
        SingUP.style.display = "block";
    }
}


/* 
Esse aqui parece que é para aparecer a tela de login e cadastro

*/

// Modal
const button = document.querySelector(".buttonadm");
const modal = document.querySelector(".dialog");
const closebutton = document.querySelector(".btnclose");

button.onclick = function () {
    modal.showModal();
};

closebutton.onclick = function () {
    modal.close();
};

/* 
Aqui é para abrir e fechar o botão de adm

*/