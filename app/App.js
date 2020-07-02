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
    .putName("globe", "🌐")
    .putName("user", "👤");

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
        this._icons = _ICONS;

        const collectionsElement = this.querySelector('#collections');
        this.modules().then((json)=>{
            const modules = json.data;
            modules.forEach((module)=>{
                module.collections.forEach((collection)=>{
                    const icon = new UIIcon(this.icons.byName(collection.icon.name));
                    const label = Elements.h4().classes('is-small-label').text(collection.plural).create();
                    const button = new UIButton(icon, label);
                    // TODO button action
                    collectionsElement.appendChild(button);
                });
            });
        })
        .then(()=>this.removeAttribute('ui-is-init'));
    }
}
window.customElements.define('manage-app', App);

class AppApi{
    constructor(apiBase) {
        this._apiBase = apiBase;
    }

    modules(){
        return fetch(this._apiBase + '/modules')
            .then((response) => response.json());
    }

}