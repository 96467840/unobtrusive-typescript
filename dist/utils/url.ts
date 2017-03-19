// hash
import { HashString} from './lib';

export class Url {

    static SplitUrlParams(g: string): HashString {
        var l: HashString = {};
        var k = g.split("&");
        for (var h = 0, len = k.length; h < len; h++) {
            var e = k[h].split("=");
            var f = e[0];
            var m = e[1];
            m = decodeURIComponent(m.replace(/\+/g, " "));
            l[f] = m;
        }
        return l;
    }

    static GetFromLocation(): HashString {
        let l: HashString = {};
        let g = window.location.search;
        if (g) {
            g = g.substr(1);
            l = Url.SplitUrlParams(g);
        }
        return l;
    }

    static JoinUrlParams(g: HashString): string {
        var l = new Array();
        for (let i in g) {
            // в теории! в таком случае не надо проверять hasOwnProperty (see sample in https://www.typescriptlang.org/docs/handbook/modules.html)
            //if (g.hasOwnProperty(i)) {
            l.push(i + '=' + encodeURIComponent(g[i]));
            //}
        }
        return l.join('&');
    }
}/**/

