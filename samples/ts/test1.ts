//import { Log, Url } from '../../dist/unobtrusive-typescript';
import UTS = require('../../dist/unobtrusive-typescript');

//UTS.Log('Hello world', UTS.Url.get_from_location());
/*
class TestAjaxErrorContextClass {

    private t: string;
    public run() {
        this.t = 'TestAjaxErrorContext private property';
        UTS.Ajax({ url: '', data: {}, error: this.error.bind(this) });
    }

    public error() {
        UTS.Log('this.t = ' + this.t);
    }
}

let tmp = new TestAjaxErrorContextClass();
tmp.run();
/**/
let _app = new UTS.App();
_app
    //.AddCollection(new UTS.ItemCollection(<UTS.BaseParams>{ Selector: '.jsc-uts' }, _app))
    .AddDefaultCollections()
    .Run({
        before: function () { },
        ready: function (app: UTS.App) {
            UTS.Log('ready');
            app.FindCollectionBySelector('.jsc-uts').Invoke('hello');

            app.FindCollectionBySelector('.jsc-uts').Invoke('Say', null, ['Hello world', true]);

            /*let d = new UTS.Dialog(<UTS.DialogParams>{
                Show: true, Title: 'Test', Body: $('<p>Test dialog</p>'),
                Buttons: [new UTS.Button('Ok', function () { UTS.Log('Ok click'); }, 'btn btn-default js-close', 'button', { type: 'superbutton', 'data-s':'hello' })]
            }, 0, 'Close');/**/
            
        }
    });
