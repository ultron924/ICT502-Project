<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <h1>AMZ Chicken</h1>
      </div>
      
      <h2>Staff Login</h2>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="staffID">Staff ID</label>
          <input 
            id="staffID"
            v-model="staffID" 
            type="text" 
            required
            placeholder="Enter your staff ID"
          >
        </div>
        
        <div class="form-group">
          <label for="staffContact">Contact Number</label>
          <input 
            id="staffContact"
            v-model="staffContact" 
            type="text" 
            required
            placeholder="Enter your contact number"
          >
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="!loading">Login</span>
          <span v-else class="loading-spinner"></span>
        </button>
        
        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      staffID: '',
      staffContact: '',
      error: '',
      loading: false
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = '';
      
      try {
        // Convert staffID to number if your backend expects it
        const staffID = Number(this.staffID);
        
        const response = await axios.post('http://localhost:3001/api/login', {
          staffID: staffID,
          staffContact: this.staffContact
        });

        if (response.data.success) {
          localStorage.setItem('staff', JSON.stringify(response.data.staff));
          
          this.$router.push('/dashboard');
        } else {
          this.error = response.data.message || 'Login failed. Please check your credentials.';
        }
      } catch (err) {
        console.error('Login error:', err);
        if (err.response && err.response.status === 401) {
          this.error = 'Invalid staff ID or contact number';
        } else {
          this.error = 'Login failed. Please try again later.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  background-image: linear-gradient(to bottom right, #f27d7d, #6b3232);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 10px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logo {
  margin-bottom: 30px;
}

.logo h1 {
  color: #6b3232;
  font-size: 28px;
  font-weight: bold;
}

h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 22px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #6b3232;
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 50, 50, 0.1);
}

.login-btn {
  background-color: #6b3232;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  background-color: #5a2828;
}

.login-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #d32f2f;
  background-color: #fdecea;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-message i {
  font-size: 16px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  input, .login-btn {
    padding: 10px 12px;
  }
}
</style>