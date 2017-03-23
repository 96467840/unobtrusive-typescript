import { Log } from './log';
//import Url = require('./url');
import { Url } from './url';
import { HashString } from './lib';


/**
* Делаем HTTP (Ajax) запрос.
*
* @param settings A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajaxSetup().
* @see {@link https://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings}
*/
export const Ajax = (opts: JQueryAjaxSettings) => {
    // обязательно добавить в запрос тип возвращаемых данных
    if (opts.dataType == 'json') {
        if (opts.data == null) {
            opts.data = { datatype: 'json' }
        } else if (typeof opts.data === "string") {  // opts.data - строка
            let params: HashString = Url.SplitUrlParams(opts.data);
            params['datatype'] = 'json';
            opts.data = Url.JoinUrlParams(params);
        } else {                                     // opts.data - объект
            opts.data.datatype = 'json';
        }
    }
    if (opts.xhrFields == null || opts.xhrFields == undefined) {
        opts.xhrFields = {
            withCredentials: true
        };
    }
    if (opts.error == null || typeof opts.error !== 'function') {
        opts.error = function (jqXHR, textStatus, errorThrown) {
            Log('error:', textStatus, errorThrown);
        };
    } else {
		let original = opts.error;
		opts.error = function (jqXHR, textStatus, errorThrown) {
			// никаких call, apply надо сохранить контекст вызова иногда это важно
			original(jqXHR, textStatus, errorThrown);
            Log('Ajax.error()', textStatus, errorThrown);
        };
	}
    return $.ajax(opts);
};
