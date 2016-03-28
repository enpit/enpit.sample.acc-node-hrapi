var http = require('http');
var oracledb = require('oracledb');

var PORT = process.env.PORT || 8089;
var _connect = {  user : "c##" + process.env.DB_USER || "c##hr",
                  password : process.env.DB_PWD || "hr",
                  connectString : process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR || "localhost:1521/PDB1.deenpitcon.oraclecloud.internal"
                };

function handleRequest(request, response, requestBody) {
  console.log(request.method + ":" + request.url + ' >>' + requestBody);

  if(request.url === "/departments"){
    console.log('Handle request: '+request.url);
    console.log('Connect Details :' + _connect);
    oracledb.getConnection(_connect,
      function(err, connection){
        if (err) {
            console.log('Error in acquiring connection ...');
            console.log('Error message '+err.message);

            // Error connecting to DB
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({
                      status: 500,
                      message: "Error connecting to DB",
                      detailed_message: err.message
            }));

            return;
        }
        console.log('Connected successfully!');

        var selectStatement = "SELECT department_id, department_name " +
                              "FROM departments";

        connection.execute( selectStatement, {}, {
                  outFormat: oracledb.OBJECT
                }, function (err, result) {
              if (err) {
                console.log('Error in execution of select statement'+err.message);
                response.writeHead(500, {'Content-Type': 'application/json'});
                response.end(JSON.stringify({
                  status: 500,
                  message: "Error getting the departments",
                  detailed_message: err.message
                }));
              } else {
                console.log('db response is ready '+result.rows);
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(result.rows));
              }

              // Release the connection
              connection.release(
                function (err) {
                  if (err) {
                    console.error(err.message);
                  } else {
                    console.log("GET /departments : Connection released");
                  }
                });
              });
            });

          } else {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write("Please provide /departments e.g.");
            response.end();

          }
}//end handleRequest

var server = http.createServer(function (request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);

  var requestBody = '';
  request.on('data', function (data) {
    requestBody += data;
  });
  request.on('end', function () {
    handleRequest (request, response, requestBody);
  });

});

server.listen(PORT, function () {
  console.log('Server running...');
});
