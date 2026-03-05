/**
 * Birthday Wishes - 精致版脚本
 */

const config = {
    nickname: "潘可依", // 接收者名字 (必填)
    sender: "张宏伟",      // 发送者名字 (必填)
    birthday: "03-04", // 格式: MM-DD
    
    // 错误提示池
    errors: {
        sender: [ // 发送者名字输错
            "居然连我名字都输错了！😠",
            "再给你一次机会，好好想想我是谁！😤",
            "名字不对，蛋糕不给吃！🚫",
            "是不是把我的名字记成别人了？💔"
        ],
        recipient: [ // 接收者名字输错
            "连自己名字都输错，重新来！👀",
            "你是不是忘了自己叫什么了？🤔",
        ],
        content: [ // 没写生日快乐
            "你过生日不开心吗？🥺",
            "要说“生日快乐”才行哦！🎂",
            "仪式感呢？快补上祝福！✨"
        ],
        format: [ // 格式完全不对
            "格式不对哦，请看上面的提示~ 👀",
            "要按照“xxx祝xxx生日快乐”的格式写哦 📝"
        ]
    },
    
    // 签文内容
    fortunes: [
        "岁岁无虞，长安常乐,昭昭如愿，岁岁安澜",
        "春风十里，贺卿良辰",
        "花卉沿途盛开，以后的路也是",
        "今天不吹牛了，吹蜡烛🕯️",
        "生日快乐！希望你每一天都像今天一样闪闪发光。",
        "祝你寿比南山大石头，福如东海老乌龟"
    ],
    
    // 祝福语
    shortWish: "生日快乐，万事顺意 ✨",
    longWish: "愿你新的一岁，平安喜乐，万事胜意。\n不管几岁，快乐万岁。\n希望你继续保持热爱，奔赴下一场山海。\n愿所有的好运，都能在此时此刻，如约而至。",
    
    // 悄悄话
    secrets: [
        "其实，你笑起来的样子真的超治愈！",
        "无论发生什么，都要记得爱自己呀。",
        "新的一岁，要更勇敢，也要更温柔。"
    ]
};

// 全局状态
let state = {
    currentPage: 1,
    isMusicPlaying: false,
    candlesBlown: 0,
    totalCandles: 6,
    isGiftOpen: false
};

// DOM 元素
const dom = {
    bgCanvas: document.getElementById('bg-canvas'),
    loading: document.getElementById('loading'),
    musicControl: document.getElementById('music-control'),
    bgMusic: document.getElementById('bg-music'),
    pages: document.querySelectorAll('.page'),
    unlockInput: document.getElementById('unlock-input'),
    errorMsg: document.getElementById('error-msg'),
    targetName: document.getElementById('target-name'),
    skipUnlock: document.getElementById('skip-unlock'),
    
    // Page 2: Ceremony
    startWishCard: document.getElementById('start-wish-card'),
    ceremonyLayer: document.getElementById('wish-ceremony-layer'),
    closeCeremony: document.getElementById('close-ceremony'),
    candleNums: document.querySelectorAll('.candle-num'),
    wishStage: document.getElementById('wish-stage'),
    wishInputGrand: document.getElementById('wish-text-grand'),
    confirmWishBtn: document.getElementById('confirm-wish-btn'),
    actionGuide: document.getElementById('guide-text'),
    grandFeedback: document.getElementById('grand-feedback'),

    fortuneCard: document.getElementById('fortune-card'),
    fortuneText: document.getElementById('fortune-text'),
    redrawBtn: document.getElementById('redraw-btn'),
    giftBox: document.getElementById('gift-box'),
    wishesPanel: document.getElementById('wishes-panel'),
    wishTitle: document.getElementById('short-wish-title'),
    wishContent: document.getElementById('long-wish-content'),
    cdDays: document.getElementById('cd-days'),
    whisperText: document.getElementById('whisper-text'),
    nextWhisperBtn: document.getElementById('next-whisper-btn'),
    genWallpaperBtn: document.getElementById('gen-wallpaper-btn'),
    finalCelebration: document.getElementById('final-celebration'),
    sounds: {
        unlock: document.getElementById('sound-unlock'),
        blow: document.getElementById('sound-blow'),
        card: document.getElementById('sound-card'),
        gift: document.getElementById('sound-gift'),
        piano: document.getElementById('sound-piano'),
        voice: document.getElementById('voice-audio')
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initApp();
});

