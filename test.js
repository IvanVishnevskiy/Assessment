const axios = require('axios');
const http = require('http');

let errNum = 0;
const processingTimes = [];

const urls = Array.from({length: 10000}, () => `http://localhost:3000/api/users/1/changeBalance`);

(async () => {
  const promises = urls.map((url, i) => new Promise(async (resolve, reject) => {
    console.log(i)
    // 10000 concurrent requests hang the thread, so we add a delay
    await new Promise(resolve => setTimeout(resolve, i))
    let startTime = performance.now();
    const res = await new Promise((resolve, reject) => {
      const req = http.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }}, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.write(JSON.stringify({ amount: -2 }));
      req.end();
      req.on('error', reject);
    });
    processingTimes.push(performance.now() - startTime);
    console.log(i, res)
    if (res.error) {
      console.log(res.error);
      return reject(res.error);
    }
    resolve();
  }));
  const results = await Promise.allSettled(promises);
  for (const result of results) {
    if (result.status === 'rejected') errNum++;
  }
  console.log(`Errors returned: ${errNum}. Average processing time: ${(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length).toFixed(2)}ms`);
})();
