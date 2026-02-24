// 游戏状态
let gameState = {
    hero: {
        name: '勇者',
        level: 1,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 15,
        defense: 5,
        exp: 0,
        expToLevel: 100,
        potions: 3,
        isDefending: false
    },
    dragon: {
        name: '炎之巨龙',
        level: 5,
        hp: 200,
        maxHp: 200,
        attack: 20,
        defense: 8
    },
    turn: 1,
    isPlayerTurn: true,
    gameOver: false
};

// DOM元素
const elements = {
    heroHp: document.getElementById('heroHp'),
    heroMaxHp: document.getElementById('heroMaxHp'),
    heroHpBar: document.getElementById('heroHpBar'),
    heroMp: document.getElementById('heroMp'),
    heroMaxMp: document.getElementById('heroMaxMp'),
    heroMpBar: document.getElementById('heroMpBar'),
    heroLevel: document.getElementById('heroLevel'),
    potionCount: document.getElementById('potionCount'),
    dragonHp: document.getElementById('dragonHp'),
    dragonMaxHp: document.getElementById('dragonMaxHp'),
    dragonHpBar: document.getElementById('dragonHpBar'),
    dragonLevel: document.getElementById('dragonLevel'),
    battleLog: document.getElementById('battleLog'),
    hero: document.getElementById('hero'),
    dragon: document.getElementById('dragon'),
    gameOver: document.getElementById('gameOver'),
    resultText: document.getElementById('resultText'),
    resultIcon: document.getElementById('resultIcon'),
    startScreen: document.getElementById('startScreen')
};

// 初始化游戏
function initGame() {
    updateUI();
    addLog('战斗开始！勇者遭遇了炎之巨龙！', 'system');
}

// 开始游戏
function startGame() {
    elements.startScreen.style.display = 'none';
    initGame();
}

// 更新UI
function updateUI() {
    // 勇者状态
    elements.heroHp.textContent = gameState.hero.hp;
    elements.heroMaxHp.textContent = gameState.hero.maxHp;
    elements.heroHpBar.style.width = (gameState.hero.hp / gameState.hero.maxHp * 100) + '%';
    elements.heroMp.textContent = gameState.hero.mp;
    elements.heroMaxMp.textContent = gameState.hero.maxMp;
    elements.heroMpBar.style.width = (gameState.hero.mp / gameState.hero.maxMp * 100) + '%';
    elements.heroLevel.textContent = gameState.hero.level;
    elements.potionCount.textContent = gameState.hero.potions;

    // 巨龙状态
    elements.dragonHp.textContent = gameState.dragon.hp;
    elements.dragonMaxHp.textContent = gameState.dragon.maxHp;
    elements.dragonHpBar.style.width = (gameState.dragon.hp / gameState.dragon.maxHp * 100) + '%';
    elements.dragonLevel.textContent = gameState.dragon.level;
}

// 添加战斗日志
function addLog(message, type = 'normal') {
    const logEntry = document.createElement('div');
    logEntry.innerHTML = message;
    if (type === 'damage') logEntry.className = 'damage';
    if (type === 'heal') logEntry.className = 'heal';
    if (type === 'crit') logEntry.className = 'crit';
    elements.battleLog.appendChild(logEntry);
    elements.battleLog.scrollTop = elements.battleLog.scrollHeight;
}

// 显示伤害数字
function showDamageNumber(target, damage, isHeal = false) {
    const rect = target.getBoundingClientRect();
    const number = document.createElement('div');
    number.className = isHeal ? 'damage-number heal-number' : 'damage-number';
    number.textContent = isHeal ? '+' + damage : '-' + damage;
    number.style.left = rect.left + rect.width / 2 + 'px';
    number.style.top = rect.top + 'px';
    document.body.appendChild(number);
    setTimeout(() => number.remove(), 1000);
}