function initApp() {
    // 设置名字
    // dom.targetName.innerText = config.nickname; // 这一行被注释或删除了，导致网页报错？
    // 如果 HTML 中删除了 <span id="target-name"></span>，那么这行代码会报错，导致后面的 js 无法执行
    if (dom.targetName) {
        dom.targetName.innerText = config.nickname;
    }
    
    // 模拟资源加载
    setTimeout(() => {
        dom.loading.style.opacity = '0';
        setTimeout(() => dom.loading.style.display = 'none', 800);
    }, 2000);

    bindEvents();
    updateCountdown();
}

function bindEvents() {
    // 音乐
    dom.musicControl.addEventListener('click', toggleMusic);

    // 解锁 (Input Only)
    dom.unlockInput.addEventListener('focus', () => {
        dom.errorMsg.classList.add('hidden');
        dom.unlockInput.classList.remove('error-shake');
    });
    dom.unlockInput.addEventListener('input', handleUnlockInput);
    dom.unlockInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkErrorOnEnter();
    });
    dom.skipUnlock.addEventListener('click', () => switchPage(2));

    // 许愿仪式入口
    dom.startWishCard.addEventListener('click', startCeremony);
    dom.closeCeremony.addEventListener('click', closeCeremony);

    // 蜡烛点亮
    dom.candleNums.forEach(candle => {
        candle.addEventListener('click', (e) => lightOneCandle(e.currentTarget));
    });

    // 确认许愿
    dom.confirmWishBtn.addEventListener('click', confirmWish);

    // 抽签
    dom.fortuneCard.addEventListener('click', flipFortuneCard);
    dom.redrawBtn.addEventListener('click', resetFortuneCard);

    // 礼盒
    dom.giftBox.addEventListener('click', openGiftBox);

    // 纪念册
    dom.nextWhisperBtn.addEventListener('click', showNextWhisper);
    dom.genWallpaperBtn.addEventListener('click', generateWallpaper);
}

// 辅助：Toast 提示
function showToast() {
    dom.wishToast.classList.remove('hidden');
    // 3秒后自动消失
    setTimeout(hideToast, 3000);
}

function hideToast() {
    dom.wishToast.classList.add('hidden');
}

