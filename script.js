document.addEventListener("DOMContentLoaded", function () {
    let botaoSorteio = document.getElementById("botaoSorteio");
    let vencedorTexto = document.getElementById("vencedor");
    let listaElement = document.getElementById("listaParticipantes");

    // Configuração do Firebase (Correção do storageBucket)
    const firebaseConfig = {
        apiKey: "AIzaSyAoSrBqubHVr343S6JNu4PS-W3zSQplx_s",
        authDomain: "sorteionachapa.firebaseapp.com",
        projectId: "sorteionachapa",
        storageBucket: "sorteionachapa.firebasestorage.app",
        messagingSenderId: "959594600445",
        appId: "1:959594600445:web:d74ca5b6d5674047ae6b94"
    };

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Evento de clique no botão "Cadastrar"
    document.getElementById("cadastroForm")?.addEventListener("submit", function (e) {
        e.preventDefault(); // Evita o recarregamento da página

        let nome = document.getElementById("nome").value.trim();
        let telefone = document.getElementById("telefone").value.trim();

        if (nome === "" || telefone === "") {
            alert("Preencha todos os campos!");
            return;
        }

        // Adiciona o participante ao Firestore
        db.collection("participantes").add({
            nome: nome,
            telefone: telefone,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert("Cadastro realizado com sucesso!");
            document.getElementById("cadastroForm").reset(); // Limpa os campos do formulário
            if (listaElement) carregarListaParticipantes(); // Atualiza a lista apenas se ela existir
        })
        .catch((error) => {
            alert("Erro ao cadastrar: " + error.message);
        });
    });

    // Função para carregar os participantes na lista (executa apenas se a lista existir)
    function carregarListaParticipantes() {
        if (!listaElement) return; // Se a lista não existe na página, sai da função.

        db.collection("participantes").orderBy("timestamp", "desc").get()
            .then((querySnapshot) => {
                listaElement.innerHTML = "";

                if (querySnapshot.empty) {
                    listaElement.innerHTML = `<li class="list-group-item text-center">Nenhum participante cadastrado.</li>`;
                    return;
                }

                querySnapshot.forEach((doc) => {
                    let participante = doc.data();
                    let id = doc.id;

                    listaElement.innerHTML += `
                    <li class="list-group-item d-flex align-items-center justify-content-between">
                    <div class="info-participante">
                        <span class="fw-bold">${participante.nome}</span>
                        <span class="telefone"><i class="bi bi-telephone-fill text-danger me-1"></i>${participante.telefone}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger btn-lixeira" onclick="removerParticipante('${id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </li>
                  
                    `;
                });
            })
            .catch((error) => {
                console.error("Erro ao buscar participantes: ", error);
            });
    }

    // Função para remover um participante pelo ID
    window.removerParticipante = function (id) {
        db.collection("participantes").doc(id).delete()
            .then(() => {
                if (listaElement) carregarListaParticipantes(); // Atualiza a lista apenas se existir
            })
            .catch((error) => {
                console.error("Erro ao remover participante: ", error);
            });
    };

    // Carregar a lista de participantes somente na página de lista
    if (listaElement) carregarListaParticipantes();

    function realizarSorteio() {
        db.collection("participantes").get()
            .then((querySnapshot) => {
                let participantes = [];
    
                querySnapshot.forEach((doc) => {
                    participantes.push({ id: doc.id, ...doc.data() });
                });
    
                if (participantes.length > 0) {
                    const vencedor = participantes[Math.floor(Math.random() * participantes.length)];
                    document.getElementById("vencedor").innerHTML = `🎉 Parabéns<br> ${vencedor.nome}!<br>📞 ${vencedor.telefone}`;
    
                    // Salvar o vencedor no log de sorteios
                    db.collection("sorteios").add({
                        nome: vencedor.nome,
                        telefone: vencedor.telefone,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(() => {
                        console.log("Vencedor salvo no log de sorteios.");
                    })
                    .catch((error) => {
                        console.error("Erro ao salvar no log de sorteios: ", error);
                    });
    
                    // Muda o texto do botão para "Sortear Novamente"
                    document.getElementById("botaoSorteio").innerHTML = `<i class="bi bi-arrow-repeat"></i> Sortear Novamente`;
                } else {
                    alert("Nenhum participante cadastrado!");
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar participantes: ", error);
            });
    }
    
    // Adicionar evento de clique ao botão de sorteio
    document.getElementById("botaoSorteio")?.addEventListener("click", realizarSorteio);

    function carregarHistoricoSorteios() {
        let listaSorteios = document.getElementById("listaSorteios");
    
        if (!listaSorteios) return; // Se o elemento não existir, não faz nada
    
        db.collection("sorteios").orderBy("timestamp", "desc").get()
            .then((querySnapshot) => {
                listaSorteios.innerHTML = "";
    
                if (querySnapshot.empty) {
                    listaSorteios.innerHTML = `<li class="list-group-item text-center">Nenhum sorteio realizado ainda.</li>`;
                    return;
                }
    
                querySnapshot.forEach((doc) => {
                    let sorteio = doc.data();
                    let dataSorteio = sorteio.timestamp?.toDate().toLocaleString("pt-BR") || "Data desconhecida";
    
                    listaSorteios.innerHTML += `
                    <li class="list-group-item">
                    <div class="info-sorteio">
                        <span class="fw-bold">${sorteio.nome}</span>
                        <span class="telefone"><i class="bi bi-telephone-fill text-danger me-1"></i>${sorteio.telefone}</span>
                        <span class="data-sorteio"><i class="bi bi-calendar-check me-1"></i>${dataSorteio}</span>
                    </div>
                </li>
                    `;
                });
            })
            .catch((error) => {
                console.error("Erro ao buscar histórico de sorteios: ", error);
            });
    }
    
    // Chamar a função ao carregar a página de histórico de sorteios
    carregarHistoricoSorteios();

});
