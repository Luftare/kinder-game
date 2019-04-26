const elements = {
  clicker: document.querySelector('.clicker'),
  clickerTop: document.querySelector('.clicker__shell--top'),
  clickerBottom: document.querySelector('.clicker__shell--bottom'),
  particlesContainer: document.querySelector('.particles-container'),
  reward: document.querySelector('.clicker__reward'),
  halo: document.querySelector('.halo'),
};

const howl = new Howl({
  src: ['assets/audio/fx.mp3'],
  sprite: {
    tick: [0, 400],
    crack: [1000, 400],
    rarity0: [2000, 2000],
    rarity1: [4000, 2000],
    rarity2: [6000, 2000],
    rarity3: [8000, 2000],
    rarity4: [10000, 2000],
    shine: [12440, 3550]
  }
});

elements.clickerTop.style.backgroundImage = `url('assets/images/shell-top-egg.png')`;
elements.clickerBottom.style.backgroundImage = `url('assets/images/shell-bottom-egg.png')`;

const rewards = [
  {
    name: 'diamond',
    rarity: 4,
  },
  {
    name: 'heart',
    rarity: 3,
  },
  {
    name: 'lamb',
    rarity: 3,
  },
  {
    name: 'moon',
    rarity: 2,
  },
  {
    name: 'rainbow',
    rarity: 2,
  },
  {
    name: 'rocket',
    rarity: 2,
  },
  {
    name: 'flower',
    rarity: 1,
  },
  {
    name: 'cloud',
    rarity: 1,
  },
  {
    name: 'traffic-lights',
    rarity: 1,
  },
  {
    name: 'clock',
    rarity: 1,
  },
  {
    name: 'socks',
    rarity: 0,
  },
  {
    name: 'bicycle',
    rarity: 0,
  },
  {
    name: 'boots',
    rarity: 0,
  },
  {
    name: 'pine',
    rarity: 0,
  },
  {
    name: 'plane',
    rarity: 0,
  },
  {
    name: 'window',
    rarity: 0,
  },
];

const GRAVITY = 20;
const RARITY_CURVE = 0.3;
const maxRarity = rewards.reduce((max, reward) => reward.rarity > max ? reward.rarity : max, 0);

const gameState = {
  shellOpen: false,
  currentReward: rewards[0],
  clicksToNextReward: 5,
};

let clickTimeoutId;
let shineFXPlaybackId;
let gameLoopTickThen;
let particles = [];

function setNewReward() {
  const weightedRandom = 1 - Math.random() ** RARITY_CURVE;
  const nextRewardRarity = Math.round(maxRarity * weightedRandom);
  const possibleRewards = rewards.filter(reward => reward.rarity === nextRewardRarity);
  const rewardIndex = Math.floor(Math.random() * possibleRewards.length);
  const reward = possibleRewards[rewardIndex];
  const clicksToNextReward = Math.round(randomBetween(3, 5 + nextRewardRarity * 5));

  gameState.clicksToNextReward = clicksToNextReward;
  gameState.currentReward = reward;

  elements.reward.style.backgroundImage = `url('assets/images/reward-${reward.name}.png')`;
  elements.halo.style.backgroundImage = `url('assets/images/halo-${reward.rarity}.png')`;
}

function setEventListeners() {
  function handleClickerClick() {
    if(gameState.shellOpen) return;

    gameState.clicksToNextReward--;

    const shellWillOpen = gameState.clicksToNextReward <= 0;
    const particleCount = shellWillOpen ? 35 : 1;

    clearTimeout(clickTimeoutId);
    removeAnimationClasses();
    createParticles(particleCount);

    if(shellWillOpen) {
      openShell();
      return;
    } else {
      howl.play('tick');
    }

    requestAnimationFrame(() => {
      addAnimationClasses();
      clickTimeoutId = setTimeout(removeAnimationClasses, 1200);
    });
  }

  function handleRewardClick(e) {
    e.stopPropagation();
    closeShell();
  }

  elements.clicker.addEventListener('mousedown', handleClickerClick);
  elements.clicker.addEventListener('touchstart', handleClickerClick);

  elements.reward.addEventListener('mousedown', handleRewardClick);
  elements.reward.addEventListener('touchstart', handleRewardClick);

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

  howl.play('crack');

  shineFXPlaybackId = howl.play('shine');
  howl.loop(true, shineFXPlaybackId);
  howl.volume(0.0, shineFXPlaybackId);
  howl.fade(0, 0.3, 2000, shineFXPlaybackId);

  setTimeout(() => {
    elements.reward.classList.add('animation--bounce-appear');
    howl.play(`rarity${gameState.currentReward.rarity}`);

    setTimeout(() => {
      elements.reward.classList.remove('animation--bounce-appear');
      elements.reward.classList.add('animation--attention');
      elements.reward.classList.add('clickable');
    }, 500);
  }, 1500);
}

function closeShell() {

  howl.fade(0.3, 0, 300, shineFXPlaybackId);
  gameState.shellOpen = false;
  elements.reward.classList.remove('animation--attention');
  elements.reward.classList.remove('clickable');
  elements.reward.classList.add('animation--evaporate');

  setTimeout(() => {
    howl.stop(shineFXPlaybackId);
    elements.clicker.classList.add('animation--bounce-appear');
    elements.clicker.classList.remove('clicker--open');

    setTimeout(() => {
      setNewReward();
      elements.reward.classList.remove('animation--evaporate');
      elements.clicker.classList.remove('animation--bounce-appear');
      elements.clicker.classList.add('clickable');
    }, 500);
  }, 300);

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