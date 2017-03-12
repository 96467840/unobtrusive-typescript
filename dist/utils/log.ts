//import Url = require('./url');
import { Url } from './url';

export let Log = function (...args: any[]) { };
//export let Log = function () { };
let host = window.location.hostname;
let get = Url.get_from_location();
let isDebug = (get['__debug'] || /\.test$/.test(host)); // тестовые серверы
//isDebug = true;
//console.log('============>', isDebug)
try {
    if (isDebug) Log = console.log.bind(window.console);
} catch (err) {
    
}
Log('====> debug mode = ', isDebug);
