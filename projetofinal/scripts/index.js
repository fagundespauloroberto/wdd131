// scripts/index.js

const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let listaGeralAnimais = [];

document.addEventListener('DOMContentLoaded', () => {
    // garante que carregamos os filtros salvos(localStorage)
    carregarFiltrosSalvos();
    
    // em seguida carregamos os pets... 
    carregarAnimais();

    // Evento de submissão do formulário de busca/filtro
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    // mudanças nos selects sendo aplicadas com filtro em tempo real
    const inputsFiltro = document.querySelectorAll('#especie, #porte, #localidade, #cadLocalizacao, #situacao, #filtroStatus');
    inputsFiltro.forEach(input => {
        input.addEventListener('change', aplicarFiltros);
        if (input.tagName === 'INPUT') {
            input.addEventListener('input', aplicarFiltros);
        }
    });

    // configuração dos eventos para o Modal de Imagem Ampliada
    const modal = document.getElementById('modalImagem');
    const btnFechar = document.querySelector('.modal-fechar');

    // Fechar no botão 'X'
    if (btnFechar) {
        btnFechar.addEventListener('click', fecharModalImagem);
    }

    // Fechar ao clicar no fundo escuro
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModalImagem();
            }
        });
    }

    // Fechar ao pressionar a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalImagem();
        }
    });
    
});

// Função utilitária para remover acentos e converter para minúsculas
// problema encontrado quando filtrado médio...
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

async function carregarAnimais() {
    const gridAnimais = document.getElementById('gridAnimais');
    if (!gridAnimais) return;

    try {
        // Busca todos os animais ordenados do mais recente para o mais antigo
        const { data: animais, error } = await _supabase
            .from('animais')
            .select(`
                id,
                nome,
                especie,
                idade,
                porte,
                descricao,
                url_foto,
                status,
                doador_id,
                profiles (
                    nome,
                    whatsapp,
                    localizacao
                )
            `)
            .order('id', { ascending: false });

        if (error) throw error;

        listaGeralAnimais = animais || [];
        
        // Aplica os filtros assim que carregar
        aplicarFiltros();

    } catch (err) {
        console.error('Erro ao carregar lista de animais:', err);
        gridAnimais.innerHTML = '<p class="error-text">Ocorreu um erro ao carregar os pets. Tente novamente mais tarde.</p>';
    }
}

function renderizarCards(animais) {
    const gridAnimais = document.getElementById('gridAnimais');
    gridAnimais.innerHTML = '';

    if (!animais || animais.length === 0) {
        gridAnimais.innerHTML = '<p class="no-pets">Nenhum animal encontrado com os filtros selecionados.</p>';
        return;
    }

    const FOTO_PADRAO = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80';

    animais.forEach(pet => {
        const fotoUrl = (pet.url_foto && pet.url_foto.trim() !== '') ? pet.url_foto : FOTO_PADRAO;
        
        // Trata os dados do perfil do doador
        //const perfil = pet.profiles;
        
        // Tratamento seguro: Funciona se profiles for Objeto ou Array
        const perfil = Array.isArray(pet.profiles) ? pet.profiles[0] : pet.profiles;
        
        const nomeDoador = perfil?.nome || 'Doador Responsável';
        const localizacaoDoador = perfil?.localizacao || 'Localidade não informada';
        const numWhatsapp = perfil?.whatsapp ? perfil.whatsapp.replace(/\D/g, '') : '';

        // Definir classe ou cor visual do badge de status
        const statusTexto = pet.status || 'Disponível';
        let badgeClass = 'status-disponivel';
        if (statusTexto === 'Em Processo') badgeClass = 'status-processo';
        if (statusTexto === 'Adotado') badgeClass = 'status-adotado';

        // Monta o link do WhatsApp
        const mensagemWa = encodeURIComponent(`Olá ${nomeDoador}! Vi o anúncio do(a) ${pet.nome} no Patinhas Conectadas e gostaria de mais informações.`);
        const linkWa = numWhatsapp ? `https://wa.me/55${numWhatsapp}?text=${mensagemWa}` : '#';

        // Bloco de botões de ação (Candidato a Tutor + WhatsApp)
        let htmlBotoes = '';
        
        if (statusTexto === 'Disponível') {
            htmlBotoes = `
                <div class="card-buttons">
                    <a href="formulario.html?pet_id=${pet.id}" class="btn btn-candidato">
                        📋 Quero ser Tutor
                    </a>
                    ${numWhatsapp ? `
                        <a href="${linkWa}" target="_blank" class="btn btn-whatsapp">
                            💬 Falar no WhatsApp
                        </a>
                    ` : ''}
                </div>
            `;
        } else {
            htmlBotoes = `
                <div class="card-buttons">
                    <button class="btn btn-secondary" disabled>Pet ${statusTexto}</button>
                </div>
            `;
        }

        const card = document.createElement('article');
        card.className = 'pet-card';

        card.innerHTML = `
            <div class="pet-badge ${badgeClass}">${statusTexto}</div>
                <img src="${fotoUrl}" alt="Foto do pet ${pet.nome}" class="pet-image" loading="lazy" onerror="this.onerror=null; this.src='${FOTO_PADRAO}';">
            
            <div class="pet-info">
                <h3>${pet.nome}</h3>
                <div class="pet-tags">
                    <span>${pet.especie}</span> • <span>Porte ${pet.porte}</span> • <span>${pet.idade || 'Idade n/i'}</span>
                </div>
                <p class="pet-description">${pet.descricao}</p>
                <p class="pet-location">📍 <strong>${localizacaoDoador}</strong></p>
                <p class="pet-doador" style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">Responsável: ${nomeDoador}</p>
                
                ${htmlBotoes}
            </div>
        `;

        // evento de click na imagem, para ampliar
        const imgElement = card.querySelector('.pet-image');
        if (imgElement) {
            imgElement.addEventListener('click', () => {
                abrirModalImagem(fotoUrl, pet.nome);
            });
        }        

        gridAnimais.appendChild(card);
    });
}

