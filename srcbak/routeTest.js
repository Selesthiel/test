(function(routeTest){
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
