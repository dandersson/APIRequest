APIRequest
==========

    APIRequest(url, data, callback);

Perform HTTP GET API request to `url` with a payload of the JavaScript object given as `data`, which is sent as an HTTP `GET` request. Treat the response as JSON and apply the function `callback` on it in parsed form.

The returned JSON is expected to have a boolean `success` field indicating whether the request was successful. If not, a status message is looked for in the `message` field.

Sample valid JSON response:

    {
        'success': true
        'data': {
            'my_field': 'my_data'
        }
    }

Sample error response:

    {
        'success': false
        'message': 'Invalid field request.'
    }

Requests not adhering to the above response format are treated as being malformed, returning `false` to the caller.

Minification
------------
The script is compatible with the [Google Closure Compiler](https://developers.google.com/closure/compiler/) in `ADVANCED_OPTIMIZATIONS` mode. When invoked with `make`, the included makefile produces such a minified version with the `.min.js` suffix in the root directory.

Software license
----------------
[Apache license, version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
