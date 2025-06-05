// Variables globales para Three.js
let scene, camera, renderer, planets = [], sun;
let scrollY = 0;
let isScrolling = false;

// Variables para el sistema de audio
let audioContext;
let audioEnabled = true;
let masterVolume = 0.3;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    createFloatingParticles();
    initScrollEffects();
    initAnimations();
    initSkillBars();
    initMouseSparkles();
    initAudioSystem();
});

// Sistema de audio para brillitos
function initAudioSystem() {
    // Crear contexto de audio
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio no soportado en este navegador');
        audioEnabled = false;
        return;
    }

    // Crear botón de control de audio
    createAudioToggle();
    
    // Inicializar el contexto de audio con la primera interacción del usuario
    document.addEventListener('click', initAudioContext, { once: true });
    document.addEventListener('touchstart', initAudioContext, { once: true });
}

function initAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function createAudioToggle() {
    const audioToggle = document.createElement('div');
    audioToggle.id = 'audio-toggle';
    audioToggle.innerHTML = `
        <button id="audio-btn" class="audio-control">
            <i class="fas fa-volume-up"></i>
        </button>
    `;
    audioToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 80px;
        z-index: 1001;
        background: rgba(185, 103, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 50px;
        padding: 5px;
        border: 1px solid rgba(185, 103, 255, 0.3);
    `;
    
    document.body.appendChild(audioToggle);
    
    const audioBtn = document.getElementById('audio-btn');
    audioBtn.addEventListener('click', toggleAudio);
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    const audioBtn = document.getElementById('audio-btn');
    const icon = audioBtn.querySelector('i');
    
    if (audioEnabled) {
        icon.className = 'fas fa-volume-up';
        audioBtn.style.color = '#b967ff';
        playSound('enable', 0.2);
    } else {
        icon.className = 'fas fa-volume-mute';
        audioBtn.style.color = '#666';
    }
}

// Función principal para reproducir sonidos
function playSound(type, volume = masterVolume, frequency = null) {
    if (!audioEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();
        
        // Conectar nodos
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar filtro
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime);
        
        // Configurar sonidos según el tipo
        switch(type) {
            case 'sparkle':
                createSparkleSound(oscillator, gainNode, volume, frequency);
                break;
            case 'click':
                createClickSound(oscillator, gainNode, volume);
                break;
            case 'hover':
                createHoverSound(oscillator, gainNode, volume);
                break;
            case 'magic':
                createMagicSound(oscillator, gainNode, volume);
                break;
            case 'enable':
                createEnableSound(oscillator, gainNode, volume);
                break;
            case 'chime':
                createChimeSound(oscillator, gainNode, volume);
                break;
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
    } catch (e) {
        console.log('Error reproduciendo sonido:', e);
    }
}

function createSparkleSound(oscillator, gainNode, volume, customFreq) {
    const baseFreq = customFreq || (400 + Math.random() * 800);
    const currentTime = audioContext.currentTime;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(baseFreq, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
}

function createClickSound(oscillator, gainNode, volume) {
    const currentTime = audioContext.currentTime;
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
}

function createHoverSound(oscillator, gainNode, volume) {
    const currentTime = audioContext.currentTime;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, currentTime);
    oscillator.frequency.linearRampToValueAtTime(900, currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.2);
}

function createMagicSound(oscillator, gainNode, volume) {
    const currentTime = audioContext.currentTime;
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.4);
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);
}

function createEnableSound(oscillator, gainNode, volume) {
    const currentTime = audioContext.currentTime;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, currentTime); // Do
    oscillator.frequency.setValueAtTime(659, currentTime + 0.1); // Mi
    oscillator.frequency.setValueAtTime(784, currentTime + 0.2); // Sol
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.3);
}

function createChimeSound(oscillator, gainNode, volume) {
    const currentTime = audioContext.currentTime;
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1047, currentTime); // Do agudo
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 1);
}

// Configuración de Three.js con sistema solar interactivo
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // Configuración básica de la escena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Crear campo de estrellas
    createStarField();
    
    // Crear el sol
    createSun();
    
    // Crear planetas con datos realistas
    createPlanets();
    
    // Posición inicial de la cámara
    camera.position.set(0, 15, 40);
    camera.lookAt(0, 0, 0);

    // Iniciar animación
    animate();
}

function createStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6bcd, // Color rosado para el sol
        emissive: 0xb967ff, // Emisión morada
        emissiveIntensity: 0.4
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    
    // Añadir luz del sol
    const sunLight = new THREE.PointLight(0xff6bcd, 1, 100);
    sun.add(sunLight);
    
    scene.add(sun);
}

function createPlanets() {
    const planetData = [
        { name: 'Mercury', size: 0.4, distance: 8, speed: 0.04, color: 0xb967ff, baseDistance: 8 }, // Morado
        { name: 'Venus', size: 0.6, distance: 12, speed: 0.03, color: 0xff6bcd, baseDistance: 12 }, // Rosa
        { name: 'Earth', size: 0.7, distance: 16, speed: 0.02, color: 0x6b7fff, baseDistance: 16 }, // Azul
        { name: 'Mars', size: 0.5, distance: 20, speed: 0.015, color: 0xb967ff, baseDistance: 20 }, // Morado
        { name: 'Jupiter', size: 2.0, distance: 28, speed: 0.01, color: 0xff6bcd, baseDistance: 28 }, // Rosa
        { name: 'Saturn', size: 1.7, distance: 36, speed: 0.008, color: 0x6b7fff, baseDistance: 36 }, // Azul
        { name: 'Uranus', size: 1.2, distance: 44, speed: 0.006, color: 0xb967ff, baseDistance: 44 }, // Morado
        { name: 'Neptune', size: 1.1, distance: 52, speed: 0.004, color: 0xff6bcd, baseDistance: 52 } // Rosa
    ];

    planetData.forEach((data, index) => {
        const geometry = new THREE.SphereGeometry(data.size, 20, 20);
        const material = new THREE.MeshBasicMaterial({ color: data.color });
        const planet = new THREE.Mesh(geometry, material);
        
        // Datos del planeta para animación
        planet.userData = {
            name: data.name,
            distance: data.distance,
            baseDistance: data.baseDistance,
            speed: data.speed,
            angle: Math.random() * Math.PI * 2,
            originalSize: data.size,
            targetDistance: data.distance,
            sectionIndex: index % 5 // Asociar con secciones (ahora 5 secciones)
        };
        
        planets.push(planet);
        scene.add(planet);
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Rotar el sol
    if (sun) {
        sun.rotation.y += 0.005;
    }

    // Animar planetas
    planets.forEach((planet, index) => {
        // Movimiento orbital
        planet.userData.angle += planet.userData.speed;
        
        // Interpolación suave de distancia basada en scroll
        planet.userData.distance += (planet.userData.targetDistance - planet.userData.distance) * 0.05;
        
        // Posición orbital
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
        
        // Rotación del planeta
        planet.rotation.y += 0.02;
        
        // Efecto de "respiración" basado en scroll
        const breathe = Math.sin(Date.now() * 0.001 + index) * 0.1 + 1;
        planet.scale.setScalar(breathe);
    });

    // Movimiento suave de cámara
    updateCameraPosition();

    renderer.render(scene, camera);
}

function updateCameraPosition() {
    const time = Date.now() * 0.0001;
    const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight);
    
    // Movimiento orbital de la cámara
    const radius = 50 + scrollProgress * 30;
    const height = 15 + Math.sin(scrollProgress * Math.PI) * 20;
    
    camera.position.x = Math.cos(time + scrollProgress * 2) * radius;
    camera.position.y = height;
    camera.position.z = Math.sin(time + scrollProgress * 2) * radius;
    
    // La cámara siempre mira hacia el centro
    camera.lookAt(0, 0, 0);
}

// Efectos de scroll interactivos
function initScrollEffects() {
    let ticking = false;

    function updateScrollEffects() {
        scrollY = window.pageYOffset;
        const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight);
        
        // Actualizar indicador de scroll
        updateScrollIndicator(scrollProgress);
        
        // Actualizar posiciones de planetas basado en sección visible
        updatePlanetPositions();
        
        // Efectos de navbar
        updateNavbar();
        
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
}

function updateScrollIndicator(progress) {
    const indicator = document.querySelector('.scroll-progress');
    if (indicator) {
        indicator.style.height = (progress * 100) + '%';
    }
}

function updatePlanetPositions() {
    const sections = document.querySelectorAll('.section');
    const windowHeight = window.innerHeight;
    
    sections.forEach((section, sectionIndex) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < windowHeight && rect.bottom > 0;
        const visibilityProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
        
        // Actualizar planetas asociados con esta sección
        planets.forEach((planet, planetIndex) => {
            if (planet.userData.sectionIndex === sectionIndex) {
                if (isVisible) {
                    // Acercar planeta cuando la sección es visible
                    const closeFactor = 0.6 + (visibilityProgress * 0.4);
                    planet.userData.targetDistance = planet.userData.baseDistance * closeFactor;
                    
                    // Efecto de brillo
                    planet.material.emissive = new THREE.Color(planet.material.color);
                    planet.material.emissiveIntensity = visibilityProgress * 0.3;
                } else {
                    // Alejar planeta cuando no es visible
                    planet.userData.targetDistance = planet.userData.baseDistance * 1.2;
                    planet.material.emissiveIntensity = 0;
                }
            }
        });
    });
}

function updateNavbar() {
    const navbar = document.getElementById('navbar');
    if (scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Partículas flotantes
function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        // Diferentes tamaños de partículas
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Colores aleatorios entre la paleta
        const colors = ['#b967ff', '#ff6bcd', '#6b7fff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = randomColor;
        
        particlesContainer.appendChild(particle);
    }
}

// Sistema de brillitos que siguen el mouse con audio
function initMouseSparkles() {
    let mouseX = 0;
    let mouseY = 0;
    let sparkleTimer = 0;
    
    // Crear contenedor para brillitos
    const sparkleContainer = document.createElement('div');
    sparkleContainer.id = 'sparkle-container';
    sparkleContainer.style.position = 'fixed';
    sparkleContainer.style.top = '0';
    sparkleContainer.style.left = '0';
    sparkleContainer.style.width = '100%';
    sparkleContainer.style.height = '100%';
    sparkleContainer.style.pointerEvents = 'none';
    sparkleContainer.style.zIndex = '9999';
    document.body.appendChild(sparkleContainer);
    
    // Seguir el mouse
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Crear brillitos ocasionalmente con sonido
        sparkleTimer++;
        if (sparkleTimer % 5 === 0) { // Cada 5 movimientos del mouse
            createSparkle(mouseX, mouseY);
            // Sonido sutil para movimiento del mouse
            if (Math.random() > 0.9) { // Solo ocasionalmente para no saturar
                playSound('sparkle', 0.1, 800 + Math.random() * 400);
            }
        }
    });
    
    // Crear brillitos al hacer click con sonido
    document.addEventListener('click', function(e) {
        playSound('click', 0.3);
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                createSparkle(
                    e.clientX + (Math.random() - 0.5) * 50,
                    e.clientY + (Math.random() - 0.5) * 50
                );
                if (i < 3) { // Solo los primeros 3 brillitos tienen sonido
                    playSound('sparkle', 0.2, 600 + i * 200);
                }
            }, i * 50);
        }
    });
}

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    const sparkleContainer = document.getElementById('sparkle-container');
    
    // Estilos del brillito
    const size = Math.random() * 8 + 4;
    const colors = ['#b967ff', '#ff6bcd', '#6b7fff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    sparkle.style.position = 'absolute';
    sparkle.style.left = (x - size/2) + 'px';
    sparkle.style.top = (y - size/2) + 'px';
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    sparkle.style.background = color;
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    
    // Formas alternativas de brillitos
    const shapes = ['circle', 'star', 'diamond'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    if (shape === 'star') {
        sparkle.style.borderRadius = '0';
        sparkle.style.transform = 'rotate(45deg)';
        sparkle.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    } else if (shape === 'diamond') {
        sparkle.style.borderRadius = '0';
        sparkle.style.transform = 'rotate(45deg)';
    }
    
    sparkleContainer.appendChild(sparkle);
    
    // Animación del brillito
    const randomDirection = Math.random() * 360;
    const distance = Math.random() * 100 + 50;
    const duration = Math.random() * 1000 + 800;
    
    const animation = sparkle.animate([
        {
            transform: `translate(0, 0) scale(0) ${shape === 'star' || shape === 'diamond' ? 'rotate(45deg)' : ''}`,
            opacity: 1
        },
        {
            transform: `translate(${Math.cos(randomDirection) * distance}px, ${Math.sin(randomDirection) * distance}px) scale(1) ${shape === 'star' || shape === 'diamond' ? 'rotate(405deg)' : ''}`,
            opacity: 0.5,
            offset: 0.7
        },
        {
            transform: `translate(${Math.cos(randomDirection) * distance * 1.5}px, ${Math.sin(randomDirection) * distance * 1.5}px) scale(0) ${shape === 'star' || shape === 'diamond' ? 'rotate(765deg)' : ''}`,
            opacity: 0
        }
    ], {
        duration: duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    // Remover el brillito cuando termine la animación
    animation.onfinish = () => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    };
}

// Sistema de animaciones AOS (Animate On Scroll)
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                // Sonido sutil al aparecer elementos
                if (Math.random() > 0.7) {
                    playSound('chime', 0.1);
                }
            }
        });
    }, observerOptions);

    // Observar todos los elementos con data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Barras de habilidades animadas
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width;
                    // Sonido de progreso
                    playSound('magic', 0.15);
                }, 200);
                skillObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
}

// Navegación suave
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        // Sonido de navegación
        playSound('chime', 0.2);
    }
}

// Menú móvil
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
    playSound('click', 0.2);
}

// Modal de proyectos
function openProjectModal(projectId) {
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    
    // Sonido de apertura de modal
    playSound('magic', 0.25);
    
    let content = '';
    
    switch(projectId) {
        case 'pollo':
            content = `
                <h2>Modelado 3D - Pollo Estilizado</h2>
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pollo.jpg-QbEUdVHLG83KKBgDPvrYRWRJXraiGf.jpeg" alt="Pollo 3D" style="width: 100%; max-width: 500px; border-radius: 10px; margin: 1rem 0;">
                <p>Este proyecto representa un enfoque minimalista del modelado 3D, utilizando formas geométricas simples para crear un personaje con personalidad. El modelo fue creado completamente en Blender, aplicando técnicas de low-poly modeling.</p>
                <h3>Técnicas Utilizadas:</h3>
                <ul>
                    <li>Modelado low-poly con geometría optimizada</li>
                    <li>Texturizado procedural con nodos de Blender</li>
                    <li>Iluminación de tres puntos para resaltar las formas</li>
                    <li>Renderizado con Cycles para obtener sombras suaves</li>
                </ul>
                <h3>Proceso Creativo:</h3>
                <p>El diseño se inspiró en la estética de los videojuegos indie modernos, buscando transmitir calidez y simplicidad. La paleta de colores pastel fue seleccionada para crear un contraste armonioso con el fondo degradado.</p>
            `;
            break;
        case 'room':
            content = `
                <h2>Diseño Arquitectónico 3D</h2>
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blenderaajsdhgkja.jpg-vKU7XRBZfuv2bSuk2lulsnpkABOGAx.jpeg" alt="Habitación 3D" style="width: 100%; max-width: 500px; border-radius: 10px; margin: 1rem 0;">
                <p>Proyecto de visualización arquitectónica que demuestra habilidades avanzadas en modelado de interiores, iluminación realista y composición espacial. Cada elemento fue modelado con atención al detalle.</p>
                <h3>Elementos Destacados:</h3>
                <ul>
                    <li>Modelado detallado de mobiliario y decoración</li>
                    <li>Sistema de iluminación natural y artificial</li>
                    <li>Texturas PBR para materiales realistas</li>
                    <li>Composición equilibrada del espacio</li>
                </ul>
                <h3>Herramientas y Técnicas:</h3>
                <p>Desarrollado íntegramente en Blender utilizando técnicas de modelado poligonal, unwrapping UV profesional, y renderizado con Cycles. Se aplicaron principios de diseño de interiores para crear un espacio funcional y estéticamente agradable.</p>
            `;
            break;
    }
    
    modalContent.innerHTML = content;
    modal.style.display = 'block';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    // Sonido de cierre
    playSound('click', 0.15);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeProjectModal();
    }
}

// Descargar CV
function downloadCV() {
    // Sonido especial para descarga
    playSound('magic', 0.3);
    alert('Funcionalidad de descarga de CV. Aquí se abriría/descargaría el archivo PDF del curriculum.');
    // window.open('ruta/al/cv.pdf', '_blank');
}

// Manejo de redimensionamiento de ventana
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

window.addEventListener('resize', onWindowResize);

// Efectos de teclado para navegación
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            window.scrollBy(0, window.innerHeight);
            playSound('chime', 0.1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            window.scrollBy(0, -window.innerHeight);
            playSound('chime', 0.1);
            break;
        case 'Home':
            e.preventDefault();
            scrollToSection('home');
            break;
        case 'End':
            e.preventDefault();
            scrollToSection('merits');
            break;
    }
});

// Preloader (opcional)
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Sonido de bienvenida
    setTimeout(() => {
        playSound('magic', 0.2);
        createSpecialEffect(window.innerWidth / 2, window.innerHeight / 2, 'celebration');
    }, 1000);
    
    // Iniciar animaciones después de que todo esté cargado
    setTimeout(() => {
        initAnimations();
    }, 500);
});

// Efectos especiales en hover de elementos interactivos con audio
document.addEventListener('DOMContentLoaded', function() {
    // Efecto especial en botones
    const buttons = document.querySelectorAll('.cta-button, .cv-button, .action-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            playSound('hover', 0.15);
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const rect = button.getBoundingClientRect();
                    createSparkle(
                        rect.left + Math.random() * rect.width,
                        rect.top + Math.random() * rect.height
                    );
                }, i * 100);
            }
        });
    });
    
    // Efecto especial en cards de proyectos
    const projectCards = document.querySelectorAll('.project-item');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            playSound('hover', 0.12);
            const rect = card.getBoundingClientRect();
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createSparkle(
                        rect.left + Math.random() * rect.width,
                        rect.top + Math.random() * rect.height
                    );
                }, i * 150);
            }
        });
    });
});

// Efectos adicionales para móviles (touch) con audio
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        playSound('sparkle', 0.2);
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createSparkle(
                    touch.clientX + (Math.random() - 0.5) * 30,
                    touch.clientY + (Math.random() - 0.5) * 30
                );
            }, i * 100);
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (Math.random() > 0.9) { // Reducir frecuencia en móviles
            const touch = e.touches[0];
            createSparkle(touch.clientX, touch.clientY);
            if (Math.random() > 0.8) {
                playSound('sparkle', 0.1, 600 + Math.random() * 400);
            }
        }
    });
}

// Función para crear efectos especiales en eventos específicos
function createSpecialEffect(x, y, type = 'celebration') {
    switch(type) {
        case 'celebration':
            playSound('magic', 0.4);
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    createSparkle(
                        x + (Math.random() - 0.5) * 100,
                        y + (Math.random() - 0.5) * 100
                    );
                    if (i < 5) {
                        playSound('sparkle', 0.15, 400 + i * 200);
                    }
                }, i * 50);
            }
            break;
        case 'trail':
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    createSparkle(
                        x + Math.sin(i * 0.5) * 30,
                        y + Math.cos(i * 0.5) * 30
                    );
                    playSound('sparkle', 0.1, 800 + i * 100);
                }, i * 100);
            }
            break;
    }
}

// Limpiar brillitos antiguos para evitar acumulación de memoria
setInterval(() => {
    const sparkleContainer = document.getElementById('sparkle-container');
    if (sparkleContainer && sparkleContainer.children.length > 100) {
        // Remover los primeros 50 brillitos si hay más de 100
        for (let i = 0; i < 50; i++) {
            if (sparkleContainer.firstChild) {
                sparkleContainer.removeChild(sparkleContainer.firstChild);
            }
        }
    }
}, 5000);

// Optimización de rendimiento
let rafId;
function optimizedAnimate() {
    rafId = requestAnimationFrame(optimizedAnimate);
    
    // Solo animar si la página está visible
    if (!document.hidden) {
        animate();
    }
}

// Pausar animaciones cuando la página no está visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
    } else {
        optimizedAnimate();
    }
});