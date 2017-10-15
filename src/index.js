if (!Array.from) {
    Array.from = function(arg) {
        return Array.prototype.slice.call(arg);
    };
}

if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

if (!Object.keys) {
    Object.keys = function(obj) {
        var res = [];
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                res.push(key);
            }
        }
        return res;
    };
}

if (!Object.assign) {
    Object.assign = function(target) {
        for (let i = 1; i < arguments.length; i++) {
            const source = arguments[i];
            for (let key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
}

function LinkageSelector(options) {
    this.settings = Object.assign({}, LinkageSelector.defaults, options);

    if (this.settings.dataUrl) {
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.init(JSON.parse(xhr.responseText));
            }
        };
        xhr.open('GET', this.settings.dataUrl, true);
        xhr.send();
    } else {
        this.init(this.settings.data);
    }
}

LinkageSelector.prototype = {
    constructor: LinkageSelector,

    convertToArrayData: function(data) {
        const keys = this.settings.dataKeys;

        function convertArray(arr) {
            return arr.map(name => {
                const item = {};
                item[keys.name] = name;
                item[keys.value] = name;
                return item;
            });
        }

        function convertObject(obj) {
            return Object.keys(obj).map(name => {
                const children = obj[name];
                const item = {};
                item[keys.name] = name;
                item[keys.value] = name;
                item[keys.children] = Array.isArray(children) ? convertArray(children) : convertObject(children);
                return item;
            });
        }

        return convertObject(data);
    },

    getDepth: function(data) {
        return Math.max.apply(Math, data.map(item => 1 + (item[this.settings.dataKeys.children] ? this.getDepth(item[this.settings.dataKeys.children]) : 0)));
    },

    setStyle: function(el, notEmpty) {
        switch (this.settings.emptyStyle) {
            case 'disabled':
                el.disabled = !notEmpty;
                break;
            case 'hidden':
                el.style.display = notEmpty ? 'inline-block' : 'none';
                break;
            default:
        }
    },

    getValue: function() {
        return this.selects.map(el => el.value);
    },

    setValue: function([firstValue, ...restValue], silent) {
        this.selects[0].value = firstValue;
        this.updateSelect(this.selects[1], ...restValue);
        if (!silent) this.settings.onChange.call(this, this.getValue());
    },

    resetValue: function(silent) {
        this.selects[0].selectedIndex = 0;
        this.updateSelect(this.selects[1]);
        if (!silent) this.settings.onChange.call(this, this.getValue());
    },

    updateSelect: function(el, elValue, ...restValue) {
        const lvl = this.selects.indexOf(el);
        const parentValue = this.selects[lvl - 1].value;
        const parentSelected = parentValue && (this.settings.placeholder ? !this.selects[lvl - 1].options[0].selected : true);

        this.setStyle(el, parentSelected);
        if (this.settings.required) el.required = parentSelected;

        el.options.length = this.settings.placeholder ? 1 : 0;
        el.selectedIndex = el.options.length - 1;

        if (parentSelected && this.selectOptions[lvl - 1]) {
            const keys = this.settings.dataKeys;

            this.selectOptions[lvl - 1].some(item => {
                if (item[keys.value] === parentValue) {
                    const children = item[keys.children];

                    this.selectOptions[lvl] = children;

                    children.forEach(child => el.options.add(new Option(child[keys.name], child[keys.value])));

                    if (elValue) el.value = elValue;

                    this.setStyle(el, !!children.length);
                    if (this.settings.required) el.required = !!children.length;

                    return true;
                }

                return false;
            });
        }

        if (lvl + 1 < this.selects.length) this.updateSelect(this.selects[lvl + 1], ...restValue);
    },

    init: function(data) {
        this.container = typeof this.settings.container === 'string' ? document.querySelector(this.settings.container) : this.settings.container;
        this.selects = Array.prototype.slice.call(this.container.querySelectorAll(this.settings.selector));
        this.data = Array.isArray(data) ? data : this.convertToArrayData(data);
        this.selectOptions = [this.data];

        if (!this.selects.length) {
            const frag = document.createDocumentFragment();

            for (let i = 0, depth = this.getDepth(this.data); i < depth; i++) {
                const el = document.createElement('select');
                this.selects.push(el);
                frag.appendChild(el);
            }

            this.settings.onRender.call(this, this.selects);
            this.container.appendChild(frag);
        }

        this.selects.forEach(el => {
            el.options.length = 0;
        });

        if (this.settings.placeholder) {
            const placeholder = this.settings.placeholder;

            this.selects.forEach((el, idx) => {
                const parts = (typeof placeholder === 'string' ? placeholder : placeholder[idx]).split('|');
                el.options.add(new Option(parts[0], parts[1], true, true));
                el.options[0].disabled = true;
            });
        }

        const firstSelect = this.selects[0];
        firstSelect.required = this.settings.required;
        this.data.forEach(item => {
            firstSelect.options.add(new Option(item[this.settings.dataKeys.name], item[this.settings.dataKeys.value]));
        });

        this.selects.slice(0, this.selects.length - 1).forEach((el, idx) => {
            el.addEventListener('change', () => this.updateSelect(this.selects[idx + 1]), false);
        });

        this.selects.forEach(el => {
            el.addEventListener('change', () => this.settings.onChange.call(this, this.getValue()), false);
        });

        if (this.settings.defaultValue) {
            this.setValue(this.settings.defaultValue, true);
        } else {
            this.selects.slice(1).forEach(el => this.setStyle(el, false));
        }
    }
};

LinkageSelector.defaults = {
    data: {},
    dataUrl: null,
    container: document.body,
    selector: 'select',
    placeholder: '请选择',
    defaultValue: null,
    dataKeys: { name: 'name', value: 'code', children: 'childs' },
    required: true,
    emptyStyle: 'disabled',
    onRender: function() {},
    onChange: function() {}
};

export default LinkageSelector;
