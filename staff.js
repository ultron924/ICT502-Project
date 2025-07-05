const express = require('express');
const oracledb = require('oracledb');
const app = express();
const PORT = 3000;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.get('/', async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: 'amz',
      password: 'amz123',
      connectString: '192.168.139.1:1521/FREEPDB1'
    });

    const result = await connection.execute('SELECT * FROM Staff');

    // Generate HTML table
    let html = `
      <html>
      <head>
        <title>Staff List</title>
        <style>
          table { border-collapse: collapse; width: 80%; margin: 20px auto; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center;">Staff Table</h2>
        <table>
          <tr>
            <th>Staff ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Contact</th>
          </tr>`;

    result.rows.forEach(row => {
      html += `
          <tr>
            <td>${row.STAFFID}</td>
            <td>${row.STAFFNAME}</td>
            <td>${row.STAFFROLE}</td>
            <td>${row.STAFFCONTACT}</td>
          </tr>`;
    });

    html += `
        </table>
      </body>
      </html>`;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error('Error closing connection', e);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});