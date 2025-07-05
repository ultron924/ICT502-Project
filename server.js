const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const PORT = 3001;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.use(cors());

app.get('/api/staff', async (req, res) => {
  let con;
  try {
    con = await oracledb.getConnection({       
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1' 
    });

    const result = await con.execute('SELECT * FROM Staff');
    res.json(result.rows);
  } catch (err) {
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

app.use(express.json());

app.post('/api/staff', async (req, res) => {
  const { staffID, staffName, staffRole, staffContact } = req.body;
  let con;
  try {
    con = await oracledb.getConnection({       
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1' 
    });

    await con.execute(
      `INSERT INTO Staff (staffID, staffName, staffRole, staffContact) VALUES (:1, :2, :3, :4)`,
      [staffID, staffName, staffRole, staffContact],
      { autoCommit: true }
    );
    res.send({ message: 'Staff added' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Insert failed' });
  } finally {
    if (con) await con.close();
  }
});

app.post('/api/customer', async (req, res) => {
  const { custID, custName, custPhone, custAddress } = req.body;
  let con;
  try {
    con = await oracledb.getConnection({       
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1' 
    });
    
    await con.execute(
      `INSERT INTO Customer (custID, custName, custPhone, custAddress) VALUES (:1, :2, :3, :4)`,
      [custID, custName, custPhone, custAddress],
      { autoCommit: true }
    );
    res.send({ message: 'Customer added' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Insert failed' });
  } finally {
    if (con) await con.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});