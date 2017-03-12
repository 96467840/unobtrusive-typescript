import $ = require('jquery');
import { App } from "./app";
import { Url } from "./url";
import { Ajax } from "./ajax";
import { Log } from './log';
import { Dialog } from './dialog';

/**
 * Базовый тип входных параметров для всех компонентов
 */
export interface ParamsBase {
    Selector: string;
}

/**
 * Базовый класс для всех компонентов
 */
export abstract class ItemBase<T extends ParamsBase>
{
    // #region Свойства

    /**
     * Html элемент на который вешается компонент
     */
    Element: Element;
    element: JQuery;

    /**
     * Копия входных параметров
     */
    protected Params: T;

    /**
     * Ссылка на фабрику
     */
    protected Collection: CollectionItemBase<ItemBase<T>>;

    // #endregion

    constructor(element: Element, params: T, collection: CollectionItemBase<ItemBase<T>>) {
        this.Params = params;
        this.Element = element;
        this.element = $(this.Element);
        this.Collection = collection;
    }

    /**
     * обязательно удалять объекты (если поштучно) именно через эту функцию
     */
    public Remove(): void {
        this.Collection.RemoveElement(this.Element);
    }

    /**
     * Удаление компонента (Html элемент не удалем, если нужно удалить Html элемент,
     * то сделать это снаружи самостоятельно, строго после выполнения Destroy())
     * Обязательно реализовать в своих компонентах и удалить и отвязать все события. Все что создали в компоненте
     */
    public abstract Destroy(): void;
}

/**
 * Базовая коллекция для всех компонентов
*/
export abstract class CollectionItemBase<T extends ItemBase<ParamsBase>>
{
    // #region Свойства

    // 
    /**
     * Уникальное имя коллекции. За уникальностью следим снаружи!
     * Возможно пригодится для поиска нужной коллекции на уровне приложения. Пока нигде не используется.
     * Пока для поиска используем Params.Selector
     */
    Name: string;

    /**
     * Копия входных параметров
     */
    Params: ParamsBase;

    /**
     * Коллекция компонентов
     */
    protected Collection: Array<T>;

    /**
     * Ссылка на приложение
     */
     public App: App;

    // #endregion

    constructor(params: ParamsBase, app: App, name: string = null) {
        if (name == null) {
            // не гарантирует уникальность, но пока так
            name = params.Selector.replace(/[^a-z0-9]+/i, '_').trim();
        }
        this.App = app;
        this.Name = name;
        this.Params = params;
        this.Collection = new Array<T>();
    };

    // #region Методы

    /**
     * Выполняем привязку компонентов в ДОМ
     */
    public BindCollection(): void {
        //Log('UpdateCollection:', this);
        let that = this;
        $(that.Params.Selector).each(function (index: Number, elem: Element) {
            // чтобы избежать повторного создания компонента 
            if ($(elem).data('__instance') == undefined) {
                let item = that.Сreate(elem, that.Params, that);
                $(elem).data('__instance', item);
                that.Collection.push(item);
            }
        });
    }

    /**
     * Выполняем вызов метода action на элементах elements (или на всех если elements=null) с параметрами params
     */
    public Invoke(action: string, elements: Array<T> = null, params: Array<any> | any = null): Array<any>
    {
        // так как мы юзаем apply при вызове функции то параметры надо загнать в массив
        if (!(params instanceof Array)) {
            params = [params];
        }
        let res: Array<any> = [];
        for (let i: number = 0, l: number = this.Collection.length; i < l; i++) {
            let e: any = this.Collection[i];
            if (elements != null && elements.indexOf(e) < 0) continue;
            if (typeof e[action] === 'function') {
                // чтобы вызвать, например, метод с 2 аргументами 
                // collection.Invoke("method", [param1, param2]);
                // вызовет на каждом элементе
                // element.method(param1, param2);
                res.push(e[action].apply(e, params));
            } else {
                // если объект в коллекции несодержит функцию значит и все остальные по идее тоже ее не содержат (коллекция состоит из одинаковых объектов)
                // сделаем вывод сообщения об ошибке (мало ли опечатались)
                Log('Error: Action "' + action + '" in collection "' + (this.Params.Selector) + '" not founded.');
                break;
            }
        }
        return res;
    }

