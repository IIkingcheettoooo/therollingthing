// Rarity tiers from worst to best
const rarities = [
  { name: 'worst trash', color: '#888' },
  { name: 'common', color: '#bbb' },
  { name: 'uncommon', color: '#7bed9f' },
  { name: 'decent', color: '#70a1ff' },
  { name: 'sweet', color: '#ffa502' },
  { name: 'epic', color: '#9b59b6' },
  { name: 'answome', color: '#f53b57' }, // assuming "awesome"
  { name: 'legendary', color: '#eccc68' },
  { name: 'mythic', color: '#f368e0' },
  { name: 'void', color: '#353b48' },
  { name: 'hacked', color: '#00d2d3' },
  { name: 'omega', color: '#fd79a8' },
  { name: 'bruh', color: '#6c5ce7' },
  { name: 'god', color: '#f9ca24' }
];

// Example items for each rarity (expand as desired)
const items = {
  'worst trash': ['Broken Stick', 'Cracked Pebble'],
  'common': ['Old Boot', 'Rusty Coin'],
  'uncommon': ['Shiny Button', 'Lucky Leaf'],
  'decent': ['Silver Ring', 'Ancient Key'],
  'sweet': ['Golden Tooth', 'Magic Feather'],
  'epic': ['Dragon Scale', 'Enchanted Gem'],
  'answome': ['Mystic Mask', 'Thunder Egg'],
  'legendary': ['Phoenix Feather', 'Unicorn Horn'],
  'mythic': ['Celestial Orb', 'Void Crystal'],
  'void': ['Dark Matter', 'Void Essence'],
  'hacked': ['Glitch Cube', 'Corrupted Chip'],
  'omega': ['Omega Core', 'Primal Rune'],
  'bruh': ['Bruh Stone', 'Epic Fail'],
  'god': ['Godly Relic', 'Divine Crown']
};

// Rarity base weights (lower = rarer)
const rarityWeights = [
  400,  // worst trash
  300,  // common
  200,  // uncommon
  100,  // decent
   80,  // sweet
   50,  // epic
   30,  // answome/awesome
   18,  // legendary
   10,  // mythic
    7,  // void
    5,  // hacked
    3,  // omega
    2,  // bruh
    1   // god
];

// Initial player state
let player = {
  luck: 1,
  boost: 1,
  rolls: 0,
  history: [],
  upgrades: {
    luck: 0,
    boost: 0
  }
};

// --- DOM references ---
const luckSpan = document.getElementById('luck');
const boostSpan = document.getElementById('boost');
const historyList = document.getElementById('history');
const rollResultDiv = document.getElementById('roll-result');

// --- Utility Functions ---
function saveGame() {
  localStorage.setItem('rnggame_save', JSON.stringify(player));
  alert('Game saved!');
}

function loadGame() {
  const data = localStorage.getItem('rnggame_save');
  if (data) {
    player = JSON.parse(data);
    updateStats();
    renderHistory();
    alert('Game loaded!');
  }
}

function updateStats() {
  luckSpan.textContent = player.luck;
  boostSpan.textContent = player.boost;
}

function buyLuck() {
  player.luck += 1;
  player.upgrades.luck += 1;
  updateStats();
}

function buyBoost() {
  player.boost += 1;
  player.upgrades.boost += 1;
  updateStats();
}

// --- Roll Logic ---
function roll(type) {
  player.rolls += 1;
  let luckMult = 1;
  let rollType = type;
  
  // Mega and Super Rolls
  if (type === 'mega') luckMult = 10;
  else if (type === 'super') luckMult = 5;

  // Every 10th roll is Simple 2x
  if (type === 'simple' && player.rolls % 10 === 0) {
    luckMult = 2;
    rollType = 'simple 2x (bonus!)';
  }

  const totalLuck = player.luck * luckMult * player.boost;

  // Compute rarity odds
  const weightedRarities = rarityWeights.map((w, i) => {
    // Rarer items get more "help" from luck
    // For simplicity: reduce weight by (luck-1)% for each level, capped minimum at 1
    const reduction = Math.floor(totalLuck * (14 - i) * 0.2);
    return Math.max(1, w - reduction);
  });

  // Weighted random selection
  const sum = weightedRarities.reduce((a, b) => a + b);
  let r = Math.floor(Math.random() * sum);
  let rarityIndex = 0;
  for (; rarityIndex < weightedRarities.length; rarityIndex++) {
    if (r < weightedRarities[rarityIndex]) break;
    r -= weightedRarities[rarityIndex];
  }
  const rarity = rarities[rarityIndex] || rarities[0];
  const itemArr = items[rarity.name] || items['common'];
  const item = itemArr[Math.floor(Math.random() * itemArr.length)];

  // Record history
  const entry = {
    time: new Date().toLocaleTimeString(),
    rollType,
    item,
    rarity: rarity.name
  };
  player.history.unshift(entry);
  if (player.history.length > 50) player.history.pop();

  // Render
  rollResultDiv.innerHTML = `You rolled: <span style="color:${rarity.color}">${item}</span> <span style="font-size:0.9em;">[${rarity.name}]</span> <span style="font-size:0.8em;opacity:0.7;">(${rollType})</span>`;
  renderHistory();
  updateStats();
}

function renderHistory() {
  historyList.innerHTML = '';
  player.history.forEach(entry => {
    const rarityObj = rarities.find(r => r.name === entry.rarity) || rarities[0];
    const li = document.createElement('li');
    li.innerHTML = `<span style="color:${rarityObj.color}">${entry.item}</span> [${entry.rarity}] <span style="opacity:0.7;font-size:0.88em;">(${entry.rollType} @ ${entry.time})</span>`;
    historyList.appendChild(li);
  });
}

// --- Init ---
updateStats();
renderHistory();
