/**
 * Copyright 2015 Daniel Andersson
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @license Apache license, version 2.0
 * Upstream: <https://github.com/dandersson/APIRequest>
 */
'use strict';
/**
 * Perform HTTP GET API request to `url` with a payload of the JavaScript
 * object given as `data`, which is sent as an HTTP `GET` request. Treat the
 * response as JSON and apply the function `callback` on it in parsed form.
 *
 * The returned JSON is expected to have a boolean `success` field indicating
 * whether the request was successful. If not, a status message is looked for
 * in the `message` field.
 *
 * Sample valid JSON response:
 *
 *   {
 *     'success': true
 *     'data': {
 *       'my_field': 'my_data'
 *     }
 *   }
 *
 * Sample error response:
 *
 *   {
 *     'success': false
 *     'message': 'Invalid field request.'
 *   }
 *
 * Requests not adhering to the above response format are treated as being
 * malformed, returning `false` to the caller.
 *
 * @function
 */
var APIRequest = function APIRequestClosure() {
  /**
   * Utility logging function, checking for the existence of a console and
   * returning an appropriate message logging mechanism (in practice
   * `console.log` if it exists, none otherwise).
   *
   * @function
   */
  var logger = function loggerClosure() {
    if (window.console && window.console.log) {
      /**
       * @param {string} message The message to be logged.
       */
      return function loggerReturn(message) { console.log(message); }
    } else {
      return function noOp() {};
    }
  }();

  if (!window.XMLHttpRequest) {
    logger('XMLHttpRequest() not supported in this browser, aborting.');
    return false;
  }

  /**
   * Read a response as a JSON serialization and return the `data` field of the
   * corresponding JavaScript object. Report errors and return false if
   * unsuccessful. Report `JSON.parse` exceptions.
   *
   * @param {object} request An `XMLHttpRequest` object whose content will be
   * attempted to be parsed as a JSON structure before returning the
   * corresponding object.
   */
  function readResponseData(request) {
    var content;

    /**
     * Utility function for logging the HTTP response.
     */
    function logHttpResponse() {
      logger('HTTP status was: ' + request.status + ' ' + request.statusText);
      logger('Response content was:\n' + request.responseText);
    }

    try {
      content = JSON.parse(request.responseText);
    } catch (exception) {
      logger('JSON.parse exception occurred in handling API response.');
      logHttpResponse();
      return false;
    }

    if (!content['success']) {
      logger('Unsuccessful API return.')
      if (content['message']) {
        logger('API message was: ' + content['message']);
      } else {
        logger('No API message attached.')
      }
      logHttpResponse();
      return false;
    }

    return content['data'];
  }

  /**
   * Serialize JavaScript object to a PHP-compliant HTTP query string.
   *
   * @param {object} data A JavaScript object to serialize.
   * @param {string} prefix A token to handle encoding of arrays by recursion.
   */
  var buildQueryString = function buildQueryStringClosure(data, prefix) {
    var query_string_params = [];
    for (var field in data) {
      if (data.hasOwnProperty(field)) {
        var key = prefix ?
          prefix + "[" + field + "]" :
          field,
            value = data[field];
        query_string_params.push(
          typeof value === 'object' ?
            // Recurse on found objects to handle arrays.
            buildQueryString(value, key) :
            // …but pure strings are added as the endpoint of the recursion.
            encodeURIComponent(key) + '=' + encodeURIComponent(value)
        );
      }
    }
    return query_string_params.join('&');
  }

  // <https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Properties>
  var XMLHttpDone = 4;

  /**
   * Create a response event handler that applies callback to the returned JSON
   * response.
   *
   * @param {function} callback A function handle to a function that will be
   * applied to the returned JSON data structure.
   */
  function createResponseEventHandler(callback) {
    /**
     * @param {object} event A response event to be asynchronously checked for
     * request status changes.
     */
    return function createResponseEventHandlerReturn(event) {
      var request = event.currentTarget;
      if (request.readyState === XMLHttpDone) {
        callback(readResponseData(request));
      }
    }
  };

  /**
   * See main function description.
   *
   * @param {string} url The API URL to call.
   * @param {object} data A JavaScript object that will be serialized into an
   * HTTP GET request and used as payload for the API request.
   * @param {function} callback A function handle to a function that will be
   * applied on the object coming from the parsed JSON data returned from the
   * API.
   */
  return function APIRequestReturn(url, data, callback) {
    var handleResponse = createResponseEventHandler(callback);
    var request = new XMLHttpRequest();
    request.onreadystatechange = handleResponse;
    request.open('GET', url + '?' + buildQueryString(data), true);
    request.send();
  }
}();

/** Function exports for Closure Compiler. */
window['APIRequest'] = APIRequest;
