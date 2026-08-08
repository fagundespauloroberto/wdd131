// scripts/index.js

const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let listaGeralAnimais = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarAnimais();

    // Evento de submissão do formulário de busca/filtro
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }

    // Escuta mudanças nos selects para aplicar o filtro em tempo real
    const inputsFiltro = document.querySelectorAll('#especie, #porte, #localidade, #cadLocalizacao, #situacao, #filtroStatus');
    inputsFiltro.forEach(input => {
        input.addEventListener('change', aplicarFiltros);
        if (input.tagName === 'INPUT') {
            input.addEventListener('input', aplicarFiltros);
        }
    });
});

// Função utilitária para remover acentos e converter para minúsculas
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

        const card = document.createElement('article');
        card.className = 'pet-card';

        card.innerHTML = `
            <div class="pet-badge ${badgeClass}">${statusTexto}</div>
            <img src="${fotoUrl}" alt="Foto do pet ${pet.nome}" class="pet-image" onerror="this.onerror=null; this.src='${FOTO_PADRAO}';">
            
            <div class="pet-info">
                <h3>${pet.nome}</h3>
                <div class="pet-tags">
                    <span>${pet.especie}</span> • <span>Porte ${pet.porte}</span> • <span>${pet.idade || 'Idade n/i'}</span>
                </div>
                <p class="pet-description">${pet.descricao}</p>
                <p class="pet-location">📍 <strong>${localizacaoDoador}</strong></p>
                <p class="pet-doador" style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">Responsável: ${nomeDoador}</p>
                
                ${(statusTexto === 'Disponível' && numWhatsapp) ? `
                    <a href="${linkWa}" target="_blank" class="btn btn-whatsapp">
                        Quero Adotar (WhatsApp)
                    </a>
                ` : (statusTexto !== 'Disponível') ? `
                    <button class="btn btn-secondary" disabled>Pet ${statusTexto}</button>
                ` : `
                    <button class="btn btn-secondary" disabled>Contato Indisponível</button>
                `}
            </div>
        `;

        gridAnimais.appendChild(card);
    });
}

function aplicarFiltros() {
    // Captura os elementos dos campos (se existirem no HTML)
    const elEspecie = document.getElementById('especie');
    const elPorte = document.getElementById('porte');
    const elLocalidade = document.getElementById('localidade') || document.getElementById('cadLocalizacao');
    const elSituacao = document.getElementById('situacao') || document.getElementById('filtroStatus');

    const filtroEspecie = elEspecie ? normalizarTexto(elEspecie.value) : '';
    const filtroPorte = elPorte ? normalizarTexto(elPorte.value) : '';
    const filtroLocalidade = elLocalidade ? normalizarTexto(elLocalidade.value) : '';
    
    // Captura a opção de situação selecionada
    const valorSituacaoRaw = elSituacao ? elSituacao.value : '';
    const filtroSituacao = normalizarTexto(valorSituacaoRaw);

    const filtrados = listaGeralAnimais.filter(pet => {
        const especiePet = normalizarTexto(pet.especie);
        const portePet = normalizarTexto(pet.porte);
        const localizacaoPet = normalizarTexto(pet.profiles?.localizacao);
        const statusPet = normalizarTexto(pet.status || 'disponivel');

        const bateEspecie = !filtroEspecie || especiePet.includes(filtroEspecie);
        const batePorte = !filtroPorte || portePet.includes(filtroPorte);
        const bateLocalidade = !filtroLocalidade || localizacaoPet.includes(filtroLocalidade);

        // Lógica para filtrar a situação/status do pet
        let bateSituacao = true;

        if (filtroSituacao && filtroSituacao !== 'todos') {
            if (filtroSituacao === 'diferente_disponivel' || filtroSituacao.includes('diferente')) {
                // Traz apenas pets com status DIFERENTE de 'disponivel'
                bateSituacao = statusPet !== 'disponivel';
            } else {
                // Traz pela comparação exata do status selecionado (ex: 'disponivel', 'em processo', 'adotado')
                bateSituacao = statusPet.includes(filtroSituacao);
            }
        }

        return bateEspecie && batePorte && bateLocalidade && bateSituacao;
    });

    renderizarCards(filtrados);
}