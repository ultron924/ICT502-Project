const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function fun() {
    let con;

    try {
        con = await oracledb.getConnection({
            user          : 'amz',          
            password      : 'amz123',          
            connectString : '192.168.139.1:1521/FREEPDB1'
        });

        const result = await con.execute(
            'SELECT * FROM supplier'
        );

        console.log(result.rows);  // shows the rows from purchase table

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (con) {
            try {
                await con.close();
                console.log("✅ Connection closed");
            } catch (err) {
                console.error("❌ Closing error:", err);
            }
        }
    }
}

fun();