// 勇者攻击
function heroAttack() {
    if (!gameState.isPlayerTurn || gameState.gameOver) return;
    
    disableButtons();
    
    // 动画
    elements.hero.classList.add('attack');
    setTimeout(() => elements.hero.classList.remove('attack'), 500);
    
    // 计算伤害
    const baseDamage = gameState.hero.attack;
    const variance = Math.floor(Math.random() * 5) - 2;
    let damage = Math.max(1, baseDamage + variance - gameState.dragon.defense);
    
    // 暴击判定
    const isCrit = Math.random() < 0.15;
    if (isCrit) {
        damage = Math.floor(damage * 1.5);
        addLog(`⚔️ 勇者发动攻击！<span class="crit">暴击！造成了 ${damage} 点伤害！</span>`, 'crit');
    } else {
        addLog(`⚔️ 勇者发动攻击！造成了 ${damage} 点伤害！`);
    }
    
    // 应用伤害
    setTimeout(() => {
        elements.dragon.classList.add('hit');
        setTimeout(() => elements.dragon.classList.remove('hit'), 300);
        showDamageNumber(elements.dragon, damage);
        
        gameState.dragon.hp = Math.max(0, gameState.dragon.hp - damage);
        updateUI();
        
        // 检查胜利
        if (gameState.dragon.hp <= 0) {
            setTimeout(() => victory(), 1000);
        } else {
            setTimeout(() => dragonTurn(), 1000);
        }
    }, 300);
}

// 勇者技能
function heroSkill() {
    if (!gameState.isPlayerTurn || gameState.gameOver) return;
    if (gameState.hero.mp < 10) {
        addLog('💧 MP不足！无法使用技能！');
        return;
    }
    
    disableButtons();
    
    // 消耗MP
    gameState.hero.mp -= 10;
    
    // 动画
    elements.hero.classList.add('attack');
    setTimeout(() => elements.hero.classList.remove('attack'), 500);
    
    // 技能伤害
    const damage = Math.floor(gameState.hero.attack * 2.5);
    
    addLog(`🔥 勇者使用烈焰斩！<span class="crit">造成了 ${damage} 点火焰伤害！</span>`, 'crit');
    
    setTimeout(() => {
        elements.dragon.classList.add('hit');
        setTimeout(() => elements.dragon.classList.remove('hit'), 300);
        showDamageNumber(elements.dragon, damage);
        
        gameState.dragon.hp = Math.max(0, gameState.dragon.hp - damage);
        updateUI();
        
        if (gameState.dragon.hp <= 0) {
            setTimeout(() => victory(), 1000);
        } else {
            setTimeout(() => dragonTurn(), 1000);
        }
    }, 300);
}

// 使用药水
function usePotion() {
    if (!gameState.isPlayerTurn || gameState.gameOver) return;
    if (gameState.hero.potions <= 0) {
        addLog('💊 没有药水了！');
        return;
    }
    if (gameState.hero.hp >= gameState.hero.maxHp) {
        addLog('💚 HP已满！');
        return;
    }
    
    disableButtons();
    
    gameState.hero.potions--;
    const healAmount = 30;
    gameState.hero.hp = Math.min(gameState.hero.maxHp, gameState.hero.hp + healAmount);
    
    showDamageNumber(elements.hero, healAmount, true);
    addLog(`💊 勇者使用了药水！<span class="heal">恢复了 ${healAmount} 点HP！</span>`, 'heal');
    
    updateUI();
    setTimeout(() => dragonTurn(), 1000);
}

// 勇者防御
function heroDefend() {
    if (!gameState.isPlayerTurn || gameState.gameOver) return;
    
    disableButtons();
    
    gameState.hero.isDefending = true;
    addLog('🛡️ 勇者进入防御姿态！受到的伤害减半！');
    
    setTimeout(() => dragonTurn(), 1000);
}

// 巨龙回合
function dragonTurn() {
    if (gameState.gameOver) return;
    
    gameState.isPlayerTurn = false;
    gameState.turn++;
    
    // 巨龙动画
    elements.dragon.classList.add('attack');
    setTimeout(() => elements.dragon.classList.remove('attack'), 500);
    
    // 选择行动
    const action = Math.random();
    
    setTimeout(() => {
        if (action < 0.6) {
            // 普通攻击
            dragonAttack();
        } else if (action < 0.85) {
            // 火焰吐息
            dragonFireBreath();
        } else {
            // 龙吼（提升攻击）
            dragonRoar();
        }
    }, 500);
}

