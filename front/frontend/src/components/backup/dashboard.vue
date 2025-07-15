<template>
  <div class="dashboard">
    <div class="top-bar">
      <span v-if="staff">👤 {{ staff.staffName }} ({{ staff.staffType === 'F' ? 'Full-time' : 'Part-time' }})</span>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>

    <h1>AMZ Chicken Staff Management</h1>

    <div class="dashboard-grid">
      <StaffList />
      <OrderManagement />
      <InventoryManagement />
    </div>
  </div>
</template>

<script>
import StaffList from './StaffList.vue';
import OrderManagement from './OrderManagement.vue';
import InventoryManagement from './InventoryManagement.vue';

export default {
  components: {
    StaffList,
    OrderManagement,
    InventoryManagement
  },
  data() {
    return {
      staff: null
    };
  },
  mounted() {
    const savedStaff = localStorage.getItem('staff');
    if (savedStaff) {
      this.staff = JSON.parse(savedStaff);
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('staff');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #6b3232;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.logout-btn {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.logout-btn:hover {
  background-color: #c9302c;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

h1 {
  color: #6b3232;
  margin-bottom: 20px;
  text-align: center;
}
</style>