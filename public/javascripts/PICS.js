/*

The MIT License (MIT)

Copyright (c) Tue January 23 2017 Joseph Hassell josephh2018@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORTOR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

1xxx: Generic errors
2xxx: cred errors
3xxx: processing errors
5xxx: user error codes
6xxx: generic info codes
7xxx: success info codes
8xxx: warning info codes


"AJAX Error": 1001
"Encryption Error": 1002
"unknown error": 1111
"wrong credentials": 2401
"Database Error": 3001
"Required Values not Satisfied": 3002
"Unknown Values": 3003
"Already Authenticated": 5001
"Duplicate Passes": 5002
"Debug Code": 6001
"Successful Transaction": 7001
"Limit Reached": 8001
"Nothing Changed": 8002
"Possibly Fatal Transaction": 8003
*/


console.log("Passport Info Code System (PICS) Is Initialized");
function PICS(infoCodeunpar) {
  //var infoCode = JSON.parse(infoCodeunpar);
  var infoCode = infoCodeunpar;
  var visOutput = "PICS ~ Nothing Specified";
  var result = false;
  switch (infoCode.code) {
    case "1001":
      console.error("PICS ~ Error Code: " + infoCode.code + " - AJAX Error");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "1002":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Encryption Error");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "1111":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Unknown Error");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "2401":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Wrong Credentials");
      result = false;
      visOutput = "Error! Wrong Credentials";
      break;
    case "3001":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Database Error");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "3002":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Required Values not Satisfied");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "3003":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Unknown Values");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "5001":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Already Authenticated");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "5002":
      console.error("PICS ~ Error Code: " + infoCode.code + " - Duplicate Passes");
      result = false;
      visOutput = "Error! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "6001":
      console.log("PICS ~ Info Code: " + infoCode.code + " - Debug Code");
      result = true;
      visOutput = "\"PICS\" Code: " + infoCode.code + " See Console";
      console.log("Raw JSON Data: " + JSON.stringify(infoCode));
      break;
    case "7001":
      console.log("PICS ~ Success Code: " + infoCode.code + " - Successful Transaction");
      result = true;
      visOutput = "Successful Transaction!";
      break;
    case "8001":
      console.warn("PICS ~ Warning Code: " + infoCode.code + " - Limit Reached");
      result = false;
      visOutput = "Warning! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
    case "8002":
      console.warn("PICS ~ Warning Code: " + infoCode.code + " - Nothing Changed");
      result = false;
      visOutput = "Warning! \"PICS\" Code: " + infoCode.code + " - Nothing Changed";
      break;
    case "8003":
      console.warn("PICS ~ FATAL Warning Code: " + infoCode.code + " - Possibly Fatal Transaction.  GET IT TO CHECK DATABASE");
      result = false;
      visOutput = "URGENT!! Warning! \"PICS\" Code: " + infoCode.code + " - Possibly Fatal Transaction";
      break;
    default:
      console.warn("PICS ~ The Code: " + infoCode.code + " is not recognised by PICS.");
      console.log("Raw JSON Data: " + JSON.stringify(infoCode));
      console.log("Raw Code: " + infoCode.code);
      result = false;
      visOutput = "Warning! \"PICS\" Code: " + infoCode.code + " See Console";
      break;
  }
  console.log("Please See \"https://github.com/poster983/passport/wiki/Error-Codes\" For More Information.");
  return {
    result: result,
    text: visOutput,
  };

  /* To get these, follow this code:
  var returnPICS = PICS(data);
  var resultReturn = returnPICS.result;
  var textOutput = returnPICS.text;
  Materialize.toast(returnPICS.text, 15000);
  */
}
