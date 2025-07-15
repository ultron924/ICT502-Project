<template>
  <div class="inventory-card">
    <h2>Inventory Management</h2>
    
    <div class="tabs">
      <button :class="{ active: activeTab === 'stock' }" @click="activeTab = 'stock'">
        Current Stock
      </button>
      <button 
        :class="{ active: activeTab === 'purchase' }" 
        @click="activeTab = 'purchase'"
        v-if="isFullTime"
      >
        Purchase Stock
      </button>
    </div>

    <!-- Stock Tab -->
    <div v-if="activeTab === 'stock'" class="stock-section">
      <table class="stock-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Price/kg</th>
            <th>Stock Qty</th>
            <th v-if="isFullTime">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.PRODUCTID">
            <td>{{ product.PRODUCTID }}</td>
            <td>{{ product.PRODUCTNAME }}</td>
            <td>RM{{ product.PRICEKG }}</td>
            <td>{{ product.STOCKQUANT }} kg</td>
            <td v-if="isFullTime">
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

    <!-- Purchase Tab -->
    <div v-else class="purchase-section">
      <div v-if="isFullTime">
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

      <!-- ❌ Warning for part-time staff -->
      <div v-else class="restricted-msg">
        <i class="fas fa-lock"></i> Only full-time staff can access purchase functionality.
      </div>
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
      staff: null,
      newPurchase: {
        supplierID: '',
        productID: '',
        quantity: 1,
        cost: 0
      },
      purchaseMessage: ''
    };
  },
  computed: {
    isFullTime() {
      return this.staff?.staffType === 'F';
    }
  },
  async mounted() {
    const savedStaff = localStorage.getItem('staff');
    if (savedStaff) {
      this.staff = JSON.parse(savedStaff);
    }
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

  // Check if the user cancelled (prompt returns null) or provided an empty string
  if (
    newPrice === null || 
    newStock === null || 
    newPrice.trim() === '' || 
    newStock.trim() === ''
  ) {
    alert('Invalid input. Please enter valid numbers.');
    return;
  }

  // Now check if the values are actually numbers
  if (!isNaN(newPrice) && !isNaN(newStock)) {
    this.updateProduct(product.PRODUCTID, Number(newPrice), Number(newStock));
  } else {
    alert('Invalid input. Please enter valid numbers.');
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
        const staff = this.staff;
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
  background: rgb(217, 104, 104);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
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

.purchase-section, .add-product-section {
  margin-top: 20px;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #fff;
}

.form-group input, .form-group select {
  width: 95%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #682e2e;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.submit-btn {
  background: #6b3232;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
}

.submit-btn:hover {
  background: #5a2828;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
}

.cancel-btn:hover {
  background: #5a6268;
}

.message {
  margin-top: 15px;
  text-align: center;
  font-weight: bold;
  padding: 10px;
  border-radius: 4px;
}

.message.success {
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.message.error {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
  }
  
  .form-buttons {
    flex-direction: column;
  }
}
</style>