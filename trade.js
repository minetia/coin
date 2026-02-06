const urlParams = new URLSearchParams(window.location.search);
const coin = urlParams.get('coin') || 'BTC';
let wallet = JSON.parse(localStorage.getItem('vWallet')) || { krw: 100000000, coins: {} };
let aiWallet = JSON.parse(localStorage.getItem('aiWallet')) || { krw: 50000000, coins: {} };
let currentType = 'MAIN';
let curP = 0;

document.getElementById('coinTitle').innerText = coin;

function switchWallet(type) {
    currentType = type;
    document.getElementById('tabMain').classList.toggle('active', type === 'MAIN');
    document.getElementById('tabAI').classList.toggle('active', type === 'AI');
    document.getElementById('walletLabel').innerText = type === 'MAIN' ? '일반 잔액' : 'AI 잔액';
    updateUI();
}

function syncFromAmount() {
    const p = parseFloat(document.getElementById('mPrice').value);
    const amt = parseFloat(document.getElementById('mAmount').value);
    if (p > 0 && amt > 0) document.getElementById('mQty').value = (amt / p).toFixed(8);
}

function syncFromQty() {
    const p = parseFloat(document.getElementById('mPrice').value);
    const q = parseFloat(document.getElementById('mQty').value);
    if (p > 0 && q > 0) document.getElementById('mAmount').value = Math.floor(p * q);
}

async function update() {
    try {
        const res = await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${coin}`);
        curP = res.data[0].trade_price;
        document.getElementById('livePrice').innerText = curP.toLocaleString() + " ₩";
        if(!document.getElementById('mPrice').value) document.getElementById('mPrice').value = curP;
        updateUI();
    } catch(e) {}
}

function updateUI() {
    const w = currentType === 'MAIN' ? wallet : aiWallet;
    document.getElementById('displayKrw').innerText = Math.floor(w.krw).toLocaleString() + " ₩";
    localStorage.setItem('vWallet', JSON.stringify(wallet));
    localStorage.setItem('aiWallet', JSON.stringify(aiWallet));
}

function startAi() {
    const log = document.getElementById('aiLog');
    log.innerHTML = `<div>[${new Date().toLocaleTimeString()}] AI 분석 중... 매수 타점 탐색.</div>` + log.innerHTML;
}

new TradingView.widget({
    "autosize": true, "symbol": "UPBIT:"+coin+"KRW", "interval": "15", "theme": "dark", "container_id": "tv_chart", "locale": "ko"
});
update();
setInterval(update, 2000);