// scripts/index.js

const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

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
        // Especifica explicitamente a FK (profiles!doador_id) no select
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

    if (!animais || animais.length === 0) {
        gridAnimais.innerHTML = '<p class="no-pets">Nenhum animal encontrado no momento.</p>';
        return;
    }

    const FOTO_PADRAO = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80';

    animais.forEach(pet => {
        const fotoUrl = (pet.url_foto && pet.url_foto.trim() !== '') ? pet.url_foto : FOTO_PADRAO;
        
        // Trata os dados do perfil obtidos pelo relacionamento
        const perfil = pet.profiles;
        const nomeDoador = perfil?.nome || 'Doador Responsável';
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