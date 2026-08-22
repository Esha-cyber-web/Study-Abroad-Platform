import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },    // Ramp up to 100 users
    { duration: '3m', target: 500 },    // Ramp up to 500 users
    { duration: '3m', target: 1000 },   // Ramp up to 1000 users
    { duration: '5m', target: 1000 },   // Stay at 1000 users
    { duration: '2m', target: 0 },      // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% requests under 500ms
    http_req_failed: ['rate<0.05'],                   // Error rate < 5%
  },
};

const BASE_URL = 'http://localhost:5000/api';
let jwtToken = '';

export default function () {
  group('🔐 Authentication Tests', () => {
    // 1. Register User
    const registerRes = http.post(`${BASE_URL}/auth/register`, 
      JSON.stringify({
        email: `user${Math.random()}@test.com`,
        password: 'TestPass123!',
        name: 'Load Test User',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(registerRes, {
      'Register status is 200': (r) => r.status === 200,
      'Register returns user': (r) => r.json('success') === true,
    });

    // 2. Login
    const loginRes = http.post(`${BASE_URL}/auth/login`,
      JSON.stringify({
        email: `user${Math.random()}@test.com`,
        password: 'TestPass123!',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(loginRes, {
      'Login status is 200': (r) => r.status === 200,
      'Login returns JWT token': (r) => r.json('token') !== undefined,
    });

    if (loginRes.status === 200) {
      jwtToken = loginRes.json('token');
    }

    sleep(1);
  });

  group('🎓 University Search Tests', () => {
    // 3. Get Universities with Filters
    const uniRes = http.get(
      `${BASE_URL}/universities?country=USA&minPrice=10000&maxPrice=50000&page=1&limit=10`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(uniRes, {
      'Universities GET status is 200': (r) => r.status === 200,
      'Universities returns data': (r) => r.json('data') !== undefined,
      'Pagination working': (r) => r.json('pages') !== undefined,
    });

    sleep(2);
  });

  group('📝 Application Tests', () => {
    if (jwtToken) {
      // 4. Submit Application
      const appRes = http.post(`${BASE_URL}/applications`,
        JSON.stringify({
          universityId: '507f1f77bcf86cd799439011',
          program: 'Computer Science',
          statement: 'I am interested in this program',
          documents: [],
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          } 
        }
      );

      check(appRes, {
        'Application POST status is 200': (r) => r.status === 200,
        'Application saved': (r) => r.json('success') === true,
      });

      sleep(1);
    }
  });

  group('🤖 AI Features Tests', () => {
    if (jwtToken) {
      // 5. AI Chat
      const chatRes = http.post(`${BASE_URL}/ai/chat`,
        JSON.stringify({
          messages: [
            { role: 'user', content: 'What are top universities for CS?' }
          ],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          }
        }
      );

      check(chatRes, {
        'Chat status is 200': (r) => r.status === 200,
        'Chat returns response': (r) => r.json('reply') !== undefined,
      });

      sleep(2);
    }
  });

  sleep(2);
}
