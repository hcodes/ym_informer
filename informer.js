/////////////////////////////////////////
// Универсальный информер Метрики
/////////////////////////////////////////


(function () {
    window.YMInformer = function (prefs) {
        this._setPrefs(prefs);
        this._init();
    }

    YMInformer.prototype = {
        constructor: YMInformer,
        _proxyUrl: '/ym_proxy.php',
        _jsonpUrl: (window.location.protocol == 'https:' ? 'https:' : 'http:') + '//mc.yandex.ru/informer/{c}/json?callback=',
        _setPrefs: function (prefs) {
            this._id = prefs.id;
            this._container = prefs.container;
            this._prefs = {
                height: prefs.height || 200, // высота информера в px
                refresh: typeof prefs.refresh == 'undefined' ? 180 || prefs.refresh, // время обновления данных в сек., 0 - без обновления
                type: prefs.type || 'chart' // тип информера: chart - график, table - таблица, param - один параметр 
            };
        },
        _init: function () {
            this._first = true;
            var el = document.createElement('div');
            el.className = 'ym-informer';
            this.container.appendChild(el);
        },
        /** Обновить данные у информера */
        update: function () {
            this._clearTimer();
            this._update();
        },
        _update: function () {
            if (this._busy) {
                return;
            }
            
            var that = this;
            this._busy = true;
            this._loadData(function (data) {
                that.setData(data);
                that._setTimer();
                that._busy = false;
            });
        },
        _loadData: function (callback) {
            if (prefs.proxy) {
                ajax(this._proxyUrl,{id: this._id, rnd: 1}, callback);
            } else {
                json(this._jsonUrl.replace(/\{c\}/, this._id), callback);
            }
        },
        /**
         * Сохранить данные в кеш
         * @param {Object} data - данные 
         */
        setData: function (data) {
            var buf;
            YMInformer._data[this._id] = buf;
        },
        _prepareData: function (id, data) {
            return;
        },
        /**
         * Получить данные из кеша
         * @return {Object}
         */
        getData: function () {
            return YMInformer._data[this._id];
        },
        _setTimer: function () {
            var that = this;
            if (!this._timer && this._prefs.refresh) {
                setInterval(function () {
                    that._update();
                }, prefs.refresh * 1000);
            }
        },
        _clearTimer: function () {
            if (this._timer) {
                clearInterval(this._timer);
                delete this._timer;
            }
        },
        /** Удалить информер */
        remove: function () {
            this._clearTimer();
        }
    };

    YMInformer._data = {};
})(this, this.document);