function showAbout() {

    document.getElementById("simplest_example_main_div").style.display = "none";
    document.getElementById("about").style.display = "block";

}

function showHome() {

    document.getElementById("simplest_example_main_div").style.display = "block";
    document.getElementById("about").style.display = "none";

}

/* AJAX to Node server calls */

function ReaderOpen(e) {
if (document.getElementById("checkAdvancedOption").checked) {
    //ReaderOpenEx
    var ex_parameters = {
        "ReaderType"    : document.getElementById("reader_type").value,
        "PortName"      : document.getElementById("port_name").value,
        "PortInterface" : document.getElementById("port_interface").value,
        "Arg"           : document.getElementById("port_additional_arg").value
    }

    var parameters = JSON.stringify(ex_parameters)
    var settings = {
        "url": "/readerOpenEx",
        "method": "POST",
        "timeout": 3000,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": parameters,
      };
      
      $.ajax(settings).done(function (res) {
        console.log(res);
        response = JSON.parse(res);
        document.getElementById("status").innerHTML = "Status: " + response.Status;
        document.getElementById("function_status").innerHTML = response.Success;
      });
    }  else {

        var settings = {
            "url": "/readerOpen",
            "method": "POST",
            "timeout": 3000                 
          };
          $.ajax(settings).done(function (res) {
            response = JSON.parse(res);
            document.getElementById("status").innerHTML = "Status: " + response.Status;
            document.getElementById("function_status").innerHTML = response.Success;
          });
    }
}


function GetCardIdEx(e) {

    var settings = {
        "url": "/getCardIdEx",
        "method": "POST",
        "timeout": 3000                 
      };
      $.ajax(settings).done(function (res) {
        response = JSON.parse(res);
        document.getElementById("status").innerHTML = "Status: " + response.Status;
        document.getElementById("function_status").innerHTML = response.Success;
        document.getElementsByName("simplest_card_serial")[0].value = response.Uid;
        document.getElementsByName("simplest_card_type")[0].value = response.Uid_size;
        document.getElementsByName("simplest_uid_size")[0].value = response.Sak;
      });

}

function LinearRead(e) {
    var settings = {
        "url": "/linearRead",
        "method": "POST",
        "timeout": 3000                 
      };
      $.ajax(settings).done(function (res) {
        response = JSON.parse(res);
        document.getElementById("status").innerHTML = "Status: " + response.Status;
        document.getElementById("function_status").innerHTML = response.Success;
        document.getElementById("linear_read_input").value = response.Data;
    });
}

function LinearWrite(e) {
    var input_data = document.getElementById("linear_write_input").value;

    if (isHex(input_data) && ((input_data.length % 2) == 0)) {
        var write_parameters = {
            "data" : input_data,
            "length" : input_data.length / 2
        }

        var parameters = JSON.stringify(write_parameters)

        var settings = {
            "url": "/linearWrite",
            "method": "POST",
            "timeout": 3000,
            "headers": {
            "Content-Type": "application/json"
            },
            "data": parameters,
        };

        $.ajax(settings).done(function (res) {   
            response = JSON.parse(res);
            document.getElementById("function_status").innerHTML = response.Success;
            document.getElementById("status").innerHTML = "Status: " + response.Status;
            
        });
    } else 
    {
        alert("Your data input for Linear Write is invalid.");
    }
}

function FormatCard(e) {
var settings = {
    "url": "/formatCard",
    "method": "POST",
    "timeout": 3000                 
  };
  $.ajax(settings).done(function (res) {      
    response = JSON.parse(res);
    document.getElementById("function_status").innerHTML = response.Success;
    document.getElementById("status").innerHTML = "Status: " + response.Status;
  });
}

/* utility functions */

function charcountupdate(str) {
    var lng = str.length;
    document.getElementById("charcount").innerHTML = Math.round(lng / 2) + ' Bytes';
}


function AdvancedOption() {
    
    var input_data = document.getElementById("advanced_options").getElementsByClassName("adv_option");

    if (document.getElementById("checkAdvancedOption").checked) {

        for (var i = 0; i < input_data.length; i++) {
            input_data[i].disabled = false;
        }
    } else {
        for (var i = 0; i < input_data.length; i++) {
            input_data[i].disabled = true;
        }
    }

}

function isHex(h) {

    regexp = /^[0-9a-fA-F]+$/;

    if (regexp.test(h)) {
        return true;
    } else {
        return false;
    }

}