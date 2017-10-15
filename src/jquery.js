import $ from 'jquery';

function LinkageSelector(options) {
    this.settings = $.extend({}, LinkageSelector.defaults, options);

    if (this.settings.dataUrl) {
        $.getJSON(this.settings.dataUrl, data => this.init(data));
    } else {
        this.init(this.settings.data);
    }
}

LinkageSelector.prototype = {
    constructor: LinkageSelector,

    convertToArrayData: function(data) {
        const keys = this.settings.dataKeys;

        function convertArray(arr) {
            return $.map(arr, name => {
                const item = {};
                item[keys.name] = name;
                item[keys.value] = name;
                return item;
            });
        }

        function convertObject(obj) {
            return $.map(obj, (children, name) => {
                const item = {};
                item[keys.name] = name;
                item[keys.value] = name;
                item[keys.children] = $.isArray(children) ? convertArray(children) : convertObject(children);
                return item;
            });
        }

        return convertObject(data);
    },

    getDepth: function(data) {
        return Math.max.apply(Math, $.map(data, item => 1 + (item[this.settings.dataKeys.children] ? this.getDepth(item[this.settings.dataKeys.children]) : 0)));
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
        return $.map(this.selects, el => el.value);
    },

    setValue: function(value, silent) {
        this.selects[0].value = value[0];
        this.updateSelect.apply(this, [this.selects[1]].concat(value.slice(1)));
        if (!silent) this.settings.onChange.call(this, this.getValue());
    },

    resetValue: function(silent) {
        this.selects[0].selectedIndex = 0;
        this.updateSelect(this.selects[1]);
        if (!silent) this.settings.onChange.call(this, this.getValue());
    },

    updateSelect: function(el, elValue) {
        const lvl = this.$selects.index(el);
        const parentValue = this.selects[lvl - 1].value;
        const parentSelected = parentValue && (this.settings.placeholder ? !this.selects[lvl - 1].options[0].selected : true);

        this.setStyle(el, parentSelected);
        if (this.settings.required) el.required = parentSelected;

        el.options.length = this.settings.placeholder ? 1 : 0;
        el.selectedIndex = el.options.length - 1;

        if (parentSelected && this.selectOptions[lvl - 1]) {
            const keys = this.settings.dataKeys;

            $.each(this.selectOptions[lvl - 1], (idx, item) => {
                if (item[keys.value] === parentValue) {
                    const children = item[keys.children];

                    this.selectOptions[lvl] = children;

                    $.each(children, (idx, child) => el.options.add(new Option(child[keys.name], child[keys.value])));

                    if (elValue) el.value = elValue;

                    this.setStyle(el, !!children.length);
                    if (this.settings.required) el.required = !!children.length;

                    return false;
                }

                return true;
            });
        }

        if (lvl + 1 < this.selects.length) this.updateSelect.apply(this, [this.selects[lvl + 1]].concat(Array.prototype.slice.call(arguments, 2)));
    },

    init: function(data) {
        this.$container = $(this.settings.container);
        this.container = this.$container[0];
        this.$selects = this.$container.find(this.settings.selector);
        this.selects = this.$selects.get();
        this.data = $.isArray(data) ? data : this.convertToArrayData(data);
        this.selectOptions = [this.data];

        if (!this.selects.length) {
            const frag = document.createDocumentFragment();

            for (let i = 0, depth = this.getDepth(this.data); i < depth; i++) {
                const el = document.createElement('select');
                this.selects.push(el);
                frag.appendChild(el);
            }

            this.$selects = $(this.selects);
            this.settings.onRender.call(this, this.selects);
            this.container.appendChild(frag);
        }

        this.$selects.each((idx, el) => {
            el.options.length = 0;
        });

        if (this.settings.placeholder) {
            const placeholder = this.settings.placeholder;

            this.$selects.each((idx, el) => {
                const parts = (typeof placeholder === 'string' ? placeholder : placeholder[idx]).split('|');
                el.options.add(new Option(parts[0], parts[1], true, true));
                el.options[0].disabled = true;
            });
        }

        const firstSelect = this.selects[0];
        firstSelect.required = this.settings.required;
        $.each(this.data, (idx, item) => {
            firstSelect.options.add(new Option(item[this.settings.dataKeys.name], item[this.settings.dataKeys.value]));
        });

        this.$selects.slice(0, this.selects.length - 1).each((idx, el) => {
            $(el).on('change', () => this.updateSelect(this.selects[idx + 1]));
        });

        this.$selects.on('change', () => this.settings.onChange.call(this, this.getValue()));

        if (this.settings.defaultValue) {
            this.setValue(this.settings.defaultValue, true);
        } else {
            this.$selects.slice(1).each((idx, el) => this.setStyle(el, false));
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

$.fn.linkageSelector = function(options, param) {
    if (typeof options === 'string') {
        return $.data(this[0], 'LinkageSelector')[options](param);
    } else {
        return this.each(function() {
            $.data(this, 'LinkageSelector', new LinkageSelector($.extend({ container: this }, options)));
        });
    }
};

$.fn.linkageSelector.defaults = LinkageSelector.defaults;

export default LinkageSelector;
