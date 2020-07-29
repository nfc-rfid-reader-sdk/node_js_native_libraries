var ffi = require("@saleae/ffi");
var ref = require('ref');

// DLL import 
var oldPath = process.env.PATH;
var dllPath = __dirname + '\\lib';
process.env['PATH'] = `${process.env.PATH};${dllPath}`;

var uFCoder = ffi.Library("uFCoder-x86_64.dll", {
  "ReaderOpen"        : ["int", ["void"]],
  "ReaderOpenEx"      : ["int", ["int", "string", "int", "string"]],
  "GetCardIdEx"       : ["int", ['byte *', 'byte *', 'byte *']],
  "LinearRead"        : ["int", ['byte*', 'ushort', 'ushort', 'ushort*', 'byte', 'byte']],
  "LinearWrite"       : ["int", ['byte*', 'ushort', 'ushort', 'ushort*', 'byte', 'byte']],
  "LinearFormatCard"  : ["int", ['byte*', 'byte', 'byte', 'byte', 'byte*', 'byte*', 'byte', 'byte']],
  "GetCardSize"       : ['int', ['int*', 'int*']],
  "ReaderUISignal"    : [ "int", ['int', 'int']],
  "UFR_Status2String" : ["string", ['int']]
});

process.env['PATH'] = oldPath;


// set up server 

const hostname = '127.0.0.1';
const port = 3000;

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));



app.post("/readerOpenEx", function(req, res) {
  
  var reader_type = req.body.ReaderType;

  var port_name = req.body.PortName;
  if (port_name == '0') {
    port_name = '';
  }

  var port_interface = req.body.PortInterface;
  if (port_interface == "T" || port_interface == "U")
  {
    port_interface = port_interface.charCodeAt(0);
  }
  else {
    port_interface = parseInt(port_interface);
  }

  var arg = req.body.Arg;
  if (arg == '0') {
    arg = '';
  }

  var status = uFCoder.ReaderOpenEx(reader_type, port_name, port_interface, arg);
  var success = "";
  if (status == 0)
  {
    uFCoder.ReaderUISignal(1,1);
    success = "Function status: ReaderOpenEx() - successful"
  } else {
    success = "Function status: ReaderOpenEx() - failed"
  }

  var response = {
    "Status" : uFCoder.UFR_Status2String(status),
    "Success" : success
  }
  
  res.send(JSON.stringify(response));
});



app.post("/readerOpen", function(req, res) {

  var status = uFCoder.ReaderOpen(null);
  var success = "";
  if (status == 0)
  {
    uFCoder.ReaderUISignal(1,1);
    success = "Function status: ReaderOpen() - successful"
  } else {
    success = "Function status: ReaderOpen() - failed"
  }
  var response = {
    "Status" : uFCoder.UFR_Status2String(status),
    "Success" : success
  }
  res.send(JSON.stringify(response));
});

app.post("/getCardIdEx", function(req, res) {
  var uid = new Buffer.alloc(11);       
  var sak = ref.alloc('byte');      
  var uid_size = ref.alloc('byte');  
  var success = "";
  var status = uFCoder.GetCardIdEx(sak, uid, uid_size);
  var uid_str = "";
  if (status == 0)
  {
    success = "Function status: GetCardIdEx() - successful";
    for(i = 0; i < uid_size.deref(); i++)
    {
      uid_str += uid[i].toString(16).padStart(2, '0').toUpperCase() + ":";
    }
    uid_str = uid_str.slice(0, -1);
  } else {

    uid_str = "";
    uid_size = ref.alloc('byte', 0);
    sak = ref.alloc('byte', 0);
    success = "Function status: GetCardIdEx() - failed";
  }
  
  var response = {
    "Status" : uFCoder.UFR_Status2String(status),
    "Success": success,
    "Uid"    : uid_str,
    "Uid_size" : uid_size.deref(),
    "Sak"    : sak.deref()
  }
  
  res.send(JSON.stringify(response));

});


app.post("/linearRead", function(req, res) {
var linear_size = ref.alloc('int', 0);
var raw_size = ref.alloc('int', 0);
var bytes_ret = ref.alloc('ushort', 0);

var success = "";
var data_str = "";
var status = uFCoder.GetCardSize(linear_size, raw_size);

if (status == 0)
{
  var data = new Buffer.alloc(linear_size.deref());

  status = uFCoder.LinearRead(data, 0, linear_size.deref(), bytes_ret, 0x60, 0);
  if (status == 0)
  {
    success = "Function status: LinearRead() - successful";
    for(i = 0; i < bytes_ret.deref(); i++)
    {
      data_str += data[i].toString(16).padStart(2, '0').toUpperCase() + ":";
    }
    data_str = data_str.slice(0, -1);
}
else
{
  success = "Function status: LinearRead() - failed";
  data_str = "";
}

} else 
{
  success = "Function status: LinearRead() - failed";
  data_str = "";
}

var response = {
  "Status" : uFCoder.UFR_Status2String(status),
  "Success": success,
  "Data"    : data_str
}

res.send(JSON.stringify(response));

});

app.post("/linearWrite", function(req, res) {

  var str_data = req.body.data;
  var write_length = req.body.length;
  var data = new Buffer.alloc(write_length);
  var temp = [];
  var success = "";
  for (i = 0; i < write_length*2; i+=2)
  {
    temp.push(parseInt(str_data.substr(i, 2), 16));
  }
  
  for (i = 0; i < temp.length; i++)
  {
    data[i] = temp[i];
  }
  
  var bytes_written = ref.alloc('ushort', 0);
  
  var status = uFCoder.LinearWrite(data, 0, write_length, bytes_written, 0x60, 0);
  if (status == 0)
  {
    success = "Function status: LinearWrite() - successful";
  } else 
  {
    success = "Function status: LinearWrite() - failed";
  }

  var response = {
    "Status" : uFCoder.UFR_Status2String(status),
    "Success": success
  }
  
  res.send(JSON.stringify(response));
});


app.post("/formatCard", function(req, res) {

  var new_key_A = new Buffer.alloc(6, 0xFF);
  var new_key_B = new Buffer.alloc(6, 0xFF);
  var formatted = ref.alloc('byte', 0);

  var status = uFCoder.LinearFormatCard(new_key_A, 0, 1, 0x69, new_key_B, formatted, 0x60, 0);
  if (status == 0)
  {
    success = "Function status: LinearFormatCard() - successful";
  } else 
  {
    success = "Function status: LinearFormatCard() - failed";
  }

  var response = {
    "Status" : uFCoder.UFR_Status2String(status),
    "Success": success
  }

  res.send(JSON.stringify(response));
});


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});