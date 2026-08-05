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
        // Consulta simplificada apenas na tabela de animais
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
                status
            `)
            .eq('status', 'Disponível')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!animais || animais.length === 0) {
            gridAnimais.innerHTML = '<p class="no-pets">Nenhum animal cadastrado no momento.</p>';
            return;
        }

        gridAnimais.innerHTML = '';

        const FOTO_PADRAO = 'https://placehold.co/400x300/e2e8f0/475569?text=Sem+Foto';

        animais.forEach(pet => {
            const fotoUrl = (pet.url_foto && pet.url_foto.trim() !== '') ? pet.url_foto : FOTO_PADRAO;

            const card = document.createElement('article');
            card.className = 'pet-card';

            card.innerHTML = `
                <div class="pet-img-wrapper">
                    <img src="${fotoUrl}" alt="${pet.nome}" onerror="this.onerror=null; this.src='${FOTO_PADRAO}';">
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
                </div>
            `;

            gridAnimais.appendChild(card);
        });

    } catch (err) {
        console.error('Erro ao carregar lista de animais:', err);
        gridAnimais.innerHTML = '<p class="error-text">Erro ao carregar os dados dos animais.</p>';
    }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', carregarAnimais);