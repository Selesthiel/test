/**
 * Created by jdoyle on 1/10/14.
 */
(function(jsdapi){
    "use strict";
    var apiVersion = "0.0.1";
    var dapiAuthToken,
        dapiApprovalToken,
        dapiServerURL = "http://10.178.18.145:1337";
        //dapiServerURL = "http://justin:1337";

    /**************************************************************************
     * P R I V A T E   M E T H O D S
     *************************************************************************/

    /**
     * Returns a URL-encoded query string generated from the javascript object
     * passed in. The properties of the object become the query arguments, the
     * values are JSON-encoded.
      * @param {object} query The javascript object from which to generate a
     * URL-encoded query string.
     * @returns {string} The URL-encoded query string.
     */
    var getQueryString = function(query){
        var queryString = "",
            prop;
        if (query !== undefined){
            for (prop in query){
                if (query.hasOwnProperty(prop)){
                    queryString = queryString === "" ? "?" : queryString + "&&";
                    queryString = queryString + prop + "=" + encodeURIComponent(JSON.stringify(query[prop]));
                }
            }
        }

        return queryString;
    };

    var parseResponse = function(response){
        return response;
    };

    /**
     * Perform an AJAX request to D:API Server with the given parameters. The
     * provided callback is invoked upon request completion. The callback is
     * invoked with the Javascript object decoded from the JSON-formatted
     * response.
     * TODO: Implement success/fail/timeout failure modes.
     * @param params {object} The request parameters as a JS Object. Any values
     * used in the request URL (such as the body or query arguments) are JSON
     * and URL-encoded.
     * @params.path {string} The RESTful request path to which the request will
     * be submitted.
     * @params.body {object} Key-value object containing the body of the request.
     * @param.query {object} Key-value object containing the query arguments to
     * submit with the request.
     * @param callback {function} Callback function to invoke on request
     * response.
     */
    var request = function(params, callback){
        var xhr = new XMLHttpRequest(),
            url,
            queryString,
            path = params.path || "",
            body = params.body !== undefined ? JSON.stringify(params.body) : "";

        queryString = getQueryString(params.query);
        url = dapiServerURL + path + queryString;

        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                if(xhr.status === 200){
                    callback(JSON.parse(xhr.responseText));
                } else {
                    callback(undefined);
                }
            }
        };

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(body);
        return;
    };

    jsdapi.request = request;
    /**************************************************************************
     * P R I V I L E D G E D   M E T H O D S
     *************************************************************************/

    jsdapi.approve = function(openid_identity, callback){
        var params = {};
        params.path = "/approve/" + encodeURIComponent(openid_identity);
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };
        request(params, function(response){
            if (response === undefined || response.status === "error" && response.approvalToken !== undefined){
                callback(undefined);
            } else {
                dapiApprovalToken = response.dapiApprovalToken;
                callback(dapiApprovalToken);
            }
        });
    };

    jsdapi.setApprovalToken = function(approvalToken){
        dapiApprovalToken = approvalToken;
        return this;
    };

    /**
     * Requests an auth token from D:API Server for this client.
     * @param clientID {string} The client-specific ID for this client.
     * @param clientSecret {string} The client-specific client secret.
     * @param callback {function} Invoke upon request response. The callback is
     * invoked with either the dapiAuthToken string OR undefined as its only
     * argument.
     */
    jsdapi.authenticate = function(clientID, clientSecret, callback){
        var params = {};
        params.path = "/auth";
        params.query = {
            "clientID": clientID,
            "clientSecret": clientSecret
        };

        callback = typeof callback === "function" ? callback : function(){};
        request(params, function(response){
            if (response === undefined || response.status === "error" && response.approvalToken !== undefined){
                callback(undefined);
            } else {
                dapiAuthToken = response.dapiAuthToken;
                callback(dapiAuthToken);
            }
        });
    };

    /**
     * Create a new client for D:API Server.
     * @param IDs {object} Must contain the productID and clientID.
     * @param IDs.productID {string} The D:API Product ID this client should be
     * associated with.
     * @param IDs.clientID {string} The unique ClientID to be created for this
     * client.
     * @param callback {function} Invoked upon request response. The sole
     * argument of the callback will be the newly-generated clientSecret or
     * undefined if the client is unable to be created.
     */
    jsdapi.addClient = function(IDs, callback){
        var params = {};
        params.path = "/client/add";
        params.query = {
            "dapiAuthToken": dapiAuthToken,
            "productID": IDs.productID,
            "clientID": IDs.clientID
        };

        request(params, function(response){
            callback(response.clientSecret);
        });
    };

    /**
     * Add a new grant in D:API.
     * @param licenseID {string}
     * @param userID {string}
     * @param productID {string}
     * @param callback
     */
    jsdapi.addGrant = function(licenseID, userID, productID, callback){
        var params = {};
        params.path = "/grant/add";
        params.query = {
            "dapiAuthToken": dapiAuthToken,
            "licenseID": licenseID,
            "userID": userID,
            "productID": productID
        };

        request(params, function(response){
            if (callback !== undefined){
                callback(response);
            }
        });
    };

    /**
     * Add a new license in D:API.
     * @param organizationID {string} The ID of the Organization
     * @param productID {string}
     * @param callback
     */
    jsdapi.addLicense = function(organizationID, productID, expiryDate, callback){
        var params = {};
        params.path = "/license/add";
        params.query = {
            "dapiAuthToken": dapiAuthToken,
            "organizationID": organizationID,
            "productID": productID,
            "expiryDate": expiryDate
        };

        request(params, function(response){
            if (callback !== undefined){
                callback(response);
            }
        });
    };

    /**
     * Add a new product in D:API.
     * @param productName {string} The name of the product
     * @param callback
     */
    jsdapi.addProduct = function(productName, callback){
        var params = {};
        params.path = "/product/add";
        params.query = {
            "dapiAuthToken": dapiAuthToken,
            "productName": productName
        };

        request(params, function(response){
            if (callback !== undefined){
                callback(response);
            }
        });

    };

    /**
     * Add a new user to D:API.
     * @param userName {string} The name of the user.
     * @param openIdIdentity {string} The openid_identity prodived by OpenID.
     * @param callback
     */
    jsdapi.addUser = function(userName, openIdIdentity, callback){
        var params = {};
        params.path = "/user/add";
        params.query = {
            "dapiAuthToken": dapiAuthToken,
            "userName": userName,
            "openIdIdentity": openIdIdentity
        };

        request(params, function(response){
            if (callback !== undefined){
                callback(response);
            }
        });
    };


    /**
     * Get a JSON-formatted list of client details.
     * @param callback
     */
    jsdapi.listClients = function(callback){
        var params = {};
        params.path = "/client/list";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, callback);
    };

    /**
     * Get a JSON-formatted list of export details.
     * @param callback
     */
    jsdapi.listExports = function(callback){
        var params = {};
        params.path = "/stat/exports";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, callback);
    };

    /**
     * Get a JSON-formatted list of license details.
     * @param callback
     */
    jsdapi.listGrants = function(callback){
        var params = {};
        params.path = "/grant/list";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, callback);
    };

    /**
     * Get a JSON-formatted list of license details.
     * @param callback
     */
    jsdapi.listLicenses = function(callback){
        var params = {};
        params.path = "/license/list";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, callback);
    };

    /**
     * Get a JSON-formatted list of product details.
     * @param callback
     */
    jsdapi.listProducts = function(callback){
        var params = {};
        params.path = "/product/list";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, callback);
    };

    /**
     * Get a JSON-formatted list of reoute details.
     * @param callback
     */
    jsdapi.listRoutes = function(callback){
        var params = {};
        params.path = "/stat/routes";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, callback);
    };

    /**
     * Get a JSON-formatted list of user details.
     * @param callback
     */
    jsdapi.listUsers = function(callback){
        var params = {};
        params.path = "/user/list";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, callback);
    };

    jsdapi.getServerLogs = function(callback){
        var params = {};
        params.path = "/logs/all";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, function(response){
            var res = response;
            callback(res.rawLogs);
        });
    };

    /**
     * Get the current uptime of the server as a JSON string.
     * @param callback
     */
    jsdapi.getUptime = function(callback){
        var params = {};
        params.path = "/stat/uptime";
        params.query = {
                "dapiAuthToken": dapiAuthToken
        };

        request(params, function(response){
            var res = response;
            callback(res.uptime);
        });
    };

    /**
     * Check if the given dapiAuthToken is valid and not expired.
     * @param authToken {string} The dapiAuthToken to validate.
     * @param callback
     */
    jsdapi.isValidAuthToken = function(authToken, callback){
        var params,
            isValid = false;

        if (typeof authToken === "function"){
            callback = authToken;
            authToken = dapiAuthToken;
        }
        params = {
            "path": "/auth/isValid",
            "query": {
                "dapiAuthToken": authToken
            }
        };
        if (authToken === undefined || authToken === ""){
            isValid = false;
            callback(isValid);
        } else {
            var isValidAuthTokenCallback = function(response){
                var res = JSON.parse(response);
                isValid = res.isValidAuthToken === "1";
                callback(isValid);
            };
            request(params, isValidAuthTokenCallback);
        }
    };

    /**
     * Sends an invalid request to D:API Server to ensure a proper failure
     * response is generated.
     * @param callback
     */
    jsdapi.testConnection = function(callback){
        var params = {"command": "this_will_fail"};

        var testCallback = function(response){
            var res = response;
            if (res.status !== undefined){
                callback(true);
            } else {
                callback(false);
            }
        };

        request(params, testCallback);
    };

    /**
     * Gets an OpenID Login URL for the client.
     * @param callback
     */
    jsdapi.getLoginUrl = function(callback){
        var params = {};
        params.path = "/openid/geturl";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, function(response){
            var res = response;
            callback(res.redirectURL);
        });
    };

    /**
     * Tell the D:API Server that we want the OpenID info for the user of this
     * client that is about to authenticate via the D:API OpenID login form.
     * @param callback
     */
    jsdapi.loginResponse = function(callback){
        var params = {};
        params.path = "/openid/loginResponse";
        params.query = {
            "dapiAuthToken": dapiAuthToken
        };

        request(params, function(response){
            var res;
            // We want to keep the connection open until we get an actual
            // response from the server. This will keep making requests even
            // if the server closes the connection/crashes/etc...
            if (response === undefined){
                jsdapi.loginResponse(callback);
            } else {
                res = response;
                callback(res.openidInfo);
            }
        });

        return this;
    };

})(window.jsdapi = window.jsdapi || {});;(function(routeTest){
    "use strict";
    var clientId = "routeTesterID",
        clientSecret = "NQ754XXNT5HWS42KHB30W625BRTPQX0MDRJMNTZ7",
        dapiAuthToken,
        outputDiv;

    /**************************************************************************
     * R O U T E   T E S T   M E T H O D S
     *************************************************************************/

    var testAddProduct = function(){
        return new Promise(function(resolve, reject){
            var params = {};
            params.path = "/product/add";
            params.query = {
                "dapiAuthToken": dapiAuthToken,
                "productName": "testProduct"
            };
            var x = 2;
            jsdapi.request(params, function(result){
                console.log(result);
                var content = "<div class='testTitle'>Add Product</div>";
                content = content + "<div class='route'>" + params.path + "</div>";
                content = content + "<div class='params'>Params:" + stringify(params.query) + "</div>";
                if (result.success === true){
                    content = content + "<div class='pass'>Passed</div>";
                } else {
                    content = content + "<div class='fail'>Fail</div>";
                }
                routeTest.postResults(content);
                resolve(content);
            });
        });
    };


    var testListProduct = function(){
        return new Promise(function(resolve, reject){
            var params = {};
            // Set the route here
            params.path = "/product/list";
            // Set the query arguments/parameters here
            params.query = {
                "dapiAuthToken": dapiAuthToken
            };

            jsdapi.request(params, function(result){
                // Build the HTML to display on the webpage
                var content = "<div class='testTitle'>List Product</div>";
                content = content + "<div class='route'>" + params.path + "</div>";
                content = content + "<div class='params'>Params:<br>" + stringify(params.query) + "</div>";

                // Test for pass/fail
                if (result !== undefined && result.length > 0){
                    content = content + "<div class='pass'>Passed</div>";
                } else {
                    content = content + "<div class='fail'>Fail</div>";
                }

                // Display the HTML on the webpage
                routeTest.postResults(content);

                // Move on to the next test
                resolve(content);
            });
        });
    };

    // USE THIS FUNCTION AS AN EXAMPLE/TEMPLATE FOR FUTURE FUNCTIONS
    var testListUsers = function(){
        return new Promise(function(resolve, reject){
            var params = {};
            // Set the route here
            params.path = "/user/list";
            // Set the query arguments/parameters here
            params.query = {
                "dapiAuthToken": dapiAuthToken
            };

            jsdapi.request(params, function(result){
                // Build the HTML to display on the webpage
                var content = "<div class='testTitle'>List Users</div>";
                content = content + "<div class='route'>" + params.path + "</div>";
                content = content + "<div class='params'>Params:<br>" + stringify(params.query) + "</div>";

                // Test for pass/fail
                // Check that there is a result and that its array length is not 0
                // (ie, not an empty array)
                if (result !== undefined && result.length > 0){
                    content = content + "<div class='pass'>Passed</div>";
                } else {
                    content = content + "<div class='fail'>Failed</div>";
                }

                // Comment/uncomment to toggle display of the raw server response
                content = content + stringify(result);

                // Display the HTML on the webpage
                routeTest.postResults(content);

                // Move on to the next test
                resolve(content);
            });
        });
    };

    var testApproval = function(){
        return new Promise(function(resolve, reject){
            var params = {};
            // Set the route here
            params.path = "/approve/1234";
            // Set the query arguments/parameters here
            params.query = {
                "dapiAuthToken": dapiAuthToken
            };

            jsdapi.request(params, function(result){
                // Build the HTML to display on the webpage
                var content = "<div class='testTitle'>Approval</div>";
                content = content + "<div class='route'>" + params.path + "</div>";
                content = content + "<div class='params'>Params:<br>" + stringify(params.query) + "</div>";

                // Test for pass/fail
                // Check that there is a result and that its array length is not 0
                // (ie, not an empty array)
                console.log(result);
                if (result !== undefined && result.error === "no grant for user/product"){
                    content = content + "<div class='pass'>Passed</div>";
                } else {
                    content = content + "<div class='fail'>Failed</div>";
                }

                // Display the HTML on the webpage
                routeTest.postResults(content);

                // Move on to the next test
                resolve(content);
            });
        });
    };


    /**************************************************************************
     * T E S T   C O N T R O L   M E T H O D S
     *************************************************************************/

    var executeTests = function(){
        /**
         * Execute the route tests.
         * @returns {this}
         */

        // invokeFunction(nameOfTheFunction, numberOfTimesToRun);

        // Run tests sequentially.
        authenticate().then(function(){
            return invokeFunction(testListProduct);
        }).then(function(){
            return invokeFunction(testAddProduct, 1);
        }).then(function(){
            return invokeFunction(testListUsers, 1);
        }).then(function(){
            return invokeFunction(testApproval, 1);
        });
        // Run tests in parallel.
        /*authenticate().then(function(){
            for (var i = 0; i < 1000; i++){
                invokeFunction(testListProduct)();
            }
        });*/

        return this;
    };

    /**************************************************************************
     * T E S T   C O N T R O L   M E T H O D S
     *************************************************************************/
    var authenticate = function(){
        /**
         * Authenticate with the dapi server
         */
        return new Promise(function(resolve, reject){
            if (dapiAuthToken === undefined){
                jsdapi.authenticate(clientId, clientSecret, function(authToken){
                    dapiAuthToken = authToken;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    };

    var invokeFunction = function(functionToInvoke, invokeXTimes){
        /**
         * Invoke the given function the given number of times sequentially.
         * @param functionToInvoke {function} The function to invoke
         * @param invokeXTimes {number} The number of times to invoke the function
         */
        invokeXTimes = invokeXTimes || 1;
        return new Promise(function(resolve, reject){
            functionToInvoke().then(function(){
                invokeXTimes--;
                if (invokeXTimes <= 0){
                    resolve();
                } else {
                    invokeFunction(functionToInvoke, invokeXTimes).then(resolve);
                }
            });
        });
    };

    /**************************************************************************
     * D I S P L A Y   M E T H O D S
     *************************************************************************/

    var stringify = function(object){
        /**
         * A wrapper for JSON.stringify.
         * stringify's an object, formats it, indents it 4 spaces, replaces \n with <br>, and
         * replaces spaces with &nbsp;
         */
        return JSON.stringify(object, null, 4)
            .replace(/\n/g, "<br>")
            .replace(/\s/g, "&nbsp;");
    };

    routeTest.postResults = function(content){
        /**
         * Append content to do the output div. If content is a string, the string will be appended.
         * Otherwise, content will be JSON.stringify'd and then appended.
         * @param content {*} Content to append to the output div
         * @returns {this}
         */
        if (typeof content !== "string"){
            content = JSON.stringify(content, null, 4)
                .replace(/\n/g, "<br>")
                .replace(/\s/g, "&nbsp;");
        }
        outputDiv.innerHTML = outputDiv.innerHTML + "<hr>" + content;

        return this;
    };

    /**************************************************************************
     * S T A R T   T E S T   M E T H O D S
     *************************************************************************/

    routeTest.startTest = function(outputDivId){
        /**
         * Ensure the store dapiAuthToken is valid and refresh it if needed, then run all the tests
         * defined in routeTest.
         * @param outputDivId {string} The DOM element id of the output div
         * @param callback {function} Callback function to invoke upon test completion
         * @returns {routeTest}
         */
        var result = "";
        outputDiv = document.getElementById(outputDivId);
        outputDiv.innerHTML = "";
        executeTests();

        return this;
    };

})(window.routeTest = window.routeTest || {});
