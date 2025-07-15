const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const PORT = 3001;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.use(cors());

app.get('/api/orders/summary', async (req, res) => {
  let con;
  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    const result = await con.execute(`
      SELECT 
        o.orderID, 
        c.custName, 
        o.orderDate, 
        o.totalAmount AS subtotal
      FROM ORDERS o
      JOIN Customer c ON o.custID = c.custID
      ORDER BY o.orderDate DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Order Summary Error:', err);
    res.status(500).json({ error: 'Failed to load order summary' });
  } finally {
    if (con) await con.close();
  }
});

app.get('/api/staff', async (req, res) => {
  let con;
  try {
    con = await oracledb.getConnection({       
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1' 
    });

    const result = await con.execute(`
      SELECT 
        s1.staffID,
        s1.staffName,
        s1.staffRole,
        s1.staffContact,
        s1.staffType,
        s1.supervisorID,
        s2.staffName AS supervisorName,
        CASE 
          WHEN s1.staffType = 'F' THEN 'Full-time'
          WHEN s1.staffType = 'P' THEN 'Part-time'
          ELSE 'Unknown'
        END AS employmentType
      FROM Staff s1
      LEFT JOIN Staff s2 ON s1.supervisorID = s2.staffID
      ORDER BY s1.staffName
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Staff query error:', err);
    res.status(500).json({ error: 'Staff query failed' });
  } finally {
    if (con) await con.close();
  }
});

app.get('/api/customer', async (req, res) => {
  let con;
  try {
    con = await oracledb.getConnection({       
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1' 
    });
    
    const result = await con.execute('SELECT * FROM Customer');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Customer query failed' });
  } finally {
    if (con) await con.close();
  }
});

app.get('/api/products', async (req, res) => {
  let con;
  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    const result = await con.execute('SELECT * FROM Product');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  } finally {
    if (con) await con.close();
  }
});

app.get('/api/suppliers', async (req, res) => {
  let con;
  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    const result = await con.execute('SELECT * FROM SUPPLIER');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load suppliers' });
  } finally {
    if (con) await con.close();
  }
});


