const elements = {
  clicker: document.querySelector('.clicker'),
  clickerTop: document.querySelector('.clicker__shell--top'),
  clickerBottom: document.querySelector('.clicker__shell--bottom'),
  particlesContainer: document.querySelector('.particles-container'),
};

elements.clickerTop.style.backgroundImage = `url('assets/images/shell-top-egg.png')`;
elements.clickerBottom.style.backgroundImage = `url('assets/images/shell-bottom-egg.png')`;

const GRAVITY = 20;

let clickTimeoutId;
let particles = [];
let gameLoopTickThen;

elements.clicker.addEventListener('mousedown', () => {
  clearTimeout(clickTimeoutId);
  removeAnimationClasses();
  createParticles();

  if(Math.random() > 0.6) {
    openClicker();
    return;
  }

  requestAnimationFrame(() => {
    addAnimationClasses();
    clickTimeoutId = setTimeout(removeAnimationClasses, 1200);
  });
});

function openClicker() {
  elements.clicker.classList.add('clicker--open');
}

function addAnimationClasses() {
  elements.clicker.classList.add('animation--shake');
  elements.clickerTop.classList.add('animation--bounce-up');
  elements.clickerBottom.classList.add('animation--bounce-down');
}

function removeAnimationClasses() {
  elements.clicker.classList.remove('animation--shake');
  elements.clickerTop.classList.remove('animation--bounce-up');
  elements.clickerBottom.classList.remove('animation--bounce-down');
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles() {
  [...Array(5)].map(() => {
    const particle = {
      x: randomBetween(-150, 150),
      y: randomBetween(-200, 200),
      vX: randomBetween(-500, 500),
      vY: randomBetween(-250, -800),
      life: 2,
      scale: randomBetween(0.1, 0.5),
      angle: Math.random() * Math.PI * 2,
      angularVelocity: randomBetween(-5, 5),
      element: document.createElement('div')
    };

    particle.element.classList.add('particle');
    updateParticleElement(particle);

    appendParticle(particle);
  });
}

function appendParticle(particle) {
  particles.push(particle);
  elements.particlesContainer.appendChild(particle.element);
}

function removeParticle(particle) {
  elements.particlesContainer.removeChild(particle.element);
  particles = particles.filter(p => p !== particle);
}

function gameLoop() {
  const now = Date.now();
  const dtInMs = now - gameLoopTickThen;
  const dtInSeconds = dtInMs / 1000;
  gameLoopTickThen = now;

  updateGame(dtInSeconds);

  requestAnimationFrame(gameLoop)
}

function updateGame(dt) {
  particles.forEach(updateParticle(dt));
}

function updateParticleElement(particle) {
  particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.angle}rad) scale(${particle.scale}, ${particle.scale})`;
}

function updateParticle(dt) {
  return particle => {
    particle.life -= dt;
    particle.vY += GRAVITY;
    particle.x += particle.vX * dt;
    particle.y += particle.vY * dt;
    particle.angle += particle.angularVelocity * dt;

    updateParticleElement(particle);

    if(particle.life <= 0) {
      removeParticle(particle);
    }
  };
}

function particleIsAlive(particle) {
  return particle.life > 0;
}

function boot() {
  gameLoopTickThen = Date.now() - 16;
  gameLoop();
}

boot();