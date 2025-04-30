const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

async function testAuthAPI() {
  try {
    console.log('📡 Đang kiểm tra API xác thực...');
    
    // Test đăng ký
    console.log('\n1. Test đăng ký người dùng mới');
    const registerData = {
      username: 'apitest',
      password: 'Password123',
      fullName: 'API Test User',
      email: 'apitest@example.com',
      role: 'student',
    };
    
    try {
      const registerResponse = await axios.post(`${API_URL}/users/register`, registerData);
      console.log(`✅ Đăng ký thành công với status: ${registerResponse.status}`);
      console.log('User ID:', registerResponse.data.data.id);
    } catch (error) {
      console.error(`❌ Lỗi đăng ký: ${error.response?.status} - ${error.response?.data.message || error.message}`);
    }
    
    // Test đăng nhập
    console.log('\n2. Test đăng nhập');
    try {
      const loginResponse = await axios.post(`${API_URL}/users/login`, {
        username: 'apitest',
        password: 'Password123'
      });
      
      authToken = loginResponse.data.data.token;
      console.log(`✅ Đăng nhập thành công với status: ${loginResponse.status}`);
      console.log('Token:', authToken.substring(0, 15) + '...');
    } catch (error) {
      console.error(`❌ Lỗi đăng nhập: ${error.response?.status} - ${error.response?.data.message || error.message}`);
    }
    
    // Test lấy profile
    if (authToken) {
      console.log('\n3. Test lấy profile người dùng');
      try {
        const profileResponse = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        console.log(`✅ Lấy profile thành công với status: ${profileResponse.status}`);
        console.log('Profile:', profileResponse.data.data);
      } catch (error) {
        console.error(`❌ Lỗi lấy profile: ${error.response?.status} - ${error.response?.data.message || error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi không xác định:', error);
  }
}

testAuthAPI();