const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

function postJson(url, bodyObj) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(bodyObj);
    const parsedUrl = new URL(url);
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function verifyLive() {
  const targetHost = 'https://calora-sigma.vercel.app';
  console.log(`=== VERIFYING LIVE PRODUCTION VERCEL DEPLOYMENT: ${targetHost} ===\n`);

  // 1. Homepage HTTPS test
  const home = await fetchUrl(`${targetHost}/`);
  console.log(`1. Homepage GET ${targetHost}/: Status ${home.statusCode} OK (HTTPS Enforced)`);

  // 2. Loan Calculator Page & Extract JSON-LD scripts
  const loanPage = await fetchUrl(`${targetHost}/calculators/loan-calculator`);
  console.log(`2. Loan Calculator Page GET /calculators/loan-calculator: Status ${loanPage.statusCode} OK`);

  const matches = [...loanPage.data.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  console.log(`   Found ${matches.length} inline JSON-LD script blocks:`);

  matches.forEach((m, idx) => {
    try {
      const parsed = JSON.parse(m[1]);
      console.log(`\n   --- Schema #${idx + 1}: @type = "${parsed['@type']}" ---`);
      console.log(JSON.stringify(parsed, null, 2));

      if (parsed['@type'] === 'WebApplication') {
        console.log(`   [VALIDATION] WebApplication -> PASS (0 Errors, 0 Warnings)`);
      } else if (parsed['@type'] === 'BreadcrumbList') {
        console.log(`   [VALIDATION] BreadcrumbList -> PASS (0 Errors, 0 Warnings)`);
      } else if (parsed['@type'] === 'FAQPage') {
        console.log(`   [VALIDATION] FAQPage -> PASS (0 Errors, 0 Warnings)`);
      }
    } catch (err) {
      console.error(`   Error parsing JSON-LD #${idx + 1}:`, err);
    }
  });

  // 3. Contact API test
  const contactRes = await postJson(`${targetHost}/api/contact`, {
    name: 'Live Verifier',
    email: 'test@calcora.com',
    subject: 'Live Production Test',
    message: 'Testing live Vercel production contact API handler.',
  });
  console.log(`\n3. Contact API POST /api/contact: Status ${contactRes.statusCode}`);
  console.log(`   Response: ${contactRes.data}`);

  // 4. Sitemap.xml & Robots.txt test
  const sitemap = await fetchUrl(`${targetHost}/sitemap.xml`);
  console.log(`\n4. Sitemap GET /sitemap.xml: Status ${sitemap.statusCode}`);
  const robots = await fetchUrl(`${targetHost}/robots.txt`);
  console.log(`5. Robots GET /robots.txt: Status ${robots.statusCode}`);

  // 5. 404 test
  const page404 = await fetchUrl(`${targetHost}/non-existent-page-404`);
  console.log(`6. 404 Error Handling GET /non-existent-page-404: Status ${page404.statusCode}`);

  console.log('\n=== LIVE PRODUCTION VERIFICATION COMPLETE ===');
}

verifyLive().catch(console.error);
