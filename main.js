let currentMarket = 'DOMESTIC';
let allCoins = [];

// 시장 전환 함수
async function switchMarket(market) {
    currentMarket = market;
    
    // 버튼 활성화 스타일 변경
    document.getElementById('tabKrw').classList.toggle('active', market === 'DOMESTIC');
    document.getElementById('tabUsdt').classList.toggle('active', market === 'OVERSEAS');
    
    // 리스트 초기화 후 데이터 다시 호출
    document.getElementById('coinList').innerHTML = '<div style="text-align:center; padding:20px;">데이터 로딩 중...</div>';
    await fetchMarketData();
}

async function fetchMarketData() {
    try {
        let data = [];
        if (currentMarket === 'DOMESTIC') {
            // 업비트 API 호출 (국내)
            const res = await axios.get('https://api.upbit.com/v1/market/all');
            const krwMarkets = res.data.filter(m => m.market.startsWith('KRW-')).map(m => m.market);
            const tickerRes = await axios.get(`https://api.upbit.com/v1/ticker?markets=${krwMarkets.join(',')}`);
            
            data = tickerRes.data.map(t => ({
                s: t.market.replace('KRW-', ''),
                p: t.trade_price,
                c: (t.signed_change_rate * 100).toFixed(2),
                v: t.acc_trade_price_24h,
                cur: '₩'
            }));
        } else {
            // 바이낸스 API 호출 (해외)
            // USDT 마켓 상위 100개 기준
            const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
            data = res.data
                .filter(t => t.symbol.endsWith('USDT'))
                .slice(0, 100)
                .map(t => ({
                    s: t.symbol.replace('USDT', ''),
                    p: parseFloat(t.lastPrice),
                    c: parseFloat(t.priceChangePercent).toFixed(2),
                    v: parseFloat(t.quoteVolume),
                    cur: '$'
                }));
        }

        // 거래대금 순 정렬
        data.sort((a, b) => b.v - a.v);
        allCoins = data;
        renderList(allCoins);
    } catch (e) {
        console.error("데이터 호출 오류:", e);
        document.getElementById('coinList').innerHTML = '<div style="color:#ef4444; text-align:center; padding:20px;">데이터를 불러올 수 없습니다.</div>';
    }
}

function renderList(data) {
    const listContainer = document.getElementById('coinList');
    if (data.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px;">검색 결과가 없습니다.</div>';
        return;
    }

    listContainer.innerHTML = data.map((i, idx) => `
        <a href="modal.html?coin=${i.s}" class="panel" style="display:flex; align-items:center; text-decoration:none; color:inherit; padding:15px; margin-bottom:8px;">
            <span style="width:35px; font-size:0.8rem; color:var(--text-sub); font-weight:700;">${idx + 1}</span>
            <div style="flex:1;">
                <b style="font-size:1.1rem;">${i.s}</b>
                <div style="font-size:0.7rem; color:var(--text-sub);">${currentMarket === 'DOMESTIC' ? 'Upbit' : 'Binance'}</div>
            </div>
            <div style="flex:1.5; text-align:right;">
                <div style="font-weight:800;">${i.cur}${i.p.toLocaleString()}</div>
            </div>
            <div style="flex:1; text-align:right; color:${i.c >= 0 ? 'var(--up-color)' : 'var(--down-color)'}; font-weight:800;">
                ${i.c >= 0 ? '+' : ''}${i.c}%
            </div>
        </a>
    `).join('');
}

// 최초 로드
fetchMarketData();
// 5초마다 실시간 갱신 (해외 데이터가 많으므로 주기를 조금 늘림)
setInterval(fetchMarketData, 5000);