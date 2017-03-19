// либа
export interface HashString { [s: string]: string | any; }

export class Lib {

    static RenderAttrs(args: HashString): string {
        var l = new Array();
        for (let i in args) {
            // в теории! в таком случае не надо проверять hasOwnProperty (see sample in https://www.typescriptlang.org/docs/handbook/modules.html)
            //if (g.hasOwnProperty(i)) {
            let v: string = args[i];
            let n = i.replace(/[^a-z0-9\-_]/, '');
            if (!n) continue;
            l.push(n + '="' + v.replace('"', '&qoute;') + '"');
            //}
        }
        return l.join(' ');
    }
}