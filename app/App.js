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

    set loading(v){
        this.setAttribute('ui-spinner-is-active', v ? 'true' : 'false');
    }

    nav(hash){
        // TODO does this fire hashchange?
        window.location.hash = hash;
    }

    showRoute(hash){
        if (!hash) hash = '';
        if (hash.startsWith('#')) hash = hash.substring(1);

        if (hash === '') {
            this._views.innerText = 'Home';
        } else if (hash.startsWith('collections/')){
            this._views.innerText = hash;
        } else {
            this._views.innerText = 'not found';
        }
    }

    ready(){
        this._api = new AppApi(this.getAttribute("api-base-href"));
        this._views = document.getElementById('views');
        this._icons = _ICONS;

        window.addEventListener('hashchange', ()=>this.showRoute(window.location.hash));

        const collectionsElement = this.querySelector('#collections');
        this.api.modules().then((json)=>{
            const modules = json.data;
            modules.forEach((module)=>{
                const moduleType = new ModuleType(this, module);
                module.collections.forEach((collection)=>{
                    const type = new CollectionType(this, moduleType, collection);
                    const icon = new UIIcon(type.icon);
                    const label = Elements.h4().classes('is-small-label').text(type.plural).create();
                    const viewCreator = ()=>{
                        const view = type.createListView();
                        view.id = type.name + 'ListView';
                        this._views.appendChild(view);
                        return view;
                    };
                    const tab = new UITab(new UIBar([icon, label]), viewCreator, collection.plural);
                    collectionsElement.appendChild(tab);
                });
            });
        })
        .then(()=>this.showRoute(window.location.hash))
        .then(()=>this.loading=false);
    }
}
window.customElements.define('manage-app', App);

class ListAllView extends HTMLElement{
    constructor(app, type) {
        super();
        this._app = app;
        this._type = type;
        this._limit = 100;
        this._cursor = null;
    }
    get paged(){
        return (this._cursor);
    }
    connectedCallback(){
        this.refresh();
    }
    _createThead(fields){
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        thead.appendChild(tr);
        fields.forEach((field)=>{
            const th = document.createElement('th');
            th.innerText = field.label;
            tr.appendChild(th);
        });
        return thead;
    }
    refresh(){
        this._app.loading = true;
        this._app.api.listAll(this._type.module.name, this._type.name, this._limit, this._cursor).then((json)=>{
            // TODO build "load more" button as needed.
            const more = json.more;
            const items = json.data;
            const cursor = json.cursor;
            const fields = json.fields;
            const count = json.count;
            if (!count && !this.paged){
                // Blank slate view, only if not paged (TODO)
                this.innerText = 'no results, add one now';
                return;
            }
            if (more) this._cursor = cursor;
            const panel = new UIBox();
            const table = document.createElement('table');
            table.classList.add('model-table');
            panel.appendChild(table);
            table.appendChild(this._createThead(fields));
            const body = document.createElement('tbody');
            table.appendChild(body);
            items.forEach((item)=>{
                const tr = document.createElement('tr');
                if (item.id){
                    // TODO actual url
                    tr.setAttribute('data-href', item.id);
                }
                body.appendChild(tr);
                fields.forEach((field)=>{
                    const td = document.createElement('td');
                    // TODO formatting and interpretation, probably based on field type
                    td.innerText = item[field.name];
                    tr.appendChild(td);
                });
            })
            this.appendChild(panel); // TODO this isn't right... there may be an existing one.
        }).then(()=>this._app.loading=false);
    }
}
window.customElements.define('manage-list-all', ListAllView);

class ModuleType{
    constructor(app, module) {
        this._info = module;
    }

    get name(){
        return this._info.name;
    }
}

class CollectionType{
    constructor(app, module, info) {
        this._app = app;
        this._module = module;
        this._info = info;
    }

    get module(){
        return this._module;
    }

    get name(){
        return this._info.name;
    }

    get label(){
        return this._info.label;
    }

    get icon(){
        return this._app.icons.byName(this._info.icon.name);
    }

    get plural(){
        return this._info.plural;
    }

    createListView(){
        return new ListAllView(this._app, this);
    }
}

const _APPEND_QUERY_PARAM = (url, name, value)=>{
    if (!value) return url;
    const nv = name + '=' + value;
    return url.includes('?') ? url + '&' + nv : url + '?' + nv;
};

class AppApi{
    constructor(apiBase) {
        this._apiBase = apiBase;
    }

    modules(){
        return fetch(this._apiBase + '/modules')
            .then((response) => response.json());
    }

    listAll(moduleName, typeName, limit, cursor){
        let url = this._apiBase + '/modules/' + moduleName + '/collections/' + typeName + '/all';
        url = _APPEND_QUERY_PARAM(url, 'limit', limit);
        url = _APPEND_QUERY_PARAM(url, 'cursor', cursor);
        return fetch(url).then((response) => response.json());
    }
}