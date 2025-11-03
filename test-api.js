const BASE_URL = 'http://localhost:3000';

let token1 = '';
let token2 = '';
let enquiryId = '';

async function testAPI(method, endpoint, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { status: 'error', data: { error: error.message } };
  }
}

async function runTests() {
  console.log('\n=== CRM SYSTEM API TESTS ===\n');

  console.log('1. Testing Employee Registration (Employee 1)...');
  const register1 = await testAPI('POST', '/api/employee/register', {
    name: 'John Counselor',
    email: 'john@example.com',
    password: 'password123'
  });
  console.log(`   Status: ${register1.status}`);
  console.log('   Response:', JSON.stringify(register1.data, null, 2));
  if (register1.data.token) token1 = register1.data.token;

  console.log('\n2. Testing Employee Registration (Employee 2)...');
  const register2 = await testAPI('POST', '/api/employee/register', {
    name: 'Sarah Counselor',
    email: 'sarah@example.com',
    password: 'password456'
  });
  console.log(`   Status: ${register2.status}`);
  console.log('   Response:', JSON.stringify(register2.data, null, 2));
  if (register2.data.token) token2 = register2.data.token;

  console.log('\n3. Testing Employee Login...');
  const login = await testAPI('POST', '/api/employee/login', {
    email: 'john@example.com',
    password: 'password123'
  });
  console.log(`   Status: ${login.status}`);
  console.log('   Response:', JSON.stringify(login.data, null, 2));

  console.log('\n4. Testing Public Enquiry Submission (No Auth)...');
  const enquiry1 = await testAPI('POST', '/api/enquiry/submit', {
    name: 'Alice Student',
    email: 'alice@student.com',
    phone: '1234567890',
    courseInterest: 'Web Development',
    message: 'I am interested in learning web development'
  });
  console.log(`   Status: ${enquiry1.status}`);
  console.log('   Response:', JSON.stringify(enquiry1.data, null, 2));
  if (enquiry1.data.enquiry) enquiryId = enquiry1.data.enquiry.id;

  console.log('\n5. Testing Another Public Enquiry Submission...');
  const enquiry2 = await testAPI('POST', '/api/enquiry/submit', {
    name: 'Bob Student',
    email: 'bob@student.com',
    phone: '0987654321',
    courseInterest: 'Data Science',
    message: 'Looking to learn data science'
  });
  console.log(`   Status: ${enquiry2.status}`);
  console.log('   Response:', JSON.stringify(enquiry2.data, null, 2));

  console.log('\n6. Testing Third Public Enquiry Submission...');
  const enquiry3 = await testAPI('POST', '/api/enquiry/submit', {
    name: 'Charlie Student',
    email: 'charlie@student.com',
    phone: '5555555555',
    courseInterest: 'Mobile App Development',
    message: 'Interested in iOS and Android development'
  });
  console.log(`   Status: ${enquiry3.status}`);
  console.log('   Response:', JSON.stringify(enquiry3.data, null, 2));

  console.log('\n7. Testing Fetch Unclaimed Enquiries (Employee 1)...');
  const unclaimed1 = await testAPI('GET', '/api/enquiry/unclaimed', null, token1);
  console.log(`   Status: ${unclaimed1.status}`);
  console.log('   Response:', JSON.stringify(unclaimed1.data, null, 2));

  console.log('\n8. Testing Claim Enquiry (Employee 1 claims first enquiry)...');
  const claim1 = await testAPI('POST', `/api/enquiry/claim/${enquiryId}`, {}, token1);
  console.log(`   Status: ${claim1.status}`);
  console.log('   Response:', JSON.stringify(claim1.data, null, 2));

  console.log('\n9. Testing Fetch Unclaimed Enquiries Again (should have one less)...');
  const unclaimed2 = await testAPI('GET', '/api/enquiry/unclaimed', null, token1);
  console.log(`   Status: ${unclaimed2.status}`);
  console.log('   Response:', JSON.stringify(unclaimed2.data, null, 2));

  console.log('\n10. Testing Fetch Claimed Enquiries by Employee 1...');
  const claimed1 = await testAPI('GET', '/api/enquiry/claimed', null, token1);
  console.log(`   Status: ${claimed1.status}`);
  console.log('   Response:', JSON.stringify(claimed1.data, null, 2));

  console.log('\n11. Testing Fetch Claimed Enquiries by Employee 2 (should be empty)...');
  const claimed2 = await testAPI('GET', '/api/enquiry/claimed', null, token2);
  console.log(`   Status: ${claimed2.status}`);
  console.log('   Response:', JSON.stringify(claimed2.data, null, 2));

  console.log('\n12. Testing Duplicate Claim (Employee 2 tries to claim same enquiry)...');
  const duplicateClaim = await testAPI('POST', `/api/enquiry/claim/${enquiryId}`, {}, token2);
  console.log(`   Status: ${duplicateClaim.status}`);
  console.log('   Response:', JSON.stringify(duplicateClaim.data, null, 2));

  console.log('\n13. Testing Unauthorized Access (No Token)...');
  const unauthorized = await testAPI('GET', '/api/enquiry/unclaimed', null, null);
  console.log(`   Status: ${unauthorized.status}`);
  console.log('   Response:', JSON.stringify(unauthorized.data, null, 2));

  console.log('\n=== ALL TESTS COMPLETED ===\n');
}

runTests();
