<template>
  <div class="order-card">
    <h2>Order Management</h2>
    
    <div class="tabs">
      <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
        Customer Orders
      </button>
      <button :class="{ active: activeTab === 'create' }" @click="activeTab = 'create'; resetOrderForm()">
        Create Order
      </button>
      <button :class="{ active: activeTab === 'customer' }" @click="activeTab = 'customer'; resetCustomerForm()">
        Add Customer
      </button>
    </div>

    <!-- Orders Table Section -->
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
            <td>RM{{ order.SUBTOTAL.toFixed(2) }}</td>
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

    <!-- Create Order Section -->
    <div v-if="activeTab === 'create'" class="create-order-section">
      <form @submit.prevent="submitOrder">
        <div class="form-group">
          <label>Customer:</label>
          <select v-model="newOrder.custID" required>
            <option value="">Select a customer</option>
            <option v-for="customer in customers" :key="customer.CUSTID" :value="customer.CUSTID">
              {{ customer.CUSTNAME }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Product:</label>
          <select v-model="newOrder.productID" required @change="updateProductPrice">
            <option value="">Select a product</option>
            <option v-for="product in products" :key="product.PRODUCTID" :value="product.PRODUCTID">
              {{ product.PRODUCTNAME }} (RM{{ product.PRICEKG.toFixed(2) }}/kg)
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Quantity (kg):</label>
          <input 
            type="number" 
            v-model.number="newOrder.quantity" 
            min="1" 
            required
            @input="calculateSubtotal"
          >
        </div>

        <div class="form-group" v-if="newOrder.productID">
          <label>Unit Price:</label>
          <span class="price-display">RM{{ currentProductPrice.toFixed(2) }}</span>
        </div>

        <div class="form-group" v-if="newOrder.productID && newOrder.quantity > 0">
          <label>Subtotal:</label>
          <span class="price-display">RM{{ (currentProductPrice * newOrder.quantity).toFixed(2) }}</span>
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Place Order</span>
            <span v-else>Processing...</span>
          </button>
          <button type="button" @click="resetOrderForm" class="cancel-btn">
            Reset
          </button>
        </div>
      </form>
      
      <p v-if="orderMessage" :class="['message', orderMessage.includes('✅') ? 'success' : 'error']">
        {{ orderMessage }}
      </p>
    </div>

    <!-- Add Customer Section -->
    <div v-if="activeTab === 'customer'" class="customer-section">
      <h3>Add New Customer</h3>
      <form @submit.prevent="addCustomer" class="customer-form">
        <div class="form-group">
          <label>Customer Name:</label>
          <input v-model="newCustomer.custName" required>
        </div>
        
        <div class="form-group">
          <label>Phone Number:</label>
          <input v-model="newCustomer.custPhone" required>
        </div>
        
        <div class="form-group">
          <label>Address:</label>
          <textarea v-model="newCustomer.custAddress" required></textarea>
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="submit-btn" :disabled="isSubmittingCustomer">
            <span v-if="!isSubmittingCustomer">Add Customer</span>
            <span v-else>Processing...</span>
          </button>
          <button type="button" @click="resetCustomerForm" class="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
      
      <p v-if="customerMessage" :class="['message', customerMessage.includes('✅') ? 'success' : 'error']">
        {{ customerMessage }}
      </p>
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
      currentProductPrice: 0,
      orderMessage: '',
      isSubmitting: false,
      newCustomer: {
        custName: '',
        custPhone: '',
        custAddress: ''
      },
      customerMessage: '',
      isSubmittingCustomer: false
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
  console.log('🧪 DEBUG order object:', order); // <-- ADD THIS

  const newQty = prompt('Enter new quantity:', order.QUANTITY);

  if (newQty && !isNaN(newQty)) {
    console.log('➡️ Calling updateOrder with:', order.ORDERID, order.PRODUCTID);
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
        this.isSubmitting = true;
        const staff = JSON.parse(localStorage.getItem('staff')) || {};
        
        const orderData = {
          custID: this.newOrder.custID,
          productID: this.newOrder.productID,
          quantity: this.newOrder.quantity,
          staffID: staff.staffID
        };

        const response = await axios.post('http://localhost:3001/api/order', orderData);
        
        this.orderMessage = '✅ Order placed successfully!';
        this.resetOrderForm();
        await this.fetchData();
        
        setTimeout(() => {
          this.orderMessage = '';
          this.activeTab = 'orders';
        }, 2000);
      } catch (error) {
        this.orderMessage = '❌ Failed to place order: ' + 
          (error.response?.data?.error || error.message);
      } finally {
        this.isSubmitting = false;
      }
    },
    resetOrderForm() {
      this.newOrder = {
        custID: '',
        productID: '',
        quantity: 1
      };
      this.currentProductPrice = 0;
      this.orderMessage = '';
    },
    updateProductPrice() {
      if (this.newOrder.productID) {
        const product = this.products.find(p => p.PRODUCTID == this.newOrder.productID);
        this.currentProductPrice = product ? product.PRICEKG : 0;
      } else {
        this.currentProductPrice = 0;
      }
    },
    calculateSubtotal() {
      // This is handled reactively in the template
    },
    async addCustomer() {
      try {
        this.isSubmittingCustomer = true;
        await axios.post('http://localhost:3001/api/customer', this.newCustomer);
        this.customerMessage = '✅ Customer added successfully!';
        
        await this.fetchData();
        this.resetCustomerForm();
        
        setTimeout(() => {
          this.activeTab = 'create';
        }, 1500);
      } catch (error) {
        this.customerMessage = '❌ Failed to add customer: ' + 
          (error.response?.data?.error || error.message);
      } finally {
        this.isSubmittingCustomer = false;
      }
    },
    resetCustomerForm() {
      this.newCustomer = {
        custName: '',
        custPhone: '',
        custAddress: ''
      };
      this.customerMessage = '';
    }
  },
  watch: {
    'newOrder.productID': {
      handler: 'updateProductPrice',
      immediate: true
    }
  }
};
</script>

<style scoped>
.order-card {
  background: rgb(217, 104, 104);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #121111;
  gap: 5px;
}

.tabs button {
  padding: 10px 20px;
  background: rgb(125, 4, 4);
  color: white;
  border: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tabs button.active {
  border-bottom-color: #d4c4c4;
  font-weight: bold;
}

.tabs button:hover:not(.active) {
  background: rgb(150, 20, 20);
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
  background: rgb(136, 68, 68);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: rgb(161, 67, 67);
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

.create-order-section, .customer-section {
  margin-top: 20px;
  background: rgb(238, 118, 118);
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group select, 
.form-group input,
.form-group textarea {
  width: 95%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.price-display {
  font-weight: bold;
  color: #6b3232;
  margin-left: 10px;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background: #6b3232;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
  font-size: 16px;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #5a2828;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: #5a6268;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}

.message.success {
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.message.error {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .form-buttons {
    flex-direction: column;
  }
}
</style>