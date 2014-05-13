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

})(window.jsdapi = window.jsdapi || {});