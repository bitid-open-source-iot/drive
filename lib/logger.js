/*
    Date:   2016-01-28
    Author: Shane Bowyer
*/

var log4js      = require( "log4js" );
var logger;

var module = function() {
    var pubLogger = {
        init: function (settings) {
            log4js.configure(settings);
            logger = log4js.getLogger("file-appender");
        },
        LogData: function(strError,strDebug) {
            try {
                if (strError != '') {
                    logger.error(strError);// store log in file
                } else {
                    if (__settings.showConsoleLogs == 1) {
                    }
                    logger.debug(strDebug);// store log in file
                };
                return;
            } catch(e) {
            };
        }
    };

    return pubLogger
};

exports.module = module;