function aplicarFiltros() {
    // captura os elementos dos campos no DOM
    const elEspecie = document.getElementById('especie');
    const elPorte = document.getElementById('porte');
    const elLocalidade = document.getElementById('localidade') || document.getElementById('cadLocalizacao');
    const elSituacao = document.getElementById('situacao') || document.getElementById('filtroStatus');

    // extrair valores originais
    const valEspecie = elEspecie ? elEspecie.value : '';
    const valPorte = elPorte ? elPorte.value : '';
    const valLocalidade = elLocalidade ? elLocalidade.value : '';
    const valSituacao = elSituacao ? elSituacao.value : '';

    // tratamento para salva os filtros no localStorage
    localStorage.setItem('filtro_especie', valEspecie);
    localStorage.setItem('filtro_porte', valPorte);
    localStorage.setItem('filtro_localidade', valLocalidade);
    localStorage.setItem('filtro_situacao', valSituacao);

    // ajuste dos textos para comparação sem acento e case-insensitive
    const filtroEspecie = normalizarTexto(valEspecie);
    const filtroPorte = normalizarTexto(valPorte);
    const filtroLocalidade = normalizarTexto(valLocalidade);
    const filtroSituacao = normalizarTexto(valSituacao);

    // aplica as filtragem na lista geral
    const filtrados = listaGeralAnimais.filter(pet => {
        // Tratamento seguro para profiles (Array ou Objeto)
        const perfil = Array.isArray(pet.profiles) ? pet.profiles[0] : pet.profiles;

        const especiePet = normalizarTexto(pet.especie);
        const portePet = normalizarTexto(pet.porte);
        const localizacaoPet = normalizarTexto(perfil?.localizacao);
        const statusPet = normalizarTexto(pet.status || 'disponivel');

        const bateEspecie = !filtroEspecie || especiePet.includes(filtroEspecie);
        const batePorte = !filtroPorte || portePet.includes(filtroPorte);
        const bateLocalidade = !filtroLocalidade || localizacaoPet.includes(filtroLocalidade);

        // Lógica de filtro por situação/status
        let bateSituacao = true;

        if (filtroSituacao && filtroSituacao !== 'todos') {
            if (filtroSituacao === 'diferente_disponivel' || filtroSituacao.includes('diferente')) {
                // Retorna pets onde o status NÃO é 'disponivel'
                bateSituacao = statusPet !== 'disponivel';
            } else {
                // Comparação de status exata ou por inclusão
                bateSituacao = statusPet === filtroSituacao || statusPet.includes(filtroSituacao);
            }
        }

        return bateEspecie && batePorte && bateLocalidade && bateSituacao;
    });

    renderizarCards(filtrados);
}

function carregarFiltrosSalvos() {
    const elEspecie = document.getElementById('especie');
    const elPorte = document.getElementById('porte');
    const elLocalidade = document.getElementById('localidade') || document.getElementById('cadLocalizacao');
    const elSituacao = document.getElementById('situacao') || document.getElementById('filtroStatus');

    if (elEspecie && localStorage.getItem('filtro_especie')) {
        elEspecie.value = localStorage.getItem('filtro_especie');
    }
    if (elPorte && localStorage.getItem('filtro_porte')) {
        elPorte.value = localStorage.getItem('filtro_porte');
    }
    if (elLocalidade && localStorage.getItem('filtro_localidade')) {
        elLocalidade.value = localStorage.getItem('filtro_localidade');
    }
    if (elSituacao && localStorage.getItem('filtro_situacao')) {
        elSituacao.value = localStorage.getItem('filtro_situacao');
    }
}

function abrirModalImagem(src, nomePet) {
    const modal = document.getElementById('modalImagem');
    const imgAmpliada = document.getElementById('imgAmpliada');
    const legenda = document.getElementById('modalLegenda');

    if (modal && imgAmpliada) {
        imgAmpliada.src = src;
        if (legenda) legenda.innerText = nomePet || '';
        modal.style.display = 'flex';
    }
}

function fecharModalImagem() {
    const modal = document.getElementById('modalImagem');
    if (modal) {
        modal.style.display = 'none';
    }
}