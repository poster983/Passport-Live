/*
Passport-Live is a modern web app for schools that helps them manage passes.
    Copyright (C) 2017  Joseph Hassell

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

email: hi@josephhassell.com


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
