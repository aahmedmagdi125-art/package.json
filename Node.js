// server.js
const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 8080;
const POOL_HOST = 'pool.supportxmr.com'; // أو أي Pool تختاره
const POOL_PORT = 3333;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`WebSocket Proxy شغال على البورت ${PORT}`);
});

wss.on('connection', (ws) => {
    // فتح اتصال TCP مباشر مع الـ Monero Pool
    const poolSocket = new net.Socket();

    poolSocket.connect(POOL_PORT, POOL_HOST, () => {
        console.log('تم الاتصال بالـ Pool بنجاح');
    });

    // تمرير البيانات من المتصفح إلى الـ Pool
    ws.on('message', (data) => {
        poolSocket.write(data);
    });

    // تمرير رد الـ Pool إلى المتصفح
    poolSocket.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => poolSocket.end());
    poolSocket.on('close', () => ws.close());
    poolSocket.on('error', (err) => console.error('Pool Error:', err.message));
});
