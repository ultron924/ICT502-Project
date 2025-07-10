<template>
  <div id="app">
    <header>
      <!-- Show Login button only if NOT on login page AND NOT logged in -->
      <button v-if="showLoginButton" @click="goToLogin">Login</button>
    </header>

    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
    showLoginButton() {
      const path = this.$route.path;
      const isLoggedIn = !!localStorage.getItem('staff');
      return path !== '/login' && !isLoggedIn;
    }
  },
  watch: {
    '$route.path'() {
      // force refresh when route changes so button visibility updates
      this.$forceUpdate();
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>