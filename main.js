const elements = {
  clicker: document.querySelector('.clicker'),
  clickerTop: document.querySelector('.clicker__shell--top'),
  clickerBottom: document.querySelector('.clicker__shell--bottom'),
  particlesContainer: document.querySelector('.particles-container'),
  reward: document.querySelector('.clicker__reward'),
  halo: document.querySelector('.halo'),
};

elements.clickerTop.style.backgroundImage = `url('assets/images/shell-top-egg.png')`;
elements.clickerBottom.style.backgroundImage = `url('assets/images/shell-bottom-egg.png')`;

const rewards = [
  {
    name: 'moon',
    rarity: 1,
  },
  {
    name: 'socks',
    rarity: 0,
  }
];

const GRAVITY = 20;
const maxRarity = rewards.reduce((max, reward) => reward.rarity > max ? reward.rarity : max, 0);

const gameState = {
  shellOpen: false,
  currentReward: rewards[0]
};

let clickTimeoutId;
let gameLoopTickThen;
let particles = [];

function setNewReward() {
  const rewardIndex = Math.floor(Math.random() * rewards.length);
  const reward = rewards[rewardIndex];

  gameState.currentReward = reward;
  elements.reward.style.backgroundImage = `url('assets/images/reward-${reward.name}.png')`;
}

function setEventListeners() {
  elements.clicker.addEventListener('mousedown', () => {
    if(gameState.shellOpen) return;
    const shellWillOpen = Math.random() > 0.8;
    const particleCount = shellWillOpen ? 35 : 3;

    clearTimeout(clickTimeoutId);
    removeAnimationClasses();
    createParticles(particleCount);

    if(shellWillOpen) {
      openShell();
      return;
    }

    requestAnimationFrame(() => {
      addAnimationClasses();
      clickTimeoutId = setTimeout(removeAnimationClasses, 1200);
    });
  });

  elements.reward.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    closeShell();
  });

  window.addEventListener('resize', () => {
    setHaloSize();
  });
}

function setHaloSize() {
  const maxDimensions = Math.max(window.innerWidth, window.innerHeight);
  const haloSize = maxDimensions * 1.4;
  elements.halo.style.width = `${haloSize}px`;
  elements.halo.style.height = `${haloSize}px`;
}

function openShell() {
  gameState.shellOpen = true;
  elements.clicker.classList.add('clicker--open');
  elements.clicker.classList.remove('clickable');

  setTimeout(() => {
    elements.reward.classList.add('animation--bounce-appear');

    setTimeout(() => {
      elements.reward.classList.remove('animation--bounce-appear');
      elements.reward.classList.add('animation--attention');
      elements.reward.classList.add('clickable');
    }, 500);
  }, 1000);
}

function closeShell() {
  gameState.shellOpen = false;
  elements.reward.classList.remove('animation--attention');
  elements.reward.classList.remove('clickable');
  elements.reward.classList.add('animation--evaporate');

  setTimeout(() => {
    elements.clicker.classList.add('animation--bounce-appear');
    elements.clicker.classList.remove('clicker--open');

    setTimeout(() => {
      setNewReward();
      elements.clicker.classList.add('clickable');
      elements.reward.classList.remove('animation--evaporate');
      elements.clicker.classList.remove('animation--bounce-appear');
    }, 1000);
  }, 500);

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
  elements.clicker.classList.remove('animation--bounce-appear');
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles(count) {
  [...Array(count)].map(() => {
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
  setHaloSize();
  setNewReward();
  gameLoopTickThen = Date.now() - 16;
  gameLoop();
  setEventListeners();
  elements.clicker.classList.add('clickable');
}

boot();