// 背景粒子效果
function initCanvas() {
    const ctx = dom.bgCanvas.getContext('2d');
    let particles = [];
    
    function resize() {
        dom.bgCanvas.width = window.innerWidth;
        dom.bgCanvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * dom.bgCanvas.width;
            this.y = Math.random() * dom.bgCanvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > dom.bgCanvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > dom.bgCanvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(232, 208, 169, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, dom.bgCanvas.width, dom.bgCanvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// 核心逻辑：解锁
function handleUnlockInput() {
    const val = dom.unlockInput.value.trim();
    
    // 实时清除错误样式
    if (dom.unlockInput.classList.contains('error-shake')) {
        dom.unlockInput.classList.remove('error-shake');
        dom.errorMsg.classList.add('hidden');
    }

    // 解析输入
    // 假设格式为：[发送者]祝[接收者][祝福语]
    // 简单正则提取：(.*)祝(.*)(生日快乐.*)
    
    // 1. 完全匹配正确
    if (val === `${config.sender}祝${config.nickname}生日快乐`) {
        if (state.currentPage === 1) {
            playSound('unlock');
            createConfetti();
            dom.unlockInput.blur();
            dom.unlockInput.value = "开启祝福 ✨"; 
            dom.unlockInput.disabled = true;
            setTimeout(() => switchPage(2), 1500);
        }
        return;
    }

    // 2. 错误检测（仅在输入长度足够时才触发提示，避免输入过程中频繁报错）
    // 为了不打断输入，这里只做简单的 Enter 键检测或者失去焦点检测？
    // 但用户要求是“输入不是...就出现提示”，通常意味着实时或提交时。
    // 由于去掉了按钮，我们可以在用户停顿或回车时检测，或者简单地检测关键词缺失。
    
    // 这里采用回车检测逻辑 (在 bindEvents 中已绑定 keypress Enter -> handleUnlockInput, 但 input 事件也会触发)
    // 为了体验更好，我们在 input 事件中只做“正确解锁”，错误提示通过 keypress Enter 触发
}

// 单独处理回车键触发的错误提示
function checkErrorOnEnter() {
    const val = dom.unlockInput.value.trim();
    let errorType = null;

    if (!val.includes("祝")) {
        errorType = 'format';
    } else {
        const parts = val.split("祝");
        const inputSender = parts[0].trim();
        const rest = parts[1].trim();
        
        // 检查发送者
        if (inputSender !== config.sender) {
            errorType = 'sender';
        } 
        // 检查接收者
        else if (!rest.startsWith(config.nickname)) {
            errorType = 'recipient';
        }
        // 检查祝福语 (生日快乐)
        else if (!rest.includes("生日快乐")) {
            errorType = 'content';
        }
    }

    if (errorType) {
        showError(errorType);
    }
}

function showError(type) {
    const msgs = config.errors[type] || config.errors.format;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    
    playSound('piano'); 
    dom.unlockInput.classList.add('error-shake');
    dom.errorMsg.innerText = msg;
    dom.errorMsg.classList.remove('hidden');
    
    if (navigator.vibrate) navigator.vibrate(200);
    
    setTimeout(() => {
        dom.unlockInput.classList.remove('error-shake');
    }, 500);
}

// 仪式流程控制
function startCeremony() {
    dom.ceremonyLayer.classList.remove('hidden');
    resetCeremony();
}

function closeCeremony() {
    dom.ceremonyLayer.classList.add('hidden');
}

function resetCeremony() {
    ceremonyState = { litCount: 0, isDark: false, isWished: false, isBlown: false };
    dom.ceremonyLayer.classList.remove('lights-off');
    dom.candleNums.forEach(c => c.querySelector('.flame').classList.add('hidden'));
    dom.wishStage.classList.add('hidden');
    dom.grandFeedback.classList.add('hidden');
    dom.actionGuide.classList.remove('hidden');
    dom.actionGuide.innerText = "点击蜡烛点亮它们";
    dom.wishInputGrand.value = "";
}

function lightOneCandle(candleEl) {
    if (ceremonyState.isDark) return; // 关灯后不能再点
    
    const flame = candleEl.querySelector('.flame');
    if (flame.classList.contains('hidden')) {
        flame.classList.remove('hidden');
        playSound('piano'); // 点燃音效
        ceremonyState.litCount++;
        
        if (ceremonyState.litCount === 2) {
            setTimeout(turnOffLights, 800);
        }
    }
}

function turnOffLights() {
    ceremonyState.isDark = true;
    dom.ceremonyLayer.classList.add('lights-off');
    dom.actionGuide.innerText = "许个愿吧...";
    
    setTimeout(() => {
        dom.wishStage.classList.remove('hidden');
    }, 1000);
}

function confirmWish() {
    const wish = dom.wishInputGrand.value.trim();
    if (!wish) {
        alert("写下愿望会更灵验哦~");
        return;
    }
    
    ceremonyState.isWished = true;
    dom.wishStage.classList.add('hidden');
    dom.actionGuide.innerText = "现在，长按蜡烛吹灭它";
    dom.actionGuide.classList.remove('hidden'); // 确保显示
    
    // 绑定吹蜡烛事件 (长按任意地方或蜡烛)
    const layer = dom.ceremonyLayer;
    let blowTimer;
    
    const startBlow = (e) => {
        if (!ceremonyState.isWished || ceremonyState.isBlown) return;
        blowTimer = setTimeout(blowOutCeremony, 1500);
        // 可以加一些抖动效果
        dom.candleNums.forEach(c => c.querySelector('.flame').style.transform = "translateX(-50%) scale(1.2)");
    };
    
    const endBlow = () => {
        clearTimeout(blowTimer);
        dom.candleNums.forEach(c => c.querySelector('.flame').style.transform = "translateX(-50%) scale(1)");
    };
    
    layer.addEventListener('mousedown', startBlow);
    layer.addEventListener('touchstart', startBlow);
    window.addEventListener('mouseup', endBlow);
    window.addEventListener('touchend', endBlow);
}

function blowOutCeremony() {
    if (ceremonyState.isBlown) return;
    ceremonyState.isBlown = true;
    
    playSound('blow');
    dom.candleNums.forEach(c => c.querySelector('.flame').classList.add('hidden'));
    
    setTimeout(() => {
        dom.actionGuide.classList.add('hidden');
        dom.grandFeedback.classList.remove('hidden');
        createConfetti();
        playSound('cheer');
        
        setTimeout(() => {
             // 仪式结束，自动关闭或留给用户关闭
             // closeCeremony();
        }, 4000);
    }, 500);
}

function switchPage(index) {
    dom.pages.forEach(p => p.classList.remove('active'));
    setTimeout(() => {
        const target = document.getElementById(`page-${index}`);
        target.classList.add('active');
        state.currentPage = index;
        
        // 自动开启音乐 (如果未开启)
        if (!state.isMusicPlaying) toggleMusic();
    }, 600);
}

function renderCandles() {
    dom.candlesContainer.innerHTML = '';
    for (let i = 0; i < state.totalCandles; i++) {
        const c = document.createElement('div');
        c.className = 'candle';
        c.innerHTML = '<div class="flame"></div>';
        dom.candlesContainer.appendChild(c);
    }
}

function blowCandles() {
    if (state.candlesBlown >= state.totalCandles) return;
    playSound('blow');
    document.querySelectorAll('.candle').forEach(c => c.classList.add('off'));
    state.candlesBlown = state.totalCandles;
    createConfetti();
    
    // 愿望消失动画
    dom.wishContainer.classList.add('wish-fading');
    dom.blowInstruction.innerText = "愿望已许下...";
    
    setTimeout(() => {
        dom.wishContainer.style.display = 'none';
        dom.wishFeedback.classList.remove('hidden');
        playSound('cheer');
    }, 1500);
}

function flipFortuneCard() {
    if (dom.fortuneCard.classList.contains('flipped')) return;
    playSound('card');
    const randomF = config.fortunes[Math.floor(Math.random() * config.fortunes.length)];
    dom.fortuneText.innerText = randomF;
    dom.fortuneCard.classList.add('flipped');
}

function resetFortuneCard(e) {
    e.stopPropagation();
    dom.fortuneCard.classList.remove('flipped');
}

function openGiftBox() {
    if (state.isGiftOpen) return;
    state.isGiftOpen = true;
    dom.giftBox.classList.add('open');
    playSound('gift');
    
    setTimeout(() => {
        dom.wishesPanel.classList.remove('hidden');
        setTimeout(() => {
            dom.wishesPanel.classList.add('show');
            typeWish();
        }, 100);
    }, 1000);
}

function typeWish() {
    dom.wishTitle.innerText = config.shortWish;
    const text = config.longWish;
    let i = 0;
    dom.wishContent.innerHTML = '';
    
    const timer = setInterval(() => {
        if (i < text.length) {
            dom.wishContent.innerHTML += text[i] === '\n' ? '<br>' : text[i];
            i++;
        } else {
            clearInterval(timer);
        }
    }, 60);
}

function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let bday = new Date(`${currentYear}-${config.birthday}`);
    if (now > bday) bday.setFullYear(currentYear + 1);
    
    const diff = Math.ceil((bday - now) / (1000 * 60 * 60 * 24));
    dom.cdDays.innerText = diff.toString().padStart(3, '0');
}

function showNextWhisper() {
    const randomW = config.secrets[Math.floor(Math.random() * config.secrets.length)];
    dom.whisperText.style.opacity = 0;
    setTimeout(() => {
        dom.whisperText.innerText = randomW;
        dom.whisperText.style.opacity = 1;
    }, 300);
}

// 简单的壁纸生成 (Canvas)
function generateWallpaper() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    
    // 绘制奶油色背景
    ctx.fillStyle = '#F9F7F5';
    ctx.fillRect(0, 0, 400, 700);
    
    // 装饰圆
    ctx.fillStyle = '#F8E8EE';
    ctx.beginPath();
    ctx.arc(200, 250, 150, 0, Math.PI * 2);
    ctx.fill();
    
    // 文字
    ctx.fillStyle = '#5D4D4A';
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px "ZCOOL XiaoWei"';
    ctx.fillText(config.nickname, 200, 450);
    ctx.font = '20px "Noto Sans SC"';
    ctx.fillText("Happy Birthday", 200, 490);
    
    const container = document.getElementById('wallpaper-canvas-container');
    container.innerHTML = '';
    const img = new Image();
    img.src = canvas.toDataURL();
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    container.appendChild(img);
    
    alert("壁纸已更新！可以长按保存图片哦~");
}

// 辅助功能
function toggleMusic() {
    if (state.isMusicPlaying) {
        dom.bgMusic.pause();
        dom.musicControl.classList.remove('playing');
    } else {
        dom.bgMusic.play();
        dom.musicControl.classList.add('playing');
    }
    state.isMusicPlaying = !state.isMusicPlaying;
}

function playSound(name) {
    const s = dom.sounds[name];
    if (s) {
        s.currentTime = 0;
        s.play().catch(e => console.log('音效播放受限'));
    }
}

function createConfetti() {
    for (let i = 0; i < 40; i++) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.left = Math.random() * 100 + 'vw';
        div.style.top = '-10px';
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.backgroundColor = ['#E8D0A9', '#F8E8EE', '#D4AF37', '#FFC0CB'][Math.floor(Math.random() * 4)];
        div.style.borderRadius = '50%';
        div.style.zIndex = '9999';
        div.style.pointerEvents = 'none';
        document.body.appendChild(div);
        
        const animation = div.animate([
            { transform: `translateY(0) rotate(0)`, opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => div.remove();
    }
}
