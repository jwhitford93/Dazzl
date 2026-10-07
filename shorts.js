// ================================================================
// SHORTS STRIP
// Paste YouTube links (Shorts or normal videos) into the list below.
// The first one starts in the centre. Titles aren't shown on the page; screen readers use them.
// ================================================================
(function () {
    const shorts = [
        { url: 'https://www.youtube.com/shorts/xnYuDw3M198', title: 'Katrina face paint tutorial' },
        { url: 'https://www.youtube.com/shorts/zq_FrTgwooI', title: 'Moana face paint tutorial' },
        { url: 'https://www.youtube.com/shorts/hJ6lmaz59V4', title: 'Easy face paint for kids and adults' },
        { url: 'https://www.youtube.com/shorts/exKZeT7OzFg', title: 'Flower face paint tutorial' },
        { url: 'https://www.youtube.com/shorts/hXtXP0-bMh0', title: 'Rainbow face paint tutorial' },
        
        // { url: 'https://www.youtube.com/shorts/XXXXXXXXXXX', title: 'Optional title' },
    ];

    const sideCards = 2;   // how many cards show behind the centre one on each side

    const mount = document.getElementById('shorts-flow');
    if (!mount) return;

    function videoId(entry) {
        const raw = typeof entry === 'string' ? entry : (entry && entry.url) || '';
        const m = raw.match(/(?:shorts\/|[?&]v=|youtu\.be\/|embed\/)([\w-]{11})/) || raw.match(/^([\w-]{11})$/);
        return m ? m[1] : null;
    }

    const items = shorts
        .map(s => ({ id: videoId(s), title: (s && s.title) || '' }))
        .filter(s => s.id);
    if (!items.length) return;

    const stage = document.createElement('div');
    stage.className = 'shorts-stage';

    // Shorts have a portrait thumbnail (oar2). Normal videos don't, so fall back to the standard one.
    function setThumb(img, id) {
        const fallback = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
        img.onerror = () => { img.onerror = null; img.onload = null; img.src = fallback; };
        img.onload = () => {
            if (img.naturalWidth <= 120 && img.src !== fallback) { img.onload = null; img.src = fallback; }
        };
        img.src = 'https://i.ytimg.com/vi/' + id + '/oar2.jpg';
    }

    const cards = items.map((item, i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'shorts-card';
        card.setAttribute('aria-label', item.title ? 'Play: ' + item.title : 'Play video ' + (i + 1));
        const img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        setThumb(img, item.id);
        const play = document.createElement('span');
        play.className = 'shorts-play';
        card.append(img, play);
        card.addEventListener('click', () => {
            if (swiped) return;
            if (i === active) playCard(i); else goTo(i);
        });
        stage.appendChild(card);
        return card;
    });

    let active = 0;
    let swiped = false;

    function stopAll() {
        cards.forEach(card => {
            const frame = card.querySelector('iframe');
            if (frame) frame.remove();
            card.classList.remove('is-playing');
        });
    }

    function playCard(i) {
        const card = cards[i];
        if (card.classList.contains('is-playing')) return;
        const frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + items[i].id + '?autoplay=1&rel=0&playsinline=1';
        frame.title = items[i].title || 'YouTube video';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allowFullscreen = true;
        card.appendChild(frame);
        card.classList.add('is-playing');
    }

    function layout() {
        const n = items.length;
        const half = Math.floor(n / 2);
        cards.forEach((card, i) => {
            // Signed distance from the centre card, wrapping round so both sides stay filled
            let d = ((i - active) % n + n + half) % n - half;
            if (n % 2 === 0 && d === -half) d = half;
            const abs = Math.abs(d);
            const sign = Math.sign(d);
            const shift = abs === 0 ? 0 : sign * (58 + (abs - 1) * 30);
            const scale = Math.max(0.5, 1 - abs * 0.17);
            const hidden = abs > sideCards;
            card.style.transform = 'translateX(calc(-50% + ' + shift + '%)) scale(' + scale + ') rotateY(' + (-sign * 28) + 'deg)';
            card.style.zIndex = String(20 - abs);
            card.style.opacity = hidden ? '0' : '1';
            card.style.filter = abs === 0 ? 'none' : 'brightness(' + Math.max(0.35, 1 - abs * 0.3) + ')';
            card.style.pointerEvents = hidden ? 'none' : 'auto';
            card.tabIndex = hidden ? -1 : 0;
            card.classList.toggle('is-active', abs === 0);
        });
    }

    function goTo(i) {
        const n = items.length;
        active = ((i % n) + n) % n;
        stopAll();
        layout();
    }

    mount.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { goTo(active - 1); cards[active].focus(); e.preventDefault(); }
        if (e.key === 'ArrowRight') { goTo(active + 1); cards[active].focus(); e.preventDefault(); }
    });

    // Swipe / drag
    let startX = null;
    stage.addEventListener('pointerdown', (e) => { startX = e.clientX; swiped = false; });
    stage.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) {
            swiped = true;
            goTo(active + (dx < 0 ? 1 : -1));
            setTimeout(() => { swiped = false; }, 0);
        }
    });
    stage.addEventListener('pointercancel', () => { startX = null; });

    mount.append(stage);
    layout();
})();
