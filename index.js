
//connect mysql
const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : 'actnow.cxz09bhx6zyk.us-west-1.rds.amazonaws.com',
  user     : 'actnow',
  password : ''
});

exports.myHandler = function(event, context, callback) {

};
