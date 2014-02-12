/*
Copyright (c) 2014, Intel Corporation

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Intel Corporation nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var r = require("request"),
	fs = require("fs");
    
function AuthUtil(utils, logger){
  var me = this;
  me.conf = utils.getConfig();
  me.logger = logger;
};

AuthUtil.prototype.getAccessToken = function(deviceId, success, error) {
	var me = this;
	if (!success) throw "Success callback required";
	
	fs.readFile(path.join(__dirname, '../access_token.json'),
		// if file does not exists, get a new token
		function(err, data){
			if(err){
				// Get access token
				me.httpRequest(me.conf.device_registration_url + '/deviceid/v1/deviceregistration/' + deviceId,
			        'GET',
			        function(status, response){
			            var accessToken = response.data.items[0].accessToken;
						success(accessToken);
			        },
			        function (status, response, headers) {
						error(status, response);
			        },
			        null,
			        {'Accept': 'application/json'}
			    );
			} else {
				success(data.toString());
			}
		}
	);
 };

 AuthUtil.prototype.httpRequest = function(url, operation, successCB, errorCB, params, headers) {
    var options = {
        url: url,
        method: operation,
        headers: headers,
        body: params
    };
    var req;
    function callback(error, res, body) {
        if(!error && res !== undefined) {
            if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204)  {
                if(res.statusCode != 204) {
                    var response = JSON.parse(body);
                    successCB(res.statusCode, response);
                } else {
                    successCB(res.statusCode, "Done");
                }
            } else {
                errorCB(res.statusCode, body, res.headers);
            }
        } else {
            errorCB(0, undefined, []);
        }
    }
    if(process.env.http_proxy != undefined){
        req = r.defaults({'proxy': process.env.http_proxy});
    } else {
        req = r;
    }
    req(options, callback);
};

exports.init = function(utils, logger) {
  return new AuthUtil(utils, logger);
};  
