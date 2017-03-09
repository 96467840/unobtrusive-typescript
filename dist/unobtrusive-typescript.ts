import $ = require('jquery');
//import Url = require('./utils/url');
import * as URL from "./utils/url";

/*declare module "uts" {
    //export = $;
}
*/

let Log = function (...args: any[]) { };
var host = window.location.hostname;
var get = window.location.search;
var isDebug = (host == 'shop.2garin.com' || /\.test$/.test(host)); // тестовые серверы
//isDebug = true;
//console.log('============>', isDebug)
try {
    if (isDebug) Log = console.log.bind(window.console);
} catch (err) {
    
}
Log('====> debug mode = ', isDebug);


/**
* Делаем HTTP (Ajax) запрос.
*
* @param settings A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajaxSetup().
* @see {@link https://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings}
*/
const Ajax = (opts: JQueryAjaxSettings) => {
    // обязательно добавить в запрос тип возвращаемых данных
    if (opts.dataType == 'json') {
        if (opts.data == null) {
            opts.data = { datatype: 'json' }
        } else if (typeof opts.data === "string") {  // opts.data - строка
            let params = Url.split_url_params(opts.data);
            //params.datatype = 'json';
            //opts.data = Url.join_url_params(params);
        } else {                                     // opts.data - объект
            opts.data.datatype = 'json';
        }
    }
    if (opts.xhrFields == null || opts.xhrFields == undefined) {
        opts.xhrFields = {
            withCredentials: true
        };
    }
    if (opts.error == null) {
        opts.error = function (jqXHR, textStatus, errorThrown) {
            console.log('error:', textStatus, errorThrown);
        };
    }
    return $.ajax(opts);
};
