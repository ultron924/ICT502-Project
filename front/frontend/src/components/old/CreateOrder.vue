<template>
  <div class="order-card">
    <h2>Order Management</h2>
    
    <div class="tabs">
      <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
        Customer Orders
      </button>
      <button :class="{ active: activeTab === 'create' }" @click="activeTab = 'create'">
        Create Order
      </button>
    </div>

    <div v-if="activeTab === 'orders'" class="orders-section">
      <div class="filters">
        <input v-model="orderFilter" placeholder="Filter by customer..." class="filter-input">
        <input type="date" v-model="dateFilter" class="date-input">
      </div>

      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Product</th>
            <th>Qty (kg)</th>
            <th>Subtotal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="`${order.ORDERID}-${order.PRODUCTID}`">
            <td>{{ order.ORDERID }}</td>
            <td>{{ order.CUSTNAME }}</td>
            <td>{{ formatDate(order.ORDERDATE) }}</td>
            <td>{{ order.PRODUCTNAME }}</td>
            <td>{{ order.QUANTITY }}</td>
            <td>RM{{ order.SUBTOTAL }}</td>
            <td>
              <button @click="editOrder(order)" class="action-btn edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmDelete(order.ORDERID)" class="action-btn delete">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="create-order-section">
      <form @submit.prevent="submitOrder">
        <div class="form-group">
          <label>Customer:</label>
          <select v-model="newOrder.custID" required>
            <option v-for="customer in customers" :key="customer.CUSTID" :value="customer.CUSTID">
              {{ customer.CUSTNAME }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Product:</label>
          <select v-model="newOrder.productID" required>
            <option v-for="product in products" :key="product.PRODUCTID" :value="product.PRODUCTID">
              {{ product.PRODUCTNAME }} (RM{{ product.PRICEKG }}/kg)
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Quantity (kg):</label>
          <input type="number" v-model.number="newOrder.quantity" min="1" required>
        </div>
        
        <button type="submit" class="submit-btn">Place Order</button>
      </form>
      
      <p v-if="orderMessage" class="message">{{ orderMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeTab: 'orders',
      orders: [],
      customers: [],
      products: [],
      orderFilter: '',
      dateFilter: '',
      newOrder: {
        custID: '',
        productID: '',
        quantity: 1
      },
      orderMessage: ''
    };
  },
  async mounted() {
    await this.fetchData();
  },
  computed: {
    filteredOrders() {
      return this.orders.filter(order => {
        const matchesCustomer = order.CUSTNAME.toLowerCase().includes(this.orderFilter.toLowerCase());
        const matchesDate = !this.dateFilter || 
                          new Date(order.ORDERDATE).toISOString().slice(0,10) === this.dateFilter;
        return matchesCustomer && matchesDate;
      });
    }
  },
  methods: {
    async fetchData() {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/orders'),
          axios.get('http://localhost:3001/api/customer'),
          axios.get('http://localhost:3001/api/products')
        ]);
        this.orders = ordersRes.data;
        this.customers = customersRes.data;
        this.products = productsRes.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    editOrder(order) {
      const newQty = prompt('Enter new quantity:', order.QUANTITY);
      if (newQty && !isNaN(newQty)) {
        this.updateOrder(order.ORDERID, order.PRODUCTID, Number(newQty));
      }
    },
    async updateOrder(orderID, productID, quantity) {
      try {
        await axios.put(`http://localhost:3001/api/orders/${orderID}`, {
          productID,
          quantity
        });
        await this.fetchData();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    },
    confirmDelete(orderID) {
      if (confirm('Are you sure you want to delete this order?')) {
        this.deleteOrder(orderID);
      }
    },
    async deleteOrder(orderID) {
      try {
        await axios.delete(`http://localhost:3001/api/orders/${orderID}`);
        await this.fetchData();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    },
    async submitOrder() {
      try {
        await axios.post('http://localhost:3001/api/order', this.newOrder);
        this.orderMessage = '✅ Order placed successfully!';
        this.newOrder = {
          custID: '',
          productID: '',
          quantity: 1
        };
        await this.fetchData();
        setTimeout(() => {
          this.orderMessage = '';
          this.activeTab = 'orders';
        }, 2000);
      } catch (error) {
        this.orderMessage = '❌ Failed to place order. Please try again.';
        console.error('Error placing order:', error);
      }
    }
  }
};
</script>

<style scoped>
.order-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
}

.tabs button.active {
  border-bottom-color: #6b3232;
  font-weight: bold;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-input, .date-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th, .orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  background-color: #6b3232;
  color: white;
}

.action-btn {
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.edit {
  background-color: #ffc107;
  color: white;
}

.delete {
  background-color: #dc3545;
  color: white;
}

.create-order-section {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group select, .form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-btn {
  background: #6b3232;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

.message {
  margin-top: 15px;
  text-align: center;
  font-weight: bold;
}
</style>