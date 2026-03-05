// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animate skill bars on scroll
const skillProgress = document.querySelectorAll('.skill-progress');
const animateSkills = () => {
    skillProgress.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        const barPosition = bar.getBoundingClientRect().top;
        const screenPosition = window.innerHeight;
        
        if (barPosition < screenPosition) {
            bar.style.width = progress + '%';
        }
    });
};

window.addEventListener('scroll', animateSkills);

// Animate statistics numbers
const statNumbers = document.querySelectorAll('.stat-number');
let animated = false;

const animateNumbers = () => {
    if (animated) return;
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const statPosition = stat.getBoundingClientRect().top;
        const screenPosition = window.innerHeight;
        
        if (statPosition < screenPosition) {
            animated = true;
            let current = 0;
            const increment = target / 50; // Divide by number of steps
            
            const updateNumber = () => {
                if (current < target) {
                    current += increment;
                    stat.textContent = Math.ceil(current);
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = target;
                }
            };
            
            updateNumber();
        }
    });
};

window.addEventListener('scroll', animateNumbers);

// Calculate experience years
const experienciaSpan = document.getElementById('experiencia');
if (experienciaSpan) {
    const startYear = 2020; // Change to your start year
    const currentYear = new Date().getFullYear();
    const years = currentYear - startYear;
    experienciaSpan.textContent = years;
}

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you can add your form submission logic
        // For example, send to an email service or API
        
        // Show success message
        alert('¡Mensaje enviado con éxito! Te contactaré pronto.');
        contactForm.reset();
    });
}

// Add active class to nav links on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Page load animations
window.addEventListener('load', () => {
    // Trigger skill bars animation on load
    animateSkills();
    
    // Check if statistics are visible on load
    animateNumbers();
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
});

// Filtrado de habilidades por categoría
const filterBtns = document.querySelectorAll('.filter-btn');
const skillCategories = document.querySelectorAll('.skills-category');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Actualizar botón activo
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        // Filtrar categorías
        skillCategories.forEach(category => {
            if (filter === 'all' || category.dataset.category === filter) {
                category.classList.remove('hidden');
            } else {
                category.classList.add('hidden');
            }
        });
    });
});

// ============================================
// CONFIGURACIÓN DE GITHUB API
// ============================================
const GITHUB_USERNAME = 'AldyCaseres'; // TU usuario de GitHub
let allRepos = []; // Para guardar todos los repositorios

// ============================================
// FUNCIÓN PRINCIPAL: Obtener repositorios
// ============================================
async function fetchGitHubRepos() {
    try {
        // Mostrar loader
        document.getElementById('github-projects').innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i> Cargando proyectos desde GitHub...
            </div>
        `;

        // Llamada a la API de GitHub
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los repositorios`);
        }

        const repos = await response.json();
        
        // Filtrar forks si quieres (opcional)
        allRepos = repos.filter(repo => !repo.fork); // Excluye forks
        
        // Mostrar los repositorios
        displayRepos(allRepos);
        
        // Generar filtros de lenguajes
        generateLanguageFilters(allRepos);
        
    } catch (error) {
        console.error('Error fetching repos:', error);
        document.getElementById('github-projects').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Error al cargar proyectos. 
                <button onclick="fetchGitHubRepos()" class="btn-small">Reintentar</button>
            </div>
        `;
    }
}

// ============================================
// FUNCIÓN: Mostrar repositorios en el DOM
// ============================================
function displayRepos(repos) {
    const container = document.getElementById('github-projects');
    
    if (repos.length === 0) {
        container.innerHTML = '<p class="no-projects">No hay proyectos para mostrar 😊</p>';
        return;
    }

    let html = '';
    repos.forEach(repo => {
        // Formatear la fecha
        const updatedAt = new Date(repo.updated_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Determinar color del lenguaje
        const languageColor = getLanguageColor(repo.language);

        html += `
            <div class="project-card github-card" data-languages="${repo.language || 'Otro'}">
                <div class="project-header">
                    <i class="fas fa-code-branch"></i>
                    <h3>${repo.name}</h3>
                </div>
                
                <p class="project-description">${repo.description || 'Sin descripción 📝'}</p>
                
                <div class="project-tech">
                    ${repo.language ? `
                        <span class="language-badge" style="border-left-color: ${languageColor}">
                            <span class="language-color" style="background: ${languageColor}"></span>
                            ${repo.language}
                        </span>
                    ` : ''}
                    
                    <span class="repo-stats">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </span>
                    <span class="repo-stats">
                        <i class="fas fa-code-branch"></i> ${repo.forks_count}
                    </span>
                </div>
                
                <div class="project-footer">
                    <small>📅 Actualizado: ${updatedAt}</small>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" class="github-link">
                            <i class="fab fa-github"></i> Código
                        </a>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="demo-link">
                                <i class="fas fa-external-link-alt"></i> Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// FUNCIÓN: Generar filtros por lenguaje
// ============================================
function generateLanguageFilters(repos) {
    // Obtener lenguajes únicos
    const languages = ['all', ...new Set(repos.map(repo => repo.language).filter(lang => lang))];
    
    const filterContainer = document.getElementById('filtros-lenguajes');
    let filterHtml = '<button class="filter-btn active" data-filter="all">Todos</button>';
    
    languages.slice(1).forEach(lang => {
        if (lang) {
            filterHtml += `<button class="filter-btn" data-filter="${lang}">${lang}</button>`;
        }
    });
    
    filterContainer.innerHTML = filterHtml;
    
    // Añadir event listeners a los filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Actualizar botón activo
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Filtrar repositorios
            const filter = e.target.dataset.filter;
            if (filter === 'all') {
                displayRepos(allRepos);
            } else {
                const filtered = allRepos.filter(repo => repo.language === filter);
                displayRepos(filtered);
            }
        });
    });
}

