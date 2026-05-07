document.addEventListener('DOMContentLoaded', () => {

    // 1. Seletores DOM
    const postsContainer = document.getElementById('postsContainer');
    const featuredPosts = document.getElementById('featuredPosts');
    const form = document.getElementById('addPostForm');
    const successMsg = document.getElementById('successMsg');
    const searchInput = document.getElementById('searchInput');
    const ratingFilter = document.getElementById('ratingFilter'); // Filtro de Avaliação (Estrelas)
    const genreFilter = document.getElementById('genreFilter'); // Filtro de Gênero
    const darkModeToggle = document.getElementById('darkModeToggle');
    // NOVOS SELETORES PARA FEEDBACK
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackSuccessMsg = document.getElementById('feedbackSuccessMsg');

    // 2. Dados
    const defaultPosts = [];
    let posts = [];
    
    // Mapeamento de valores (ex: 'ficcao_cientifica') para nomes legíveis
    const genreMap = {
        'romance': 'Romance',
        'ficcao_cientifica': 'Ficção Científica',
        'fantasia': 'Fantasia',
        'thriller': 'Thriller',
        'infantil': 'Infantil',
        'biografia': 'Biografia',
        'outros': 'Outros'
    }

    // 3. Funções de Persistência (localStorage)
    function savePosts() {
        localStorage.setItem('bookBlogPosts', JSON.stringify(posts));
    }

    function loadPosts() {
        const storedPosts = localStorage.getItem('bookBlogPosts');
        if (storedPosts) { 
            posts = JSON.parse(storedPosts);
        } else {
            posts = defaultPosts; 
            savePosts(); 
        }
    }

    // 4. Funções de Renderização
    function generateStars(rating) {
        const numRating = parseInt(rating, 10);
        const fullStars = '★'.repeat(numRating);
        const emptyStars = '☆'.repeat(5 - numRating);
        const labels = {
            1: 'Muito ruim', 2: 'Ruim', 3: 'Razoável', 4: 'Bom', 5: 'Gostei muito'
        };
        return `<span class="rating-stars" title="${labels[numRating] || ''}">${fullStars}${emptyStars}</span>`;
    }

    function renderPosts(filteredPosts = posts) {
        postsContainer.innerHTML = ''; 

        if (filteredPosts.length === 0) {
            postsContainer.innerHTML = '<div class="col-12"><p class="text-center h5">Nenhum post encontrado com os filtros selecionados.</p></div>';
            return;
        }

        filteredPosts.forEach(post => {
            // Encontra o índice real no array 'posts' para a função toggleLike
            const trueIndex = posts.findIndex(p => p.title === post.title && p.author === post.author);
            
            const heartIcon = post.liked ? '♥' : '♡'; 
            
            // Exibe o nome legível do gênero
            const displayGenre = post.genre ? genreMap[post.genre] || post.genre : 'Não Informado';

            // Classes Bootstrap para o layout de grid (3 posts por linha em desktop)
            const postElement = document.createElement('div');
            postElement.className = 'col-lg-4 col-md-6'; 
            postElement.innerHTML = `
                <div class="post card h-100">
                    <div class="card-body">
                        <button class="like-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${trueIndex})" aria-label="Curtir post">${heartIcon}</button>
                        <h3 class="card-title h5">${post.title}</h3>
                        <h6 class="card-subtitle mb-2 text-muted">por ${post.author}</h6>
                        <p class="card-text mb-1"><strong>Gênero:</strong> ${displayGenre}</p>
                        <div class="rating mb-2">Avaliação: ${generateStars(post.rating)}</div>
                        <p class="card-text"><strong>Opinião:</strong> ${post.opinion}</p>
                        <p class="card-text"><small class="text-muted"><strong>Recomendações:</strong> ${post.recommendations}</small></p>
                        <p class="likes-count"><small>${post.likes} curtida(s)</small></p>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    }

    function renderFeatured() {
        // Ordena por likes e pega os 2 primeiros
        const sorted = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 2);
        featuredPosts.innerHTML = '';

        if (sorted.length === 0) {
            featuredPosts.innerHTML = '<div class="col-12"><p class="text-center h5">Nenhum post em destaque no momento.</p></div>';
            return;
        }

        sorted.forEach(post => {
            // Usando 'col-md-6' para colunas de destaque (2 posts por linha)
            const postElement = document.createElement('div');
            postElement.className = 'col-md-6'; 
            const shortOpinion = post.opinion.length > 100 ? post.opinion.substring(0, 100) + '...' : post.opinion;
            
            postElement.innerHTML = `
                <div class="post card h-100">
                    <div class="card-body">
                        <h3 class="card-title h5">${post.title}</h3>
                        <h6 class="card-subtitle mb-2 text-muted">por ${post.author}</h6>
                        <div class="rating mb-2">${generateStars(post.rating)}</div>
                        <p class="card-text"><strong>Opinião:</strong> ${shortOpinion}</p>
                    </div>
                </div>
            `;
            featuredPosts.appendChild(postElement);
        });
    }
    
    // Função para reiniciar o Carrossel do Bootstrap 
    function initializeCarousel() {
        const carouselElement = document.getElementById('bookCarousel');
        if (carouselElement) {
            // Inicializa o carrossel Bootstrap 5
            new bootstrap.Carousel(carouselElement, {
                interval: 5000, // MODIFICADO: Define o intervalo para 5000ms (5 segundos) para avanço automático.
                wrap: true // Garante a rolagem circular
            });
        }
    }


    // 5. Lógica e Event Handlers
    function handleFormSubmit(e) {
        e.preventDefault(); 
        
        const newPost = {
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            genre: document.getElementById('bookGenre').value, 
            rating: parseInt(document.getElementById('rating').value, 10),
            opinion: document.getElementById('opinion').value,
            recommendations: document.getElementById('recommendations').value,
            likes: 0,
            liked: false
        };

        posts.unshift(newPost);
        
        savePosts();      
        applyFilters();   
        renderFeatured(); 
        
        form.reset(); 
        
        successMsg.classList.add('show');
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 3000);
    }

    // Função para lidar com a submissão do formulário de feedback
    function handleFeedbackSubmit(e) {
        e.preventDefault(); 
        
        // Simulação de envio de feedback (em um ambiente com back - and, isso enviaria dados para um servidor)
        const feedbackText = document.getElementById('feedbackText').value;
        const isAnonymous = document.getElementById('feedbackAnonymous').checked;
        
        console.log("Novo Feedback Recebido:");
        console.log(`Texto: ${feedbackText}`);
        console.log(`Anônimo: ${isAnonymous}`);

        feedbackForm.reset(); 
        
        feedbackSuccessMsg.classList.add('show');
        // Remove a mensagem após 3 segundos
        setTimeout(() => {
            feedbackSuccessMsg.classList.remove('show');
        }, 3000);
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        // Adiciona proteção contra elementos nulos, caso o HTML não seja totalmente carregado
        const rating = ratingFilter ? ratingFilter.value : ''; 
        const genre = genreFilter ? genreFilter.value : ''; 

        const filtered = posts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                                  post.opinion.toLowerCase().includes(searchTerm) ||
                                  post.author.toLowerCase().includes(searchTerm);
            
            // Filtra por Avaliação: compara o valor numérico post.rating com a string do filtro
            const matchesRating = rating ? post.rating.toString() === rating : true; 
            
            // Filtra por Gênero
            const matchesGenre = genre ? post.genre === genre : true;

            // Retorna apenas posts que passam em todas as condições
            return matchesSearch && matchesRating && matchesGenre;
        });

        renderPosts(filtered);
    }

    window.toggleLike = (index) => {
        const post = posts[index];
        if (post) {
            if (post.liked) {
                post.likes--;
                post.liked = false;
            } else {
                post.likes++;
                post.liked = true;
            }
            
            savePosts();
            applyFilters();   
            renderFeatured(); 
        }
    }

    // Função de Modo Escuro
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            darkModeToggle.textContent = '☀️'; 
        } else {
            localStorage.setItem('theme', 'light');
            darkModeToggle.textContent = '🌙'; 
        }
    }

    function loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            // Define o texto para '☀️' ao carregar no modo escuro
            darkModeToggle.textContent = '☀️'; 
        } else {
            // Define o texto para '🌙' ao carregar no modo claro
            darkModeToggle.textContent = '🌙';
        }
    }

    // 6. Inicialização do Site
    
    // --- ACESSIBILIDADE ---
    let fontSize = 100; 
    window.changeFontSize = function(action) {
        const html = document.documentElement;
        if (action === 'increase' && fontSize < 150) fontSize += 10;
        else if (action === 'decrease' && fontSize > 70) fontSize -= 10;
        html.style.fontSize = `${fontSize}%`;
    }

    window.toggleContrast = function() {
        document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    }

    function loadAccessibility() {
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === '1') changeFontSize('increase');
        if (e.altKey && e.key === '2') changeFontSize('decrease');
        if (e.altKey && e.key === '3') toggleContrast();
    });

function init() {
        loadPosts();
        loadTheme();
        loadAccessibility();
        // Aplica os filtros na inicialização para exibir todos os posts
        applyFilters(); 
        renderFeatured();
        initializeCarousel(); 

        form.addEventListener('submit', handleFormSubmit);
        // Adiciona o event listener para o formulário de feedback
        if (feedbackForm) feedbackForm.addEventListener('submit', handleFeedbackSubmit);
        
        // Adiciona os event listeners para todos os filtros e pesquisa
        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
        if (genreFilter) genreFilter.addEventListener('change', applyFilters);

        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    init();

});

function toggleWidget() {
    const content = document.querySelector('.widget-content');
    content.classList.toggle('active');
}

// Opcional: Fechar o menu se clicar fora dele
window.addEventListener('click', function(e) {
    const widget = document.getElementById('accessibilityWidget');
    const content = document.querySelector('.widget-content');
    if (!widget.contains(e.target)) {
        content.classList.remove('active');
    }
});

