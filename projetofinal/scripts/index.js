// scripts/index.js

const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let listaGeralAnimais = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarAnimais();

    // Evento do formulário de busca/filtro
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }
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
        // Adicionado 'localizacao' no select do relacionamento com profiles
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
                profiles!fk_animais_profiles (
                    nome,
                    whatsapp,
                    localizacao
                )
            `)
            .eq('status', 'Disponível')
            .order('id', { ascending: false });

        if (error) throw error;

        listaGeralAnimais = animais || [];
        renderizarCards(listaGeralAnimais);

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
        const perfil = pet.profiles;
        const nomeDoador = perfil?.nome || 'Doador Responsável';
        const localizacaoDoador = perfil?.localizacao || 'Localidade não informada';
        const numWhatsapp = perfil?.whatsapp ? perfil.whatsapp.replace(/\D/g, '') : '';

        // Monta o link do WhatsApp
        const mensagemWa = encodeURIComponent(`Olá ${nomeDoador}! Vi o anúncio do(a) ${pet.nome} no Patinhas Conectadas e gostaria de mais informações sobre a adoção.`);
        const linkWa = numWhatsapp ? `https://wa.me/55${numWhatsapp}?text=${mensagemWa}` : '#';

        const card = document.createElement('article');
        card.className = 'pet-card';

        card.innerHTML = `
            <div class="pet-badge">${pet.status || 'Disponível'}</div>
            <img src="${fotoUrl}" alt="Foto do pet ${pet.nome}" class="pet-image" onerror="this.onerror=null; this.src='${FOTO_PADRAO}';">
            
            <div class="pet-info">
                <h3>${pet.nome}</h3>
                <div class="pet-tags">
                    <span>${pet.especie}</span> • <span>Porte ${pet.porte}</span> • <span>${pet.idade || 'Idade n/i'}</span>
                </div>
                <p class="pet-description">${pet.descricao}</p>
                <p class="pet-location">📍 <strong>${localizacaoDoador}</strong></p>
                <p class="pet-doador" style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">Responsável: ${nomeDoador}</p>
                
                ${numWhatsapp ? `
                    <a href="${linkWa}" target="_blank" class="btn btn-whatsapp">
                        Quero Adotar (WhatsApp)
                    </a>
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

    const filtroEspecie = elEspecie ? normalizarTexto(elEspecie.value) : '';
    const filtroPorte = elPorte ? normalizarTexto(elPorte.value) : '';
    const filtroLocalidade = elLocalidade ? normalizarTexto(elLocalidade.value) : '';

    const filtrados = listaGeralAnimais.filter(pet => {
        const especiePet = normalizarTexto(pet.especie);
        const portePet = normalizarTexto(pet.porte);
        const localizacaoPet = normalizarTexto(pet.profiles?.localizacao);

        const bateEspecie = !filtroEspecie || especiePet.includes(filtroEspecie);
        const batePorte = !filtroPorte || portePet.includes(filtroPorte);
        const bateLocalidade = !filtroLocalidade || localizacaoPet.includes(filtroLocalidade);

        return bateEspecie && batePorte && bateLocalidade;
    });

    renderizarCards(filtrados);
}