    /**
     * Удаляем единичный экземпляр компонента 
     */
    public RemoveElement(element: Element): void {
        for (let i: number = 0, l: number = this.Collection.length; i < l; i++) {
            if (this.Collection[i].Element == element) {
                $(this.Collection[i].Element).data('__instance', undefined);
                this.Collection[i].Destroy();
                this.Collection.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Херим всю коллекцию целиком
     */
    public Destroy(): void {
        for (let i: number = 0, l: number = this.Collection.length; i < l; i++) {
            $(this.Collection[i].Element).data('__instance', undefined);
            this.Collection[i].Destroy();
        }
        this.Collection = null;
    }

    /**
     * В этом методе необходимо создать экземпляр компонента.
     * В этом методе просто вызывается конструктор экземпляра компонента
     */
    public abstract Сreate(element: Element, params: ParamsBase, collection: CollectionItemBase<T>): T;

    // #endregion
}

enum EnumInsertinMode {
    Replace = 1,
    Before,
    After,
}

// ------------------------------------------------------------------------
/**
 * Основной компонент который навешивается на .jsc-uts селектор (аналог unobtrusive ajax от microsoft)
 */
export class Item extends ItemBase<ParamsBase> {

    //#region Свойства

    /**
     * Url который будет вызван по клику (перехват onclick события на элементе)
     * Читается с атрибута "data-OnClickURL"
     */
    OnClickURL: string;
    /**
     * Url который будет вызван для отправки формы (перехват onsubmit события на элементе)
     * Читается с атрибута "data-OnSubmitURL"
     */
    OnSubmitURL: string;

    /**
     * Метод отправки запроса
     * Читается с атрибута "data-Method"
     */
    Method: string;

    /**
     * По плану здесь должен быть текст или html который показывается при выполнении запроса
     * Читается с атрибута "data-Loading"
     */
    //Loading: string;

    /**
     * Запретить показ элемента лоадинг
     * Читается с атрибута "data-DisableLoading"
     */
    DisableLoading: boolean;

    /**
     * Сделать запрос у юзера перед отправкой запроса. Текст запроса.
     * Читается с атрибута "data-Prompt"
     */
    Prompt: string;
    /**
     * Сделать запрос у юзера перед отправкой запроса. Заголовок запроса. (По умолчанию без заголовка)
     * Читается с атрибута "data-PromptTitle"
     */
    PromptTitle: string;
    /**
     * Сделать запрос у юзера перед отправкой запроса. Текст на кнопке согласия. (по умолчанию "Да")
     * Читается с атрибута "data-PromptYes"
     */
    PromptYes: string;
    /**
     * Сделать запрос у юзера перед отправкой запроса. Текст на кнопке отмены. (по умолчанию "Нет")
     * Читается с атрибута "data-PromptNo"
     */
    PromptNo: string;

    /**
     * Селектор контейнера для сообщений об ошибке. По умолчанию ошибка показывается в модальном окне.
     * Читается с атрибута "data-ErrorContainer"
     */
    ErrorContainer: string;
    /**
     * Селектор элементов которые надо скрыть перед запросом
     * Читается с атрибута "data-HideBefore"
     */
    HideBefore: string;
    /**
     * Селектор элементов которые надо скрыть после запроса
     * Читается с атрибута "data-HideAfter"
     */
    HideAfter: string;
    /**
     * Селектор элементов которые надо показать перед запросом
     * Читается с атрибута "data-ShowBefore"
     */
    ShowBefore: string;
    /**
     * Селектор элементов которые надо показать после запроса
     * Читается с атрибута "data-ShowAfter"
     */
    ShowAfter: string;
    /**
     * Селектор элементов которые надо очистить перед запросом
     * Читается с атрибута "data-ClearBefore"
     */
    ClearBefore: string;
    /**
     * Селектор элементов которые надо очистить после запроса
     * Читается с атрибута "data-ClearAfter"
     */
    ClearAfter: string;

    /**
     * Что нужно сделать с результатом выполнния запроса.
     * Читается с атрибута "data-InsertionMode"
     */
    InsertionMode: EnumInsertinMode; // before, after, replace (replace)
    /**
     * Селектор цели для выполнения операции InsertionMode
     * Читается с атрибута "data-target"
     */
    Target: string;

    //#endregion

    constructor(element: Element, params: ParamsBase, collection: CollectionItemBase<Item>) {
        super(element, params, collection);

        this.Init().Render().BindCallback();
    }

    // #region Методы

    /**
     * Отвязка событий. Этот компонент ничего не созадет нового.
     */
    Destroy(): void {
        let element: Element = this.Element;

        // обязательно вернуть все в исходное состояние
        if (this.OnClickURL) {
            // обязательно чистим события, так как предусматриваем повтороный (возможно и не будем) вызов фабрики после изменений
            $(element).off('click');
        }

    }

    /**
     * чтение данных с атрибутов
     */
    Init(): Item {
        let element: Element = this.Element;

        this.OnClickURL = $(element).data('onclickurl');
        this.OnSubmitURL = $(element).data('onsubmiturl');
        this.Method = $(element).data('method');
        this.HideBefore = $(element).data('hidebefore');
        this.HideAfter = $(element).data('hideafter');
        this.ShowBefore = $(element).data('showbefore');
        this.ShowAfter = $(element).data('showafter');
        this.ClearBefore = $(element).data('clearbefore');
        this.ClearAfter = $(element).data('clearafter');
        let InsertionMode: string = $(element).data('insertionmode');
        this.Target = $(element).data('target');

        this.Prompt = $(element).data('prompt');
        this.PromptTitle = $(element).data('prompttitle');
        this.PromptYes = $(element).data('promptyes');
        this.PromptNo = $(element).data('promptno');

        this.DisableLoading = $(element).data('disableloading')==1;
        //this.Loading = $(element).data('loading');
        //if (!this.Loading) this.Loading = '<div class="mdl-spinner mdl-js-spinner is-active loading"></div>';

        // get по умолчанию
        if (this.Method != 'post') this.Method = 'get';
        switch (InsertionMode) {
            case 'before': this.InsertionMode = EnumInsertinMode.Before; break;
            case 'after': this.InsertionMode = EnumInsertinMode.After; break;
            default: this.InsertionMode = EnumInsertinMode.Replace;
        }
        
        if (!this.PromptNo) this.PromptNo = 'Нет';
        if (!this.PromptYes) this.PromptYes = 'Да';
        return this;
    };

    /**
     * навешиваем стандартные обработчики
     */
    BindCallback(): Item {
        var element = this.Element;
        if (this.OnClickURL) {
            // обязательно чистим события, так как предусматриваем повтороный (возможно и не будем) вызов фабрики после изменений
            $(element).off('click');
            $(element).on('click', this.OnClick.bind(this));
        }
        /*if (this.OnSubmitURL) {
            $(element).on('submit', '.jsc-base', this.OnSubmit.bind(this));
        }/**/
        return this;
    };

    /**
     * отрисовка компонента
     */
    Render(): Item { return this; };

    /**
     * Показываем элемент "загрузка...""
     */
    ShowLoading(): void {
        if (this.DisableLoading) return;
        this.Collection.App.Loading([this.element]);
    };

    /**
     * Скрываем элемент "загрузка...""
     */
    HideLoading(): void {
        if (this.DisableLoading) return;
        this.Collection.App.Loaded([this.element]);
    };

    /**
     * отрисуем сообщение об ошибке
     */
    ShowError(message: string) {
        Log('ShowError(): ', message);
    };

    /**
     * Калбек на Submit
     */
    OnSubmit(): boolean {
        // сериализуем форму
        let data = $(this.Element).serialize();
        this.onAction(data);
        return false;
    };

    /**
     * Калбек на клик
     */
    OnClick(): boolean {

        this.onAction();
        return false;
    };

    /**
     * Выполнение запроса
     * аргумент строка или объект
     */
    private onAction(data: any = null): void {
        let that = this;
        if (that.Prompt) {

            return;
        }
        // что нужно сделать перед запросом. спросить юзера? показать колесико?
        if (that.HideBefore) {
            $(that.HideBefore).hide();
        }
        if (that.ClearBefore) {
            $(that.ClearBefore).html('');
        }
        if (that.ShowBefore) {
            $(that.ShowBefore).show();
        }
        that.ShowLoading();
        Ajax({
            url: that.OnClickURL,
            method: that.Method,
            dataType: 'json',
            data: data,
            success: function (data: any) {
                this.HideLoading();
                if (typeof data.error !== 'undefined') {
                    if (typeof data.errorcode !== 'undefined') {
                        // стандартные ошибки
                        switch (data.errorcode) {
                            case 'NEED_AUTH':
                                //that.ShowLogin(data.error);
                                break;
                            case 'NEED_REFRESH': // пропала сессия нужен релоад страницы
                                window.location.reload();
                                break;
                            default:
                                alert('Unknown standart error');
                        }
                    } else {
                        // кастомные ошибки
                        that.ShowError(data.error);
                    }
                } else {
                    if (that.Target) {
                        let html = '';
                        if (typeof data.html !== 'undefined') {
                            html = data.html;
                        }
                        // стандартное поведение на успех
                        switch (that.InsertionMode) {
                            case EnumInsertinMode.Before:
                                $(that.Target).before(html);
                                break;
                            case EnumInsertinMode.After:
                                $(that.Target).after(html);
                                break;
                            case EnumInsertinMode.Replace:
                                $(that.Target).replaceWith(html);
                                break;
                        }
                    }
                    if (that.HideAfter) {
                        $(that.HideAfter).hide();
                    }
                    if (that.ClearAfter) {
                        $(that.ClearAfter).html('');
                    }
                    if (that.ShowAfter) {
                        $(that.ShowAfter).show();
                    }
                }
            }
        });
    };

    //#endregion
}

// экземпляр стандартной коллекции стандартного класса
export class CollectionItem extends CollectionItemBase<Item> {
    constructor(params: ParamsBase, app: App) {
        super(params, app);
    };

    Сreate(element: Element, params: ParamsBase, collection: CollectionItem): Item {
        return new Item(element, params, collection);
    }
}
