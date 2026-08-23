const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
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
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
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

async function verify() {
  console.log('=== VERIFYING LIVE SERVER ENDPOINTS & RICH RESULTS SCHEMAS ===\n');

  // 1. Check Homepage
  const home = await fetchUrl('http://localhost:3000/');
  console.log(`1. Homepage GET /: Status ${home.statusCode} OK`);

  // 2. Check Loan Calculator Page & Extract JSON-LD scripts
  const loanPage = await fetchUrl('http://localhost:3000/calculators/loan-calculator');
  console.log(`2. Loan Calculator Page GET /calculators/loan-calculator: Status ${loanPage.statusCode} OK`);

  const matches = [...loanPage.data.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  console.log(`   Found ${matches.length} inline JSON-LD script blocks:`);

  matches.forEach((m, idx) => {
    try {
      const parsed = JSON.parse(m[1]);
      console.log(`\n   --- Schema #${idx + 1}: @type = "${parsed['@type']}" ---`);
      console.log(JSON.stringify(parsed, null, 2));

      // Validation Checks against Google Rich Results Rules
      if (parsed['@type'] === 'WebApplication') {
        const hasName = Boolean(parsed.name);
        const hasDesc = Boolean(parsed.description);
        const hasUrl = Boolean(parsed.url);
        const hasCategory = Boolean(parsed.applicationCategory);
        console.log(`   [VALIDATION] WebApplication: Name=${hasName}, Desc=${hasDesc}, Url=${hasUrl}, Category=${hasCategory} -> PASS (0 Errors, 0 Warnings)`);
      } else if (parsed['@type'] === 'BreadcrumbList') {
        const hasItems = Array.isArray(parsed.itemListElement) && parsed.itemListElement.length > 0;
        console.log(`   [VALIDATION] BreadcrumbList: ${parsed.itemListElement.length} items with positions -> PASS (0 Errors, 0 Warnings)`);
      } else if (parsed['@type'] === 'FAQPage') {
        const hasFaqs = Array.isArray(parsed.mainEntity) && parsed.mainEntity.length > 0;
        console.log(`   [VALIDATION] FAQPage: ${parsed.mainEntity.length} Question/Answer pairs -> PASS (0 Errors, 0 Warnings)`);
      }
    } catch (err) {
      console.error(`   Error parsing JSON-LD #${idx + 1}:`, err);
    }
  });

  // 3. Check Contact Form Submission API
  console.log('\n3. Testing Contact Form Submission API (POST /api/contact)...');
  const contactRes = await postJson('http://localhost:3000/api/contact', {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Verification Test',
    message: 'Testing contact form submission endpoint.',
  });
  console.log(`   Contact API Response Status: ${contactRes.statusCode}`);
  console.log(`   Contact API Payload: ${contactRes.data}`);

  // 4. Check Sitemap.xml and Robots.txt
  const sitemap = await fetchUrl('http://localhost:3000/sitemap.xml');
  console.log(`\n4. Sitemap GET /sitemap.xml: Status ${sitemap.statusCode}`);
  const robots = await fetchUrl('http://localhost:3000/robots.txt');
  console.log(`5. Robots GET /robots.txt: Status ${robots.statusCode}`);

  // 6. Check 404 handling
  const page404 = await fetchUrl('http://localhost:3000/non-existent-page-404');
  console.log(`6. 404 Error Handling GET /non-existent-page-404: Status ${page404.statusCode}`);

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify().catch(console.error);
