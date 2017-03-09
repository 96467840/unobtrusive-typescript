
function get_from_location(): any {
    let l: any = {};
    let g = window.location.search;
    if (g) {
        g = g.substr(1);
        l = Url.split_url_params(g);
    }
    return l;
};

function split_url_params(g: string): any {
    var l: any = {};
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

function join_url_params(g: any): string {
    var l = new Array();
    for (var i in g) {
        if (g.hasOwnProperty(i)) {
            l.push(i + '=' + encodeURIComponent(g[i]));
        }
    }
    return l.join('&');
};

declare module Url {

    export function get_from_location(): any;

    export function split_url_params(g: string): any;

    export function join_url_params(g: any): string;
}

/*declare module "url" {
    export = Url;
}*/
