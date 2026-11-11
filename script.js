(() => {
  const canvas = document.getElementById('signalCanvas');
  const ctx = canvas.getContext('2d');
  const pauseButton = document.getElementById('pauseButton');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, dpr = 1, raf = 0, paused = reduceMotion.matches;
  let stars = [], particles = [], nodes = [];
  const TAU = Math.PI * 2;
  const palette = ['#66e4ff', '#9c7bff', '#ff6cae', '#d9d4ff'];

  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = clamp(Math.floor((width * height) / 10500), 90, 240);
    stars = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), r: random(.25, 1.45), a: random(.16, .7), p: random(0, TAU), s: random(.0003, .0013) }));
    particles = Array.from({ length: clamp(Math.floor(width / 6), 100, 220) }, () => ({ t: Math.random(), speed: random(.0005, .0013), lane: Math.floor(random(0, 3)), size: random(.7, 1.9), color: palette[Math.floor(random(0, palette.length))] }));
  }

  function makeNodes(time) {
    const cx = width * .59, cy = height * .54;
    const scale = Math.min(width, height);
    return [
      { x: cx - scale * .235, y: cy - scale * .035, r: scale * .045, color: '#66e4ff', label: 'SOURCE', angle: time * .00035 },
      { x: cx + scale * .19, y: cy - scale * .17, r: scale * .037, color: '#ff6cae', label: 'TARGET', angle: time * -.00028 },
      { x: cx + scale * .17, y: cy + scale * .22, r: scale * .031, color: '#9c7bff', label: 'VERIFY', angle: time * .00042 }
    ];
  }

  function glowCircle(x, y, r, color, alpha = 1) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 4.2);
    gradient.addColorStop(0, `${color}${Math.floor(42 * alpha).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(.25, `${color}${Math.floor(18 * alpha).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, TAU); ctx.fill();
  }

  function bezierPoint(a, b, bend, t) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const c = { x: mx - dy / len * bend, y: my + dx / len * bend };
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  }

  function drawArc(a, b, bend, color, time, lane) {
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = `${color}28`; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const p = bezierPoint(a, b, bend, i / 40); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
    ctx.stroke();
    const pulse = ((time * .00016 + lane * .31) % 1);
    const p = bezierPoint(a, b, bend, pulse);
    glowCircle(p.x, p.y, 3.4, color, .75);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, TAU); ctx.fill(); ctx.restore();
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const cx = width * .59, cy = height * .54, scale = Math.min(width, height);
    nodes = makeNodes(time);

    // Deep radial relay core.
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * .55);
    core.addColorStop(0, 'rgba(83, 66, 175, .13)'); core.addColorStop(.5, 'rgba(31, 91, 143, .035)'); core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, scale * .55, 0, TAU); ctx.fill();

    // Slow star/particle field.
    stars.forEach(star => {
      const twinkle = star.a * (.65 + Math.sin(time * star.s + star.p) * .35);
      ctx.fillStyle = `rgba(177, 204, 255, ${twinkle})`;
      ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.r, 0, TAU); ctx.fill();
    });

    // Orbital construction lines.
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * .000035);
    [scale * .19, scale * .29, scale * .39].forEach((r, i) => {
      ctx.setLineDash(i === 1 ? [2, 12] : [1, 9]); ctx.lineDashOffset = -time * .01 * (i + 1);
      ctx.strokeStyle = i === 1 ? 'rgba(137, 121, 241, .2)' : 'rgba(128, 172, 223, .11)'; ctx.lineWidth = i === 1 ? 1.1 : .7;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    }); ctx.restore();

    drawArc(nodes[0], nodes[1], -scale * .08, '#66e4ff', time, 0);
    drawArc(nodes[1], nodes[2], scale * .08, '#ff6cae', time, 1);
    drawArc(nodes[2], nodes[0], scale * .11, '#9c7bff', time, 2);

    // Moving dust along the relay's triangular route.
    particles.forEach(particle => {
      const a = nodes[particle.lane], b = nodes[(particle.lane + 1) % nodes.length];
      const t = (particle.t + time * particle.speed) % 1;
      const p = bezierPoint(a, b, (particle.lane === 0 ? -1 : 1) * scale * .08, t);
      const alpha = Math.sin(Math.PI * t) * .75;
      ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath(); ctx.arc(p.x, p.y, particle.size, 0, TAU); ctx.fill();
    });

    nodes.forEach((node, i) => {
      const ring = node.r * (2.2 + Math.sin(time * .001 + i) * .12);
      glowCircle(node.x, node.y, node.r, node.color, .9);
      ctx.strokeStyle = `${node.color}75`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(node.x, node.y, ring, 0, TAU); ctx.stroke();
      ctx.strokeStyle = `${node.color}35`; ctx.setLineDash([1, 5]); ctx.beginPath(); ctx.arc(node.x, node.y, ring * 1.6, node.angle, node.angle + 4.5); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = node.color; ctx.beginPath(); ctx.arc(node.x, node.y, Math.max(2, node.r * .16), 0, TAU); ctx.fill();
    });

    if (!paused) raf = requestAnimationFrame(draw);
  }

  function togglePause() {
    paused = !paused;
    pauseButton.classList.toggle('is-paused', paused);
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
    pauseButton.querySelector('.pause-label').textContent = paused ? 'RESUME FIELD' : 'PAUSE FIELD';
    if (!paused) raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  pauseButton.addEventListener('click', togglePause);
  resize();
  draw(performance.now());
})();
