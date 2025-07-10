<template>
  <div class="login">
    <h2>Staff Login</h2>
    <form @submit.prevent="login">
      <label>Staff ID:</label>
      <input v-model="staffID" required />

      <label>Password:</label>
      <input v-model="staffContact" required />

      <button type="submit">Login</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      staffID: '',
      staffContact: '',
      error: ''
    };
  },
methods: {
  async login() {
    try {
      const res = await axios.post('http://localhost:3001/api/login', {
        staffID: this.staffID,
        staffContact: this.staffContact
      });

      localStorage.setItem('staff', JSON.stringify(res.data.staff));

      // ✅ Show success message
      alert('Login successful!');

      // ✅ Redirect to dashboard
      this.$router.push('/dashboard');
    } catch (err) {
      this.error = 'Login failed. Please check your credentials.';
    }
  }
}
};
</script>