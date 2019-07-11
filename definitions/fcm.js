/**
 * Firebase Cloud Messenger Prototype Class
 */
"use strict";

// Require unirest library
var unirest = require("unirest");

/**
 * Determine instance of object
 * @param {*} left 
 * @param {*} right 
 * @return {bool}
 */
function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

/**
 * Define Properties
 * @param {*} target 
 * @param {*} props 
 */
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

/**
 * Create Constructor Class
 * @param {*} Constructor 
 * @param {*} protoProps 
 * @param {*} staticProps 
 * @return {Constructor}
 */
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var FCM =
  /*#__PURE__*/
  (function() {
    /**
     * Constructor
     * @param {string} key 
     */
    function FCM(key) {
      this.body = {};

      if (key) {
        this.key = key;
      } else {
        this.key =
          "AAAAXbRSncs:APA91bE8Yq7h0wHq04AstyGDfFjoytkEr_MCndMqkqBZz4MkVamhyWy5OdBnUXJ_qedhjUn-MGDG5WCofCYHS-HA852C7iuSmJW_Id3sNgxf_cDsjfXc2BsSB9apMbvC2pIM-XEOPYnb";
      }

      this.body.collapse_key = "type_a";
    }

    var _proto = FCM.prototype;

    /**
     * Add new key in body json object
     * @param {string} name 
     * @param {object} data
     * @return {this}
     */
    _proto.add = function add(name, data) {
      if (typeof name === "string" || _instanceof(name, String)) {
        if (data) {
          this.body[name] = data;
        }
      }
      return this;
    };

    /**
     * Remove key in body json object
     * @param {string} name
     * @return {this}
     */
    _proto.remove = function remove(name) {
      if (typeof name === "string" || _instanceof(name, String)) {
        delete this.body[name];
      }
      return this;
    };

    /**
     * Add registration_ids key
     * @param {object} data
     * @return {this}
     */
    _proto.registration_ids = function registration_ids(data) {
      this.add("registration_ids", data);
      return this;
    };

    /**
     * Add collapse_key key
     * @param {object} data
     * @return {this}
     */
    _proto.collapse_key = function collapse_key(data) {
      this.add("collapse_key", data);
      return this;
    };

    /**
     * Add notifications key
     * @param {object} data
     * @return {this}
     */
    _proto.notifications = function notifications(data) {
      this.add("notifications", data);
      return this;
    };

    /**
     * Add data key
     * @param {object} data
     * @return {this}
     */
    _proto.data = function data(_data) {
      this.add("data", _data);
      return this;
    };

    /**
     * Get Body of json object
     * @return {object}
     */
    _proto.getBody = function getBody() {
      return this.body;
    };

    /**
     * Send Body json object to FCM
     * @param {callback} callback
     * @return {callback}
     */
    _proto.send = function send(callback) {
      unirest
        .post("https://fcm.googleapis.com/fcm/send")
        .headers({
          "Content-Type": "application/json",
          Authorization: "key=" + this.key
        })
        .send(this.body)
        .end(function(response) {
          return callback(response);
        });
    };

    /**
     * Create Class
     */
    _createClass(FCM, [
      {
        key: "key",
        set: function set(data) {
          this._key = data;
        },
        get: function get() {
          return this._key;
        }
      }
    ]);

    return FCM;
  })();

module.exports = FCM;
