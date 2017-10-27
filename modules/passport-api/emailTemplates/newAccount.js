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
*/

var mjml2html = require("mjml").mjml2html;
var config = require("config");

exports.withPass = function(name, email, password) {
	var bURL = config.get("server.domain");
	return mjml2html(`<mjml>
	  <mj-head>
	    <mj-title>Your Passport ID</mj-title>
	    <mj-attributes>
	      <mj-all />
	      <mj-text font-size="16" />
	    </mj-attributes>
	  </mj-head>
	  <mj-body>
	    <mj-container background-color="#E0E0E0">
	      <mj-navbar background-color="#F44336">
	        <mj-column width="20%">
	          <mj-image width="300px" href="` + bURL + `" src="` + bURL + `/images/logo/48x48.png"></mj-image>
	        </mj-column>
	        <mj-column width="80%">
	          <mj-inline-links base-url="" hamburger="hamburger" ico-color="#ffffff">
	            <mj-link href="` + bURL + `/auth/login" color="#ffffff">Login</mj-link>
	            <mj-link href="https://github.com/poster983/Passport-Live" color="#ffffff">Project Page</mj-link>
	          </mj-inline-links>
	        </mj-column>
	      </mj-navbar>
	      <mj-hero mode="Fluid height" height="469px" background-width="600px" background-height="469px" background-url="https://source.unsplash.com/3l3RwQdHRHg/1600x900" background-color="#2a3448" padding="100px 0px">
	        <!-- To add content like mj-image, mj-text, mj-button ... use the mj-hero-content component -->
	        <mj-image width="148px" src="` + bURL + `/images/logo/full.svg"></mj-image>
	        <mj-hero-content width="100%">
	          	<mj-text padding="10px" color="#ffffff" font-family="Roboto" align="center" font-size="30" line-height="45px" font-weight="500">
				  Hi ` + name.first + `
				</mj-text>
				<mj-text padding="10px" color="#ffffff" font-family="Roboto" align="center" font-size="45" line-height="45px" font-weight="900">
				  Your New Passport ID
				</mj-text>
	          <mj-button href="` + bURL + `" background-color="#00B8D4" align="center">
	            Login Now
	          </mj-button>
	        </mj-hero-content>
	      </mj-hero>

	      <mj-spacer height="12px"  />
	      <mj-section padding="20px" background-color="#BDBDBD" border-radius="4px">
	        <mj-text padding="20px" color="#000" font-family="Roboto" align="center" font-size="30" line-height="45px" font-weight="900">
	          Login Info
	        </mj-text>
	        <mj-text>Email: <b>` + email + `</b></mj-text>
	        <mj-text>Password: <b>` + password + `</b></mj-text>
	        <mj-spacer height="6px" />
	        <mj-text>NOTE: You may be required to reset your password after you login.</mj-text>
	      </mj-section>
	      <mj-spacer height="12px"  />
	      <mj-section padding="20px" background-color="#BDBDBD" border-radius="4px">
	        <mj-text padding="20px" color="#000" font-family="Roboto" align="center" font-size="30" line-height="45px" font-weight="900">
	          Confused?
	        </mj-text>
	        <mj-text font-size="15" padding="20px">
	          Your administrator has added you to Passport, the online hall-pass system. Please talk to an admin if you have questions.
	        </mj-text>
	      </mj-section>
	      <mj-spacer height="12px"  />
	    </mj-container>
	  </mj-body>
	</mjml>`);
}

exports.withoutPass = function(name, email) {
	var bURL = config.get("server.domain");
	return mjml2html(`<mjml>
	  <mj-head>
	    <mj-title>Your Passport ID</mj-title>
	    <mj-attributes>
	      <mj-all />
	      <mj-text font-size="16" />
	    </mj-attributes>
	  </mj-head>
	  <mj-body>
	    <mj-container background-color="#E0E0E0">
	      <mj-navbar background-color="#F44336">
	        <mj-column width="20%">
	          <mj-image width="300px" href="` + bURL + `" src="` + bURL + `/images/logo/48x48.png"></mj-image>
	        </mj-column>
	        <mj-column width="80%">
	          <mj-inline-links base-url="" hamburger="hamburger" ico-color="#ffffff">
	            <mj-link href="` + bURL + `/auth/login" color="#ffffff">Login</mj-link>
	            <mj-link href="https://github.com/poster983/Passport-Live" color="#ffffff">Project Page</mj-link>
	          </mj-inline-links>
	        </mj-column>
	      </mj-navbar>
	      <mj-hero mode="Fluid height" height="469px" background-width="600px" background-height="469px" background-url="https://source.unsplash.com/3l3RwQdHRHg/1600x900" background-color="#2a3448" padding="100px 0px">
	        <!-- To add content like mj-image, mj-text, mj-button ... use the mj-hero-content component -->
	        <mj-image width="148px" src="` + bURL + `/images/logo/full.svg"></mj-image>
	        <mj-hero-content width="100%">
	          	<mj-text padding="10px" color="#ffffff" font-family="Roboto" align="center" font-size="30" line-height="45px" font-weight="500">
				  Hi ` + name.first + `
				</mj-text>
				<mj-text padding="10px" color="#ffffff" font-family="Roboto" align="center" font-size="45" line-height="45px" font-weight="900">
				  Your New Passport ID
				</mj-text>
	          <mj-button href="` + bURL + `" background-color="#00B8D4" align="center">
	            Login Now
	          </mj-button>
	        </mj-hero-content>
	      </mj-hero>

	      <mj-spacer height="12px"  />
	      <mj-section padding="20px" background-color="#BDBDBD" border-radius="4px">
	        <mj-text padding="20px" color="#000" font-family="Roboto" align="center" font-size="30" line-height="45px" font-weight="900">
	          Login Info
	        </mj-text>
	        <mj-text>Email: <b>` + email + `</b></mj-text>
	      </mj-section>
	      <mj-spacer height="12px"  />
	      <mj-section padding="20px" background-color="#BDBDBD" border-radius="4px">
	        <mj-text padding="20px" color="#000" font-family="Roboto" align="center" font-size="30" line-height="45px" font-weight="900">
	          Confused?
	        </mj-text>
	        <mj-text font-size="15" padding="20px">
	          Your administrator has added you to Passport, the online hall-pass system. Please talk to an admin if you have questions.
	        </mj-text>
	      </mj-section>
	      <mj-spacer height="12px"  />
	    </mj-container>
	  </mj-body>
	</mjml>`);
}