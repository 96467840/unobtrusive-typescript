import { Item, ItemCollection, BaseItemCollection, BaseParams, BaseItem } from "./base";
import { Log } from './log';

export class App {
    public Collections: Array<BaseItemCollection<BaseItem<BaseParams>>>;

    constructor() {
        this.Collections = new Array<BaseItemCollection<BaseItem<BaseParams>>>();
    }

    public AddCollections(collections: Array<BaseItemCollection<BaseItem<BaseParams>>> = null): App {

        if (collections != null) {
            for (var i = 0, l = collections.length; i < l; i++) {
                this.Collections.push(collections[i]);
            }
        }
        return this;
    }
    public AddCollection(collection: BaseItemCollection<BaseItem<BaseParams>>): App {
        this.Collections.push(collection);
        return this;
    }

    public FindCollection(selector: string): BaseItemCollection<BaseItem<BaseParams>> {
        for (var i = 0, l = this.Collections.length; i < l; i++) {
            if (this.Collections[i].Params.Selector == selector) return this.Collections[i];
        }
        return null;
    }

    public AddDefaultCollections(selector: string = '.jsc-uts'): App {
        // базовая коллекция компонентов с поведением по умолчанию (думаю будет 50% таких компонентов)
        // создавать такие объекты будем самыми последними, так как наши сложные компоненты могут содержать простые компоненты с действием по умолчанию
        this.Collections.push(new ItemCollection({ Selector: selector } as BaseParams, this));
        return this;
    }

    // полная привязка (перепривязка) компонентов (если selectors != null то будут привязаны тока эти селекторы)
    public BindCollections(selectors: Array<string> = null): void {
        for (var i = 0, l = this.Collections.length; i < l; i++) {
            if (selectors == null || selectors.indexOf(this.Collections[i].Params.Selector) >= 0)
                this.Collections[i].BindCollection();
        }
    }

    public Loading(elements: Array<JQuery>): void {
        Log('App::Loading()', elements);
    }

    public Loaded(elements: Array<JQuery>): void {
        Log('App::Loaded()', elements);
    }

    public Run(callbacks: { before: (App: App) => void, ready: (App: App) => void } = null): App {
        //Log('run app...');
        let that = this;

        if (callbacks == null) callbacks = { before: function (App: App) { }, ready: function (App: App) { } };

        if (typeof callbacks.before === 'function') callbacks.before(that);
        $(document).ready(function () {
            that.BindCollections();
            if (typeof callbacks.ready === 'function') callbacks.ready(that);
        });
        return this;
    }
}
