<template>
  <div class="dashboard">
    <div class="top-bar">
      <span v-if="staff">👤 Currently logged in: <strong>{{ staff.STAFFNAME }}</strong></span>
      <button @click="logout">Logout</button>
    </div>

    <h1>📦 AMZ Chicken Staff Dashboard</h1>

    <div class="dashboard-sections">
      <OrderTable />
      <CreateOrder />
      <PurchaseStock />
      <AddPeople />
    </div>
  </div>
</template>

<script>
import CreateOrder from './CreateOrder.vue';
import PurchaseStock from './PurchaseStock.vue';
import OrderTable from './OrderTable.vue';
import AddPeople from './AddPeople.vue';

export default {
  components: {
    CreateOrder,
    PurchaseStock,
    OrderTable,
    AddPeople
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
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}
.dashboard-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #6b3232;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.top-bar button {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.top-bar button:hover {
  background-color: #c9302c;
}
</style>