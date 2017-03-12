import $ = require('jquery');
import Url = require('./utils/url');
import {Log} from './utils/log';

//import * as Url from "./utils/url";

// сразу сделаем реэкспорт
export * from "./utils/url";
export * from "./utils/log";
export * from "./utils/ajax";

/*declare module "uts" {
    //export = $;
}
*/

//export class UTS{};
Log('uts loading...');