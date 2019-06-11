const _ = require('lodash');
const APIUtils = require('lib-core/APIUtils');
const SessionStore = require('lib-app/session-store');
const logging = false;

function processData (data, dataAsForm = false) {
    let newData;

    if(dataAsForm) {
        newData = new FormData();

        _.each(data, (value, key) => {
            newData.append(key, value);
        });

        newData.append('csrf_token', SessionStore.getSessionData().token);
        newData.append('csrf_userid', SessionStore.getSessionData().userId);
    } else {
        newData = _.extend({
            csrf_token: SessionStore.getSessionData().token,
            csrf_userid: SessionStore.getSessionData().userId
        }, data)
    }

    return newData;
}

module.exports = {
	logoutAlert: function(alerted) {
		console.log("Not overridden alert:" + alerted);
	},
    call: function ({path, data, plain, dataAsForm}) {
        if (logging) { console.log('request ' + path, data); }
        return new Promise(function (resolve, reject) {
            APIUtils.post(apiRoot + path, processData(data, dataAsForm), dataAsForm)
                .then(function (result) {
                    if (logging) { console.log(result); }

                    if (plain || result.status === 'success') {
                        resolve(result);
			    module.exports.logoutAlert(false);
                    } else if (reject) {
			    if (result.message == 'NO_PERMISSION' || result.message == 'INVALID_TICKET') {
				    if (path != '/ticket/close') {
					    module.exports.logoutAlert(true);
				    }
			    }
                        reject(result);
                    }
                })
                .catch(function (result) {
                    console.log('INVALID REQUEST');
                    console.log(result);
                    reject({
                        status: 'fail',
                        message: 'Internal server error'
                    });
                });
        });
    },

    getFileLink(filePath) {
        return apiRoot + '/system/download?file=' + filePath;
    },

    getAPIUrl() {
        return apiRoot;
    },

    getURL() {
        return root;
    }
};
