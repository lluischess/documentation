// Sidebar toggle para móvil
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const overlay = document.getElementById('overlay');

function toggleMenu() {
    const isActive = sidebar.classList.toggle('active');
    menuToggle.classList.toggle('active', isActive);
    overlay.classList.toggle('active', isActive);
    document.body.classList.toggle('sidebar-active', isActive);
}

menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// Cerrar sidebar al hacer click fuera en móvil
document.addEventListener('click', (e) => {
    if (window.innerWidth > 1024) return;

    if (sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            toggleMenu();
        }
    }
});

// Navegación de categorías
const categoryButtons = document.querySelectorAll('.nav-category-title');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        const navItems = button.nextElementSibling;
        
        button.classList.toggle('active');
        navItems.classList.toggle('active');
    });
});

// Navegación de links
const navLinks = document.querySelectorAll('.nav-link');
const contentDiv = document.getElementById('content');

function loadContent(sectionId) {
    // Cargar contenido desde content.js
    if (typeof allContent !== 'undefined' && allContent[sectionId]) {
        contentDiv.innerHTML = `<section id="${sectionId}" class="content-section">${allContent[sectionId]}</section>`;
        
        // Aplicar syntax highlighting con Highlight.js
        if (typeof hljs !== 'undefined') {
            contentDiv.querySelectorAll('pre code').forEach((block) => {
                // Aplicar highlighting
                hljs.highlightElement(block);
                
                // Generar números de línea
                const pre = block.parentElement;
                const lines = block.textContent.split('\n');
                const lineCount = lines.length - (lines[lines.length - 1] === '' ? 1 : 0);
                
                // Crear string con números de línea
                let lineNumbers = '';
                for (let i = 1; i <= lineCount; i++) {
                    lineNumbers += i + '\n';
                }
                
                // Añadir al pre como data attribute
                pre.setAttribute('data-lines', lineNumbers);
                block.classList.add('has-line-numbers');
            });
        }
        
        // Añadir botones de copiar después del highlighting
        contentDiv.querySelectorAll('.code-block').forEach((codeBlock) => {
            const button = document.createElement('button');
            button.className = 'copy-button';
            button.textContent = 'Copiar';
            button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar';
            
            button.addEventListener('click', async () => {
                const code = codeBlock.querySelector('code').textContent;
                try {
                    await navigator.clipboard.writeText(code);
                    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiado!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Error al copiar:', err);
                }
            });
            
            codeBlock.style.position = 'relative';
            codeBlock.appendChild(button);
        });
        
        // Actualizar link activo
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        // Scroll al top y cerrar menu en móvil
        if (window.innerWidth <= 1024) {
            window.scrollTo(0, 0);
            if (sidebar.classList.contains('active')) {
                toggleMenu();
            }
        }
        
        // Actualizar URL sin recargar
        history.pushState(null, '', `#${sectionId}`);
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const sectionId = href.substring(1);
        loadContent(sectionId);
    });
});

// Cargar contenido inicial
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    const initialSection = hash || 'declaracion-variables';
    loadContent(initialSection);
    
    // Abrir la categoría del contenido inicial
    const activeLink = document.querySelector(`.nav-link[href="#${initialSection}"]`);
    if (activeLink) {
        const category = activeLink.closest('.nav-items');
        if (category) {
            category.classList.add('active');
            const categoryButton = category.previousElementSibling;
            if (categoryButton) {
                categoryButton.classList.add('active');
            }
        }
    }
});

// Manejar navegación con botones del navegador
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        loadContent(hash);
    }
});