app.get('/api/orders', async (req, res) => {
  let con;
  try {
    con = await oracledb.getConnection({ user: 'amz', password: 'amz123', connectString: '192.168.139.1:1521/FREEPDB1' });

    const result = await con.execute(`
      SELECT o.ORDERID, c.CUSTNAME, o.ORDERDATE,
       p.PRODUCTNAME, p.PRODUCTID,       
       oi.QUANTITY, oi.SUBTOTAL
       FROM ORDERS o
       JOIN CUSTOMER c ON o.CUSTID = c.CUSTID
       JOIN ORDERSITEM oi ON o.ORDERID = oi.ORDERID
       JOIN PRODUCT p ON oi.PRODUCTID = p.PRODUCTID
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ SQL ERROR:", err);  // <--- add this
    res.status(500).json({ error: 'Failed to load orders' });
  } finally {
    if (con) await con.close();
  }
});



app.use(express.json());

//add new staff
app.post('/api/staff', async (req, res) => {
  const { staffName, staffRole, staffContact, staffType, supervisorID } = req.body;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    // 1. Insert into Staff table
    const result = await con.execute(
      `INSERT INTO Staff (staffName, staffRole, staffContact, staffType, supervisorID) 
       VALUES (:1, :2, :3, :4, :5)
       RETURNING staffID INTO :6`,
      [
        staffName,
        staffRole,
        staffContact,
        staffType,
        supervisorID || null,
        { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      ],
      { autoCommit: false }
    );

    const staffID = result.outBinds[0][0];

    // 2. Insert into subtype
    if (staffType === 'F') {
      await con.execute(
        `INSERT INTO FullTimeStaff (staffID, staffName) 
         VALUES (:1, :2)`,
        [staffID, staffName]
      );
    } else if (staffType === 'P') {
      await con.execute(
        `INSERT INTO PartTimeStaff (staffID, staffName) 
         VALUES (:1, :2)`,
        [staffID, staffName]
      );
    }

    await con.commit();

    res.send({ 
      message: '✅ Staff added successfully!', 
      staffID,
      staffType 
    });

  } catch (err) {
    await con?.execute('ROLLBACK');
    console.error('❌ Insert Staff Error:', err);
    res.status(500).send({ error: 'Insert failed', details: err.message });
  } finally {
    if (con) await con.close();
  }
});

//Edit existing staff
app.put('/api/staff/:id', async (req, res) => {
  const { staffName, staffRole, staffContact, staffType, supervisorID } = req.body; // 👈 added supervisorID
  const staffID = req.params.id;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    await con.execute(
      `UPDATE Staff 
       SET staffName = :1, 
           staffRole = :2, 
           staffContact = :3,
           staffType = :4,
           supervisorID = :5
       WHERE staffID = :6`,
      [
        staffName,
        staffRole,
        staffContact,
        staffType,
        supervisorID || null,  // 👈 allow null
        staffID
      ],
      { autoCommit: true }
    );

    res.send({ message: '✅ Staff updated successfully!' });

  } catch (err) {
    console.error('❌ Update Staff Error:', err);
    res.status(500).send({ error: 'Update failed' });
  } finally {
    if (con) await con.close();
  }
});


//add new customer
app.post('/api/customer', async (req, res) => {
  const { custName, custPhone, custAddress } = req.body;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    await con.execute(
      `INSERT INTO CUSTOMER (custName, custPhone, custAddress) VALUES (:1, :2, :3)`,
      [custName, custPhone, custAddress],
      { autoCommit: true }
    );

    res.send({ message: '✅ Customer added!' });

  } catch (err) {
    console.error('❌ Insert Customer Error:', err);
    res.status(500).send({ error: 'Insert failed' });
  } finally {
    if (con) await con.close();
  }
});

// Login route for staff
app.post('/api/login', async (req, res) => {
  const { staffID, staffContact } = req.body;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    // Important: Match your database column names exactly
    const result = await con.execute(
      `SELECT * FROM Staff WHERE staffID = :staffID AND staffContact = :staffContact`,
      { staffID: Number(staffID), staffContact }  // Convert staffID to number if needed
    );

    if (result.rows.length > 0) {
      const staff = result.rows[0];
      res.json({ 
        success: true, 
        staff: {
          staffID: staff.STAFFID,  // Match your column case
          staffName: staff.STAFFNAME,
          staffRole: staff.STAFFROLE,
          staffContact: staff.STAFFCONTACT,
          staffType: staff.STAFFTYPE
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    if (con) await con.close();
  }
});

app.post('/api/purchase', async (req, res) => {
  const { supplierID, productID, quantity, cost } = req.body;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    const staff = JSON.parse(req.headers['x-user'] || '{}');
    const staffID = Number(staff.staffID || 1);

    const qty = Number(quantity);
    const costPerKg = Number(cost);
    const prodID = Number(productID);
    const totalCost = qty * costPerKg;

    if (isNaN(qty) || isNaN(costPerKg) || isNaN(prodID)) {
      return res.status(400).json({ error: 'Quantity, cost, or productID must be a number' });
    }

    // ✅ 1. Insert into PURCHASES using RETURNING INTO to get purchaseID
    const purchaseResult = await con.execute(
      `INSERT INTO PURCHASES (SUPPLIERID, PURCHASEDATE, TOTALCOST, STAFFID)
       VALUES (:supplierID, SYSDATE, :totalCost, :staffID)
       RETURNING PURCHASEID INTO :purchaseID`,
      {
        supplierID,
        totalCost,
        staffID,
        purchaseID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const purchaseID = purchaseResult.outBinds.purchaseID[0];

    // ✅ 2. Insert into PURCHASESITEM
    await con.execute(
      `INSERT INTO PURCHASESITEM (PURCHASEID, PRODUCTID, QUANTITY, COSTKG)
       VALUES (:purchaseID, :productID, :quantity, :costKg)`,
      { purchaseID, productID: prodID, quantity: qty, costKg: costPerKg }
    );

    // ✅ 3. Update product stock
    await con.execute(
      `UPDATE PRODUCT SET STOCKQUANT = STOCKQUANT + :quantity WHERE PRODUCTID = :productID`,
      { quantity: qty, productID: prodID }
    );

    await con.commit();
    res.json({ success: true });

  } catch (err) {
    console.error('❌ Purchase Insert Error:', err);
    res.status(500).json({ error: 'Purchase failed' });
  } finally {
    if (con) await con.close();
  }
});


app.post('/api/order', async (req, res) => {
  const { custID, productID, quantity, staffID } = req.body;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    // 1. Get product price
    const priceResult = await con.execute(
      `SELECT PRICEKG FROM PRODUCT WHERE PRODUCTID = :id`,
      { id: productID }
    );

    if (priceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const price = Number(priceResult.rows[0].PRICEKG ?? priceResult.rows[0][0]);
    const qty = Number(quantity);

    if (isNaN(price) || isNaN(qty)) {
      return res.status(400).json({ error: 'Price or quantity is not a number' });
    }

    const subtotal = price * qty;

    // 2. Insert into ORDERS
    await con.execute(
      `INSERT INTO ORDERS (CUSTID, ORDERDATE, TOTALAMOUNT, STAFFID)
       VALUES (:custID, SYSDATE, :totalAmount, :staffID)`,
      { custID, totalAmount: subtotal, staffID }
    );

    // 3. Get the latest ORDERID
    const orderIDResult = await con.execute(`SELECT MAX(ORDERID) AS ORDERID FROM ORDERS`);
    const orderID = orderIDResult.rows[0].ORDERID;

    // 4. Insert into ORDERSITEM
    await con.execute(
      `INSERT INTO ORDERSITEM (ORDERID, PRODUCTID, QUANTITY, SUBTOTAL)
       VALUES (:orderID, :productID, :quantity, :subtotal)`,
      { orderID, productID, quantity: qty, subtotal }
    );

    // 5. Update PRODUCT stock
    await con.execute(
      `UPDATE PRODUCT SET STOCKQUANT = STOCKQUANT - :quantity WHERE PRODUCTID = :productID`,
      { quantity: qty, productID }
    );

    await con.commit();
    res.json({ success: true, orderID });

  } catch (err) {
    console.error('❌ Order Insert Error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    if (con) await con.close();
  }
});

//Update quantity of an order and recalculate subtotal + stock.
app.put('/api/orders/:id', async (req, res) => {
  const { productID, quantity } = req.body;
  const orderID = req.params.id;
  let con;

  try {
    console.log('🔧 Update Order Request:', { orderID, productID, quantity });

    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    // 1. Get price per kg of the product
    const priceRes = await con.execute(
      `SELECT PRICEKG FROM PRODUCT WHERE PRODUCTID = :id`,
      [productID],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log('🔍 Price Query Result:', priceRes.rows);

    if (!priceRes.rows || priceRes.rows.length === 0) {
      return res.status(404).json({ error: '❌ Product not found' });
    }

    const price = priceRes.rows[0].PRICEKG;
    const newSubtotal = price * quantity;

    // 2. Get the original quantity to compute stock difference
    const originalRes = await con.execute(
      `SELECT QUANTITY FROM ORDERSITEM WHERE ORDERID = :oid AND PRODUCTID = :pid`,
      { oid: orderID, pid: productID },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!originalRes.rows || originalRes.rows.length === 0) {
      return res.status(404).json({ error: '❌ Original order item not found' });
    }

    const originalQty = originalRes.rows[0].QUANTITY;
    const qtyDiff = quantity - originalQty;

    // 3. Update product stock based on quantity difference
    await con.execute(
      `UPDATE PRODUCT SET STOCKQUANT = STOCKQUANT - :diff WHERE PRODUCTID = :pid`,
      { diff: qtyDiff, pid: productID }
    );

    // 4. Update order item with new quantity and subtotal
    await con.execute(
      `UPDATE ORDERSITEM 
       SET QUANTITY = :qty, SUBTOTAL = :sub 
       WHERE ORDERID = :oid AND PRODUCTID = :pid`,
      { qty: quantity, sub: newSubtotal, oid: orderID, pid: productID }
    );

    // 5. Update total amount in ORDERS table
    const totalRes = await con.execute(
      `SELECT SUM(SUBTOTAL) AS TOTAL FROM ORDERSITEM WHERE ORDERID = :id`,
      [orderID],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const newTotal = totalRes.rows[0].TOTAL || 0;

    await con.execute(
      `UPDATE ORDERS SET TOTALAMOUNT = :total WHERE ORDERID = :id`,
      { total: newTotal, id: orderID }
    );

    await con.commit();

    console.log('✅ Order updated and stock adjusted successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Update Order Error:', err);
    res.status(500).json({ error: 'Update failed: ' + err.message });
  } finally {
    if (con) await con.close();
  }
});

//Delete from both ORDERSITEM and ORDERS.
app.delete('/api/orders/:id', async (req, res) => {
  const orderID = req.params.id;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    // Step 1: Get all order items (productID and quantity)
    const itemsRes = await con.execute(
      `SELECT PRODUCTID, QUANTITY FROM ORDERSITEM WHERE ORDERID = :id`,
      [orderID],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const items = itemsRes.rows;

    // Step 2: Restore stock for each item
    for (const item of items) {
      await con.execute(
        `UPDATE PRODUCT SET STOCKQUANT = STOCKQUANT + :qty WHERE PRODUCTID = :pid`,
        { qty: item.QUANTITY, pid: item.PRODUCTID }
      );
    }

    // Step 3: Delete from ORDERSITEM and ORDERS
    await con.execute(`DELETE FROM ORDERSITEM WHERE ORDERID = :id`, [orderID]);
    await con.execute(`DELETE FROM ORDERS WHERE ORDERID = :id`, [orderID]);

    await con.commit();
    console.log(`✅ Order ${orderID} deleted and stock restored`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete Order Error:', err);
    res.status(500).json({ error: 'Delete failed' });
  } finally {
    if (con) await con.close();
  }
});


//Update stock quantity and price.
app.put('/api/products/:id', async (req, res) => {
  const productID = req.params.id;
  const { priceKg, stockQty } = req.body;
  let con;

  try {
    const price = Number(priceKg);
    const stock = Number(stockQty);

    if (isNaN(price) || isNaN(stock)) {
      return res.status(400).json({ error: 'Price or stock must be a number' });
    }

    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    await con.execute(
      `UPDATE PRODUCT 
       SET PRICEKG = :price, STOCKQUANT = :stock 
       WHERE PRODUCTID = :id`,
      { price, stock, id: productID }
    );

    await con.commit();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Product Update Error:', err);
    res.status(500).json({ error: 'Product update failed' });
  } finally {
    if (con) await con.close();
  }
});

//Delete a product from the PRODUCT table.
app.delete('/api/products/:id', async (req, res) => {
  const productID = req.params.id;
  let con;

  try {
    con = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    await con.execute(`DELETE FROM PRODUCT WHERE PRODUCTID = :id`, [productID]);

    await con.commit();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete Product Error:', err);
    res.status(500).json({ error: 'Delete failed' });
  } finally {
    if (con) await con.close();
  }
});



app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});