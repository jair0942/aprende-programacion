// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// ===== LENIS SMOOTH SCROLL =====
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

// Sync Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Refresh ScrollTrigger on window resize to avoid position bugs
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// ===== CUSTOM CURSOR (IMPROVED SPEED) =====
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
let mouseX = 0, mouseY = 0, posX = 0, posY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Direct movement for cursor for instant feel
    gsap.set(cursor, { x: mouseX - 6, y: mouseY - 6 });
});

function animateCursor() {
    // Increased interpolation factor for faster following (0.12 -> 0.25)
    posX += (mouseX - posX) * 0.25;
    posY += (mouseY - posY) * 0.25;
    gsap.set(follower, { x: posX - 20, y: posY - 20 });
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .h-card, .lang-item, .create-card, .career-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(cursor, { scale: 2.5, duration: 0.3 });
        gsap.to(follower, { 
            width: 60, height: 60, 
            borderColor: 'rgba(0,229,255,1)',
            borderWidth: '1px',
            x: posX - 30, y: posY - 30,
            duration: 0.3 
        });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(cursor, { scale: 1, duration: 0.3 });
        gsap.to(follower, { 
            width: 40, height: 40, 
            borderColor: 'rgba(0,229,255,0.5)',
            borderWidth: '2px',
            x: posX - 20, y: posY - 20,
            duration: 0.3 
        });
    });
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 100);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== HERO ANIMATIONS =====
const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

heroTl
    .from('.hero-tag', { opacity: 0, y: 30, duration: 1 })
    .from('.tag-line', { scaleX: 0, transformOrigin: 'left', duration: 0.8 }, '-=0.5')
    .from('.line-inner', { yPercent: 110, duration: 1.4, stagger: 0.15 }, '-=0.8')
    .from('.word-reveal', { opacity: 0, y: 20, duration: 1, stagger: 0.12 }, '-=0.8')
    .from('.hero-stats', { opacity: 0, y: 40, duration: 1.2 }, '-=0.6')
    .from('.scroll-cta', { opacity: 0, duration: 1 }, '-=0.5');

// Counter animation
document.querySelectorAll('.stat-number').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        once: true,
        onEnter: () => {
            gsap.to(counter, {
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: 'power2.out',
            });
        }
    });
});

// Parallax hero
gsap.to('.hero-video', {
    scale: 1.3, opacity: 0,
    scrollTrigger: {
        trigger: '.hero', start: 'top top',
        end: 'bottom top', scrub: true,
    }
});

// ===== UNIFIED REVEAL ANIMATIONS (FIXED VISIBILITY) =====
// This handles almost everything (text, cards, list items)
gsap.utils.toArray('.reveal-up, .lang-item, .create-card, .career-item').forEach(el => {
    gsap.from(el, {
        y: 60, 
        opacity: 0, 
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el, 
            start: 'top 92%', 
            toggleActions: 'play none none none', // Stay visible once played
            once: true // More robust for performance
        }
    });
});

gsap.utils.toArray('.reveal-scale').forEach(el => {
    gsap.from(el, {
        scale: 0.92, 
        opacity: 0, 
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el, 
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true
        }
    });
});

// ===== IMAGE PARALLAX =====
gsap.utils.toArray('.img-wrapper img').forEach(img => {
    gsap.to(img, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
            trigger: img.closest('.img-wrapper'),
            start: 'top bottom', end: 'bottom top',
            scrub: 1,
        }
    });
});

// ===== HORIZONTAL SCROLL (FIXED CARD VISIBILITY) =====
const track = document.querySelector('.horizontal-track');
if (track) {
    const cards = gsap.utils.toArray('.h-card');
    
    const getScrollAmount = () => {
        let trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth + window.innerWidth * 0.05);
    };

    const horizAction = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
            trigger: '.section-why',
            start: 'top top',
            end: () => `+=${track.scrollWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        }
    });

    // Animate cards entering during horizontal scroll
    cards.forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 60,
            scale: 0.85,
            rotation: 2,
            duration: 1,
            ease: 'back.out(1.5)',
            scrollTrigger: {
                trigger: card,
                containerAnimation: horizAction,
                start: 'left 85%',
                toggleActions: 'play none none none',
            }
        });
    });
}

// ===== SHOWCASE PARALLAX =====
gsap.to('.showcase-img img', {
    yPercent: 20, scale: 1.1,
    scrollTrigger: {
        trigger: '.section-showcase',
        start: 'top bottom', end: 'bottom top',
        scrub: true,
    }
});

// ===== CTA SECTION (FIXED VISIBILITY) =====
const ctaLines = document.querySelectorAll('.cta-title .line-inner');
if (ctaLines.length > 0) {
    // Set initial state via GSAP to avoid CSS conflicts
    gsap.set(ctaLines, { yPercent: 110, opacity: 0 });

    gsap.to(ctaLines, {
        yPercent: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: '.section-cta', // Trigger by the whole section
            start: 'top 80%', // Start earlier
            toggleActions: 'play none none none',
            once: true
        }
    });
}

gsap.to('.cta-bg-video video', {
    scale: 1.2,
    scrollTrigger: {
        trigger: '.section-cta',
        start: 'top bottom', end: 'bottom top',
        scrub: true,
    }
});

// ===== SMOOTH NAV SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            lenis.scrollTo(target, { 
                offset: -80, 
                duration: 1.2, 
                ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
            });
        }
    });
});

// ===== PAGE LOAD & REFRESH =====
window.addEventListener('load', () => {
    // Small delay to ensure all assets/fonts are rendered
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);
});
