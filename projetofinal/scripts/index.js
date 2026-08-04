// =========================================================
// CONFIGURAÇÃO DO CLIENTE SUPABASE
// =========================================================
const SUPABASE_URL = 'https://wasodctryfmajucxsqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc29kY3RyeWZtYWp1Y3hzcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyOTEsImV4cCI6MjEwMDI4OTI5MX0.5hQepY49znD3ENz1eGPaFSa9n2Or0PBng5VMuvini7o';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================================================
// FUNÇÃO DE BUSCA E RENDERIZAÇÃO
// =========================================================
async function carregarAnimais() {
    const gridAnimais = document.getElementById('gridAnimais');
    if (!gridAnimais) return;

    try {
        // Consulta no Supabase trazendo os dados do animal e o objeto do doador vinculado
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
                doadores (
                    nome,
                    whatsapp,
                    localizacao
                )
            `)
            .eq('status', 'Disponível') // Exibe apenas os animais disponíveis
            .order('data_cadastro', { ascending: false });

        if (error) {
            throw error;
        }

        if (!animais || animais.length === 0) {
            gridAnimais.innerHTML = `
                <div class="no-pets">
                    <p>Nenhum animal cadastrado no momento. Seja o primeiro a cadastrar!</p>
                </div>
            `;
            return;
        }

        // Limpa a mensagem de carregamento e monta a lista de cards
        gridAnimais.innerHTML = '';

        animais.forEach(pet => {
            const doador = pet.doadores || {};
            const whatsappMsg = encodeURIComponent(`Olá, ${doador.nome}! Vi o anúncio do(a) ${pet.nome} no Patinhas Conectadas e gostaria de saber mais sobre a adoção.`);
            const linkWhatsapp = `https://wa.me/55${doador.whatsapp}?text=${whatsappMsg}`;

            const card = document.createElement('article');
            card.className = 'pet-card';

            card.innerHTML = `
                <div class="pet-img-wrapper">
                    <img src="${pet.url_foto || 'https://via.placeholder.com/400x300?text=Sem+Foto'}" alt="${pet.nome}">
                    <span class="badge badge-status">${pet.status}</span>
                </div>
                <div class="pet-info">
                    <div class="pet-header">
                        <h3>${pet.nome}</h3>
                        <span class="badge badge-especie">${pet.especie}</span>
                    </div>
                    
                    <p class="pet-meta">
                        <strong>Porte:</strong> ${pet.porte} | <strong>Idade:</strong> ${pet.idade || 'Não informada'}
                    </p>
                    
                    <p class="pet-descricao">${pet.descricao}</p>

                    <div class="pet-doador-info">
                        <small>📍 ${doador.localizacao || 'Localização não informada'}</small>
                        <small>👤 Doador: ${doador.nome || 'Anônimo'}</small>
                    </div>

                    <a href="${linkWhatsapp}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
                        Falar com Doador no WhatsApp
                    </a>
                </div>
            `;

            gridAnimais.appendChild(card);
        });

    } catch (err) {
        console.error('Erro ao carregar lista de animais:', err);
        gridAnimais.innerHTML = '<p class="error-text">Erro ao carregar os dados dos animais. Verifique o console.</p>';
    }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', carregarAnimais);