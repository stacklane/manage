'use strict';

class Icons{
    constructor() {
        this._names = {};
    }

    putName(name, value){
        this._names[name] = value;
        return this;
    }

    byName(name){
        return this._names[name];
    }
}

const _ICONS = new Icons()
    .putName("globe", "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z\"/></svg>")
    .putName("user", "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\"/></svg>");

class App extends HTMLElement {
    constructor() {
        super();
    }

    get api(){
        return this._api;
    }

    get icons(){
        return this._icons;
    }

    ready(){
        this._api = new AppApi(this.getAttribute("api-base-href"));
        this._views = document.getElementById('views');
        this._icons = _ICONS;

        const collectionsElement = this.querySelector('#collections');
        this.api.modules().then((json)=>{
            const modules = json.data;
            modules.forEach((module)=>{
                module.collections.forEach((collection)=>{
                    const type = new CollectionType(this, collection);
                    const icon = new UIIcon(type.icon);
                    const label = Elements.h4().classes('is-small-label').text(type.plural).create();
                    const viewCreator = ()=>{
                        const view = Elements.div().create();
                        view.id = type.name;
                        view.innerText = type.plural;
                        this._views.appendChild(view);
                        return view;
                    };
                    const tab = new UITab(new UIBar([icon, label]), viewCreator, collection.plural);
                    collectionsElement.appendChild(tab);
                });
            });
        })
        .then(()=>this.removeAttribute('ui-is-init'));
    }
}
window.customElements.define('manage-app', App);

class CollectionType{
    constructor(app, info) {
        this._app = app;
        this._info = info;
    }

    get name(){
        return this._info.name;
    }

    get icon(){
        return this._app.icons.byName(this._info.icon.name);
    }

    get plural(){
        return this._info.plural;
    }
}

class AppApi{
    constructor(apiBase) {
        this._apiBase = apiBase;
    }

    modules(){
        return fetch(this._apiBase + '/modules')
            .then((response) => response.json());
    }

}