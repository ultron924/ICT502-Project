<template>
  <div class="inventory-card">
    <h2>Inventory Management</h2>
    
    <div class="tabs">
      <button :class="{ active: activeTab === 'stock' }" @click="activeTab = 'stock'">
        Current Stock
      </button>
      <button :class="{ active: activeTab === 'purchase' }" @click="activeTab = 'purchase'">
        Purchase Stock
      </button>
    </div>

    <div v-if="activeTab === 'stock'" class="stock-section">
      <table class="stock-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Price/kg</th>
            <th>Stock Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.PRODUCTID">
            <td>{{ product.PRODUCTID }}</td>
            <td>{{ product.PRODUCTNAME }}</td>
            <td>RM{{ product.PRICEKG }}</td>
            <td>{{ product.STOCKQUANT }} kg</td>
            <td>
              <button @click="editProduct(product)" class="action-btn edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmDelete(product.PRODUCTID)" class="action-btn delete">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="purchase-section">
      <form @submit.prevent="submitPurchase">
        <div class="form-group">
          <label>Supplier:</label>
          <select v-model="newPurchase.supplierID" required>
            <option v-for="supplier in suppliers" :key="supplier.SUPPLIERID" :value="supplier.SUPPLIERID">
              {{ supplier.SUPPNAME }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Product:</label>
          <select v-model="newPurchase.productID" required>
            <option v-for="product in products" :key="product.PRODUCTID" :value="product.PRODUCTID">
              {{ product.PRODUCTNAME }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Quantity (kg):</label>
          <input type="number" v-model.number="newPurchase.quantity" min="1" required>
        </div>
        
        <div class="form-group">
          <label>Cost per kg (RM):</label>
          <input type="number" v-model.number="newPurchase.cost" min="0.01" step="0.01" required>
        </div>
        
        <button type="submit" class="submit-btn">Record Purchase</button>
      </form>
      
      <p v-if="purchaseMessage" class="message">{{ purchaseMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeTab: 'stock',
      products: [],
      suppliers: [],
      newPurchase: {
        supplierID: '',
        productID: '',
        quantity: 1,
        cost: 0
      },
      purchaseMessage: ''
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const [productsRes, suppliersRes] = await Promise.all([
          axios.get('http://localhost:3001/api/products'),
          axios.get('http://localhost:3001/api/suppliers')
        ]);
        this.products = productsRes.data;
        this.suppliers = suppliersRes.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    editProduct(product) {
      const newPrice = prompt('Enter new price:', product.PRICEKG);
      const newStock = prompt('Enter new stock quantity:', product.STOCKQUANT);
      
      if (newPrice && newStock && !isNaN(newPrice) && !isNaN(newStock)) {
        this.updateProduct(product.PRODUCTID, Number(newPrice), Number(newStock));
      }
    },
    async updateProduct(productID, price, stock) {
      try {
        await axios.put(`http://localhost:3001/api/products/${productID}`, {
          priceKg: price,
          stockQty: stock
        });
        await this.fetchData();
      } catch (error) {
        console.error('Error updating product:', error);
      }
    },
    confirmDelete(productID) {
      if (confirm('Are you sure you want to delete this product?')) {
        this.deleteProduct(productID);
      }
    },
    async deleteProduct(productID) {
      try {
        await axios.delete(`http://localhost:3001/api/products/${productID}`);
        await this.fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    },
    async submitPurchase() {
      try {
        const staff = JSON.parse(localStorage.getItem('staff')) || {};
        
        await axios.post('http://localhost:3001/api/purchase', this.newPurchase, {
          headers: {
            'x-user': JSON.stringify(staff)
          }
        });
        
        this.purchaseMessage = '✅ Purchase recorded successfully!';
        this.newPurchase = {
          supplierID: '',
          productID: '',
          quantity: 1,
          cost: 0
        };
        await this.fetchData();
      } catch (error) {
        this.purchaseMessage = '❌ Failed to record purchase. Please try again.';
        console.error('Error recording purchase:', error);
      }
    }
  }
};
</script>

<style scoped>
.inventory-card {
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

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table th, .stock-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.stock-table th {
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

.purchase-section {
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