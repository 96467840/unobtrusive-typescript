import $ = require('jquery');
import { HashString, Lib } from './lib';

export class Button {
    private Title: string;
    private OnClick: () => void;
    private Class: string;
    private ElementName: string;
    private Attrs: HashString;

    // element с маленькой буквы (с большой у нас обычно называется объект типа Element)
    public element: JQuery;

    constructor(title: string, onclick: () => void, _class: string = 'btn btn-default', elementName: string = 'button', attrs: HashString = null) {
        let that = this;
        that.Title = title;
        that.OnClick = onclick;
        that.Class = _class;

        if (elementName == null) elementName = 'button';
        elementName = elementName.toLowerCase();
        if (elementName == 'a') {
            that.Attrs = $.extend({}, { /*href:'#',*/ 'class': that.Class }, attrs);
        } else {
            elementName = 'button';
            that.Attrs = $.extend({}, { type: 'button', 'class': that.Class }, attrs);
        }
        that.ElementName = elementName;

        that.Init().Render().BindCallback()
    }

    // чтение данных с атрибутов
    Init(): Button {
        //let that = this;

        return this;
    };

    // отрисовка компонента
    Render(): Button {
        let that = this;
        that.element = $('<' + that.ElementName + ' ' + Lib.RenderAttrs(that.Attrs) + '>' + that.Title + '</' + that.ElementName + '>');
        return that;
    };

    // навешиваем стандартные обработчики
    BindCallback(): Button {
        let that = this;

        if (typeof that.OnClick !== 'function') return that;
        let handler = that.OnClick;
        that.element.off('click', handler);
        that.element.on('click', handler);
        return that;
    };

    ToHtml(): JQuery {
        return this.element;
    }
}


export interface DialogParams {
    Title: string;
    Body: JQuery;
    ContainerClass: string;
    Backdrop: string;
    Class: string;
    Buttons: Array<Button>;
    Show: boolean;
    Selector: string;
    DestroyOnHiden: boolean;
    OnClose: () => void;
}

export class Dialog {
    private Params: DialogParams;
    private element: JQuery;
    private Element: Element;
    private Body: JQuery;
    private Footer: JQuery;

    // #region constructor destroy init render bind
    constructor(params: DialogParams, buttonClosePlace: number | null = -1, buttonCloseTitle: string = 'Cancel', btnCloseClass: string = 'btn btn-default') {
        let that = this;
        // установка значений по умолчанию
        params = $.extend({}, {
            Buttons: [],
            ContainerClass: '',
            Title: '',
            Backdrop: '',
            Show: false,
            Class: '',
            DestroyOnHiden: false,
            OnClose: () => { },
        }, params);

        this.Params = params;

        that.AddButtonClose(buttonClosePlace, buttonCloseTitle, btnCloseClass);

        this.Init().Render().BindCallback();
        if (this.Params.Show) {
            this.Show();
        }
    }

    Destroy(): void {
        // обязательно вернуть все в исходное состояние
        if (!this.Params.Selector) {
            // мы создали модал мы его и херим
            this.element.remove();
        }
    }

    // чтение данных с атрибутов
    Init(): Dialog {
        if (this.Params.Selector) {
            this.element = $(this.Params.Selector);
        }
        return this;
    };

    Render(): Dialog {
        //Log('-->', this.params.Selector);
        if (this.Params.Selector) {
            // создавать ничего не надо. уже все создано.
        } else {
            this.Draw();
        }

        this.Element = this.element[0];
        return this;
    }

    BindCallback(): Dialog {
        let that = this;
        let handler = that.Close.bind(that);
        that.element.find('.js-close').off('click', handler); // мы можем вызвать несколько раз BindCallback
        that.element.find('.js-close').on('click', handler)

        let closeHandler = function () {
            that.Params.OnClose();
            if (that.Params.DestroyOnHiden) that.Destroy();
        };
        that.element.off('hidden.bs.modal', closeHandler);
        that.element.on('hidden.bs.modal', closeHandler);

        return that;
    }
    // #endregion

    AddButtonClose(buttonClosePlace: number | null = -1, buttonCloseTitle: string = 'Cancel', btnClass: string = 'btn btn-default') {
        let that = this;
        if (buttonClosePlace != null) {
            let b = new Button(buttonCloseTitle, that.Close.bind(that), btnClass);
            if (buttonClosePlace == -1) {
                that.Params.Buttons.push(b);
            } else {
                that.Params.Buttons.splice(buttonClosePlace, 0, b);
            }
        }
    }

    UpdateButtons(buttons: Array<Button>, buttonClosePlace: number | null = -1, buttonCloseTitle: string = 'Cancel', btnCloseClass: string = 'btn btn-default') {
        let that = this;
        that.Footer.html('');
        that.Params.Buttons = buttons;

        that.AddButtonClose(buttonClosePlace, buttonCloseTitle, btnCloseClass);

        for (var i = 0, l = buttons.length; i < l; i++) {
            that.Footer.append(buttons[i].ToHtml());
        }
    }

    Draw() {
        let that = this;
        let addAttrs = '';
        if (that.Params.Backdrop) addAttrs += ' data-backdrop="' + that.Params.Backdrop + '"';
        that.element = $(
            '<div class="modal ' + that.Params.ContainerClass + '"' + addAttrs + '>'
            + '<div class="modal-dialog ' + that.Params.Class + '" role="document">'
            + '<div class="modal-content">'

            + '<div class="modal-header">'
            + (that.Params.Title ? '<h5 class="js-title">' + that.Params.Title + '</h5>' : '')
            + '<button type="button" class="close js-close" data-dismiss="modal" aria-label="Close">'
            + '<span aria-hidden="true">&times;</span>'
            + '</button>'
            + '</div>'
            
            + '<div class="modal-body">'
            + '</div>'
            + '<div class="modal-footer"></div>'
            + '</div>'
            + '</div>'
            + '</div>'
        );
        that.Footer = that.element.find('.modal-footer');
        if (!that.Params.Buttons) {
            that.Footer.addClass('hide');
        }
        that.Body = that.element.find('.modal-body');
        that.Body.append(that.Params.Body);

        //$('<a class="close"></a>').prependTo(this.element);

        if (this.Params.Buttons) {
            for (var i = 0, l = that.Params.Buttons.length; i < l; i++) {
                that.Footer.append(that.Params.Buttons[i].element);
            }
        }
        that.element.appendTo('body');
        /**/
    }

    Show(): Dialog {
        (<any>this.element).modal('show');
        return this;
    }

    Close(): boolean {
        (<any>this.element).modal('hide');
        return false;
    }
}

export class Prompt extends Dialog {
    constructor(title: string, text: string, btnAgreeTitle: string, btnCancelTitle: string, callback: any) {
        super(<DialogParams>{ DestroyOnHiden: true, Show: true, Title: title, Body: $('<p>' + text + '</p>'), Buttons: [new Button(btnAgreeTitle, callback, 'btn btn-primary')] }, 0, btnCancelTitle);
    }
}

export class Alert extends Dialog {
    constructor(title: string, text: string, btnOkTitle: string) {
        super(<DialogParams>{ DestroyOnHiden: true, Show: true, Title: title, Body: $('<p>' + text + '</p>'), Buttons: [] }, 0, btnOkTitle);
    }

}
