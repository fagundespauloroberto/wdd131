// scripts/index.js

const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_ANON_JWT';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    carregarAnimais();

    // Evento de filtro
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            aplicarFiltros();
        });
    }
});

let listaGeralAnimais = [];

async function carregarAnimais() {
    const gridAnimais = document.getElementById('gridAnimais');
    if (!gridAnimais) return;

    try {
        // Consulta na tabela animais trazendo as informações do perfil do doador
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
                profiles (
                    nome,
                    whatsapp
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

    if (animais.length === 0) {
        gridAnimais.innerHTML = '<p class="no-pets">Nenhum animal encontrado com os filtros selecionados.</p>';
        return;
    }

    const FOTO_PADRAO = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80';

    animais.forEach(pet => {
        const fotoUrl = (pet.url_foto && pet.url_foto.trim() !== '') ? pet.url_foto : FOTO_PADRAO;
        
        // Dados do doador vindos do relacionamento
        const nomeDoador = pet.profiles?.nome || 'Doador';
        const numWhatsapp = pet.profiles?.whatsapp ? pet.profiles.whatsapp.replace(/\D/g, '') : '';

        // Formatação da mensagem para o WhatsApp
        const mensagemWa = encodeURIComponent(`Olá ${nomeDoador}! Vi o anúncio do(a) ${pet.nome} no Patinhas Conectadas e gostaria de saber mais sobre a adoção.`);
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
                <p class="pet-location">📍 Responsável: <strong>${nomeDoador}</strong></p>
                
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
    const especie = document.getElementById('especie').value.toLowerCase();
    const porte = document.getElementById('porte').value.toLowerCase();

    const filtrados = listaGeralAnimais.filter(pet => {
        const bateEspecie = !especie || pet.especie.toLowerCase().includes(especie);
        const batePorte = !porte || pet.porte.toLowerCase().includes(porte);
        return bateEspecie && batePorte;
    });

    renderizarCards(filtrados);
}