// ============================================
// FUNCIÓN: Colores para lenguajes de programación
// ============================================
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'PHP': '#4F5D95',
        'TypeScript': '#2b7489',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'C++': '#f34b7d',
        'C#': '#178600'
    };
    return colors[language] || '#6e7681'; // Color por defecto (gris)
}

// ============================================
// CSS adicional para las tarjetas de GitHub
// ============================================
function addGitHubStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .github-card {
            background: var(--white);
            border-radius: 10px;
            padding: 1.5rem;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .github-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .project-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .project-header i {
            color: var(--primary-color);
            font-size: 1.2rem;
        }
        
        .project-header h3 {
            margin: 0;
            font-size: 1.2rem;
            color: var(--dark-color);
        }
        
        .project-description {
            color: var(--text-color);
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1rem;
            flex-grow: 1;
        }
        
        .language-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.2rem 0.8rem;
            background: var(--light-color);
            border-radius: 20px;
            font-size: 0.8rem;
            border-left: 3px solid;
        }
        
        .language-color {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
        }
        
        .repo-stats {
            display: inline-flex;
            align-items: center;
            gap: 0.2rem;
            margin-left: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-color);
        }
        
        .repo-stats i {
            color: #ffd700;
        }
        
        .project-footer {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--light-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
        }
        
        .project-footer small {
            color: #888;
        }
        
        .project-links {
            display: flex;
            gap: 0.5rem;
        }
        
        .github-link, .demo-link {
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            text-decoration: none;
            font-size: 0.8rem;
            transition: var(--transition);
        }
        
        .github-link {
            background: var(--dark-color);
            color: white;
        }
        
        .github-link:hover {
            background: #000;
        }
        
        .demo-link {
            background: var(--primary-color);
            color: white;
        }
        
        .demo-link:hover {
            background: var(--secondary-color);
        }
        
        .loading-spinner {
            text-align: center;
            padding: 3rem;
            color: var(--primary-color);
            font-size: 1.2rem;
        }
        
        .loading-spinner i {
            margin-right: 0.5rem;
        }
        
        .error-message {
            text-align: center;
            padding: 2rem;
            background: #fee;
            color: #c00;
            border-radius: 10px;
        }
        
        .no-projects {
            text-align: center;
            padding: 2rem;
            color: #888;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// INICIALIZAR TODO cuando la página cargue
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    addGitHubStyles();
    fetchGitHubRepos();
});



