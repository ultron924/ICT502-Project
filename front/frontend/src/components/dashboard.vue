<template>
  <div class="dashboard">
    <!-- Top Bar -->
    <div class="top-bar">
      <button class="menu-btn" @click="toggleSidebar">☰</button>
      <span v-if="staff">👤 {{ staff.staffName }} ({{ staff.staffType === 'F' ? 'Full-time' : 'Part-time' }})</span>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>

    <h1>AMZ Chicken Staff Management</h1>

    <!-- Sidebar Overlay -->
    <div v-if="sidebarOpen" class="overlay" @click="closeSidebar"></div>

    <!-- Sidebar Drawer -->
    <div :class="['sidebar-drawer', { open: sidebarOpen }]">
      <ul>
        <li @click="openComponent('StaffList')">Staff List</li>
        <li @click="openComponent('OrderManagement')">Order Management</li>
        <li @click="openComponent('InventoryManagement')">Inventory Management</li>
        <li @click="logout" style="color: red">Logout</li>
      </ul>
    </div>

    <!-- Dashboard Components (still visible) -->
    <div class="dashboard-grid">
      <StaffList />
      <OrderManagement />
      <InventoryManagement />
    </div>

    <!-- Popup Modal View -->
    <div v-if="showPopup" class="modal">
      <div class="modal-content large">
        <span class="close" @click="closePopup">&times;</span>
        <component :is="activeComponent" />
      </div>
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
      staff: null,
      sidebarOpen: false,
      showPopup: false,
      activeComponent: null
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
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
    openComponent(componentName) {
      this.activeComponent = componentName;
      this.showPopup = true;
      this.closeSidebar();
    },
    closePopup() {
      this.showPopup = false;
      this.activeComponent = null;
    }
  }
};
</script>

<style scoped>
.dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

/* Top Bar */
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

.menu-btn {
  font-size: 24px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
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

h1 {
  text-align: center;
  color: #6b3232;
  margin-bottom: 20px;
}

/* Sidebar Drawer */
.sidebar-drawer {
  position: fixed;
  top: 0;
  left: -250px;
  height: 100%;
  width: 250px;
  background-color: #ce9696;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  padding: 30px 20px;
  transition: left 0.3s ease;
  z-index: 2000;
}

.sidebar-drawer.open {
  left: 0;
}

.sidebar-drawer ul {
  list-style: none;
  padding: 0;
}

.sidebar-drawer li {
  padding: 12px 0;
  font-size: 18px;
  cursor: pointer;
  color: #333;
  transition: color 0.2s;
}

.sidebar-drawer li:hover {
  color: #6b3232;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1500;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Popup Modal */
.modal {
  position: fixed;
  z-index: 3000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content.large {
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
  background: rgb(122, 16, 16);
  padding: 6px;
  border-radius: 10px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}
</style>
