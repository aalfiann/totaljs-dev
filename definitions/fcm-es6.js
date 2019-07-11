/**
 * Firebase Cloud Messenger Class
 */
'use strict'
const unirest = require('unirest');

class FCM {

    /**
     * Constructor
     * @param {string} key 
     */
    constructor(key) {
        this.body = {};
        if(key) {
            this.key = key;
        } else {
            this.key =
          "AAAAXbRSncs:APA91bE8Yq7h0wHq04AstyGDfFjoytkEr_MCndMqkqBZz4MkVamhyWy5OdBnUXJ_qedhjUn-MGDG5WCofCYHS-HA852C7iuSmJW_Id3sNgxf_cDsjfXc2BsSB9apMbvC2pIM-XEOPYnb";
        }
        this.body.collapse_key = "type_a";
    }

    /**
     * Set key property
     */
    set key(data) {
        this._key = data;
    }
  
    /**
     * Get key property
     */
    get key() {
        return this._key;
    }

    /**
     * Add new key in body json object
     * @param {string} name 
     * @param {object} data
     * @return {this}
     */
    add(name,data) {
        if(typeof name === 'string' || name instanceof String){
            if(data) {
                this.body[name] = data;
            }
        }
        return this;
    }

    /**
     * Remove key in body json object
     * @param {string} name
     * @return {this}
     */
    remove(name) {
        if(typeof name === 'string' || name instanceof String){
            delete this.body[name];
        }
        return this;
    }

    /**
     * Add registration_ids key
     * @param {object} data
     * @return {this}
     */
    registration_ids(data) {
        this.add('registration_ids',data);
        return this;
    }

    /**
     * Add collapse_key key
     * @param {object} data
     * @return {this}
     */
    collapse_key(data) {
        this.add('collapse_key',data);
        return this;
    }

    /**
     * Add notifications key
     * @param {object} data
     * @return {this}
     */
    notifications(data) {
        this.add('notifications',data);
        return this;
    }

    /**
     * Add data key
     * @param {object} data
     * @return {this}
     */
    data(data) {
        this.add('data',data);
        return this;
    }
  
    /**
     * Get Body of json object
     * @return {object}
     */
    getBody() {
        return this.body;
    }

    /**
     * Send Body json object to FCM
     * @param {callback} callback
     * @return {callback}
     */
    send(callback){
        unirest.post('https://fcm.googleapis.com/fcm/send')
        .headers({
            'Content-Type': 'application/json',
            'Authorization': 'key='+this.key
        })
        .send(this.body)
        .end(function (response) {
          return callback(response);
        });
    }

}

module.exports = FCM;