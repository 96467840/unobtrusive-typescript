import $ = require('jquery');

export class Button {
    private title: string;
    private onclick: any;
    private class: string;

    // element с маленькой буквы (с большой у нас обычно называется объект типа Element)
    public element: JQuery;

    constructor(title: string, onclick: any, _class: string = 'btn-default') {
        this.title = title;
        this.onclick = onclick;
        this.class = _class;

        this.Init().Render().BindCallback()
    }

    // чтение данных с атрибутов
    Init(): Button {
        //this.regionid = this.element.data('id');
        return this;
    };

    // отрисовка компонента
    Render(): Button {
        this.element = $('<button type="button" class="btn ' + this.class + '">' + this.title + '</button>');
        return this;
    };

    // навешиваем стандартные обработчики
    BindCallback(): Button {
        if (typeof this.onclick !== 'function') return this;
        let that = this;
        this.element.on('click', that.onclick);
        return this;
    };

    ToHtml(): JQuery {
        return this.element;
    }
}


export interface ParamsDialog {
    Title: string;
    Body: JQuery;
    ContainerClass: string;
    Backdrop: string;
    Class: string;
    Buttons: Array<Button>;
    Show: boolean;
    Selector: string;
    DestroyOnHiden: boolean;
}

export class Dialog {
    private Params: ParamsDialog;
    private element: JQuery;
    private Element: Element;
    private Body: JQuery;
    private Footer: JQuery;

    // #region constructor destroy init render bind
    constructor(params: ParamsDialog, buttonClosePlace: number | null = -1, buttonCloseTitle: string = 'Cancel') {
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
        }, params);

        this.Params = params;

        that.AddButtonClose(buttonClosePlace, buttonCloseTitle);

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
        //console.log('-->', this.params.Selector);
        if (this.Params.Selector) {
            // создавать ничего не надо. уже все создано.
        } else {
            this.Draw();
        }

        this.Element = this.element[0];
        return this;
    }

    BindCallback(): Dialog {
        let that = this
        that.element.find('.close').on('click', that.Close.bind(that))
        if (that.Params.DestroyOnHiden)
            that.element.on('hidden.bs.modal', function () {
                that.Destroy();
            });

        return that;
    }
    // #endregion

    AddButtonClose(buttonClosePlace: number | null = -1, buttonCloseTitle: string = 'Отмена') {
        if (buttonClosePlace != null) {
            if (buttonClosePlace == -1) {
                this.Params.Buttons.push(new Button(buttonCloseTitle, this.Close.bind(this), 'btn-link'));
            } else {
                this.Params.Buttons.splice(buttonClosePlace, 0, new Button(buttonCloseTitle, this.Close.bind(this), 'btn-link'));
            }
        }
    }

    UpdateButtons(buttons: Array<Button>, buttonClosePlace: number | null = -1, buttonCloseTitle: string = 'Отмена') {
        this.Footer.html('');
        this.Params.Buttons = buttons;

        this.AddButtonClose(buttonClosePlace, buttonCloseTitle);

        for (var i = 0, l = buttons.length; i < l; i++) {
            this.Footer.append(buttons[i].ToHtml());
        }
    }

    Draw() {
        let addAttrs = '';
        if (this.Params.Backdrop) addAttrs += ' data-backdrop="' + this.Params.Backdrop + '"';
        this.element = $(
            '<div class="modal ' + this.Params.ContainerClass + '"' + addAttrs + '>'
            + '<div class="modal-dialog ' + this.Params.Class + '" role="document">'
            + '<div class="modal-content">'

            + '<div class="modal-header">'
            + (this.Params.Title ? '<h5 class="js-title">' + this.Params.Title + '</h5>' : '')
            + '<button type= "button" class="close" data-dismiss="modal" aria-label="Close">'
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
        this.Footer = this.element.find('.modal-footer');
        if (!this.Params.Buttons) {
            this.Footer.addClass('hide');
        }
        this.Body = this.element.find('.modal-body');
        this.Body.append(this.Params.Body);

        //$('<a class="close"></a>').prependTo(this.element);

        if (this.Params.Buttons) {
            for (var i = 0, l = this.Params.Buttons.length; i < l; i++) {
                this.Footer.append(this.Params.Buttons[i].element);
            }
        }
        this.element.appendTo('body');
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
        super(<ParamsDialog>{ DestroyOnHiden: true, Show: true, Title: title, Body: $('<p>' + text + '</p>'), Buttons: [new Button(btnAgreeTitle, callback, 'btn-primary')] }, 0, btnCancelTitle);
    }
}

export class Alert extends Dialog {
    constructor(title: string, text: string, btnOkTitle: string) {
        super(<ParamsDialog>{ DestroyOnHiden: true, Show: true, Title: title, Body: $('<p>' + text + '</p>'), Buttons: [] }, 0, btnOkTitle);
    }

}