// 巨龙攻击
function dragonAttack() {
    const baseDamage = gameState.dragon.attack;
    const variance = Math.floor(Math.random() * 6) - 3;
    let damage = Math.max(1, baseDamage + variance - gameState.hero.defense);
    
    // 防御减半
    if (gameState.hero.isDefending) {
        damage = Math.floor(damage / 2);
        addLog(`🐲 炎之巨龙发动攻击！勇者防御成功！受到 ${damage} 点伤害！`);
    } else {
        addLog(`🐲 炎之巨龙发动攻击！造成了 <span class="damage">${damage} 点伤害！</span>`, 'damage');
    }
    
    applyDamageToHero(damage);
}

// 火焰吐息
function dragonFireBreath() {
    const damage = Math.floor(gameState.dragon.attack * 1.3);
    addLog(`🔥 炎之巨龙使用火焰吐息！造成了 <span class="damage">${damage} 点火焰伤害！</span>`, 'damage');
    applyDamageToHero(damage);
}

// 龙吼
function dragonRoar() {
    gameState.dragon.attack += 3;
    addLog(`🐲 炎之巨龙发出震天龙吼！攻击力提升了！`);
    endDragonTurn();
}

// 应用伤害到勇者
function applyDamageToHero(damage) {
    elements.hero.classList.add('hit');
    setTimeout(() => elements.hero.classList.remove('hit'), 300);
    showDamageNumber(elements.hero, damage);
    
    gameState.hero.hp = Math.max(0, gameState.hero.hp - damage);
    updateUI();
    
    if (gameState.hero.hp <= 0) {
        setTimeout(() => defeat(), 1000);
    } else {
        setTimeout(() => endDragonTurn(), 1000);
    }
}

// 结束巨龙回合
function endDragonTurn() {
    gameState.hero.isDefending = false;
    gameState.isPlayerTurn = true;
    
    // 每回合回复少量MP
    if (gameState.hero.mp < gameState.hero.maxMp) {
        gameState.hero.mp = Math.min(gameState.hero.maxMp, gameState.hero.mp + 2);
        updateUI();
    }
    
    enableButtons();
}

// 禁用按钮
function disableButtons() {
    document.querySelectorAll('.action-buttons .btn').forEach(btn => {
        btn.disabled = true;
    });
}

// 启用按钮
function enableButtons() {
    document.querySelectorAll('.action-buttons .btn').forEach(btn => {
        btn.disabled = false;
    });
}

// 胜利
function victory() {
    gameState.gameOver = true;
    elements.resultText.textContent = '恭喜通关！';
    elements.resultIcon.textContent = '🏆';
    elements.gameOver.classList.add('show', 'victory');
    addLog('🎉 战斗胜利！勇者击败了炎之巨龙！');
}

// 失败
function defeat() {
    gameState.gameOver = true;
    elements.resultText.textContent = '战斗失败...';
    elements.resultIcon.textContent = '💀';
    elements.gameOver.classList.add('show', 'defeat');
    addLog('💀 勇者倒下了...游戏结束...');
}

// 重新开始
function restartGame() {
    // 重置游戏状态
    gameState = {
        hero: {
            name: '勇者',
            level: 1,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            attack: 15,
            defense: 5,
            exp: 0,
            expToLevel: 100,
            potions: 3,
            isDefending: false
        },
        dragon: {
            name: '炎之巨龙',
            level: 5,
            hp: 200,
            maxHp: 200,
            attack: 20,
            defense: 8
        },
        turn: 1,
        isPlayerTurn: true,
        gameOver: false
    };
    
    elements.gameOver.classList.remove('show', 'victory', 'defeat');
    elements.battleLog.innerHTML = '';
    
    initGame();
    enableButtons();
}

// 初始化
initGame();
