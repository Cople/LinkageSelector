# LinkageSelector

JavaScript 多级联动下拉菜单选择器

## 演示

[http://cople.github.io/LinkageSelector](http://cople.github.io/LinkageSelector)

## 安装

### CDN

```html
<script src="https://unpkg.com/linkage-selector/dist/linkage-selector.min.js"></script>
<!-- or jQuery Plugin -->
<script src="https://unpkg.com/linkage-selector/dist/jquery.linkage-selector.min.js"></script>
```

### NPM

```sh
npm install linkage-selector --save
```

## 使用

```html
<form id="demo1">
    <select><option>加载中</option></select>
    <select><option>加载中</option></select>
</form>

<form id="demo2">
    <!-- 也可以自动生成 select 元素 -->
</form>
```

```js
var selector1 = new LinkageSelector({
    container: '#demo1',
    data: data
});

var selector2 = new LinkageSelector({
    container: '#demo2',
    dataUrl: 'data.json',
    placeholder: ['省', '市', '区'],
    defaultValue: ['海南省', '三沙市', '西沙群岛'],
    onRender: function(els) {
        [].forEach.call(els, function(el) {
            el.className = 'form-control';
        });
    },
    onChange: function(value) {
    	console.log(`省：${value[0]}，市：${value[1]}，区：${value[2]}。`);
    }
});

// With jQuery
// $('#demo1').linkageSelector(options);
```

## 选项

| 参数           | 类型                     | 默认值                                      | 描述                                       |
| ------------ | ---------------------- | ---------------------------------------- | ---------------------------------------- |
| data         | object                 | {}                                       | 详见[数据结构](#数据结构)                          |
| dataUrl      | string                 | null                                     | 远程数据接口地址                                 |
| container    | string\|element        | document.body                            | 容器                                       |
| selector     | string                 | 'select'                                 | `select` 元素的选择器                          |
| placeholder  | string\|array\|boolean | '请选择'                                    | 下拉框的第一项，统一设置用 `string` ，分别设置用 `array`，不添加则为 `false`。（单个字符串格式可以为 `名称|值`） |
| defaultValue | array                  | null                                     | 默认值                                      |
| dataKeys     | object                 | { name: 'name', value: 'code', children: 'childs' } | 数据字段的键名                                  |
| required     | boolean                | true                                     | 是否添加 `required` 属性                       |
| emptyStyle   | string                 | 'disabled'                               | 下拉框为空时的处理方法：`disabled`(添加 `disabled` 属性) / `hidden`(隐藏元素) / none |
| onRender     | function               |                                          | 生成 `select`  元素时触发，参数为元素数组               |
| onChange     | function               |                                          | 下拉框值变化时触发，参数为值数组                         |

## 方法
| 名称                    | 返回值   | 描述     |
| --------------------- | ----- | ------ |
| setValue(value:array) |       | 设置下拉框值 |
| getValue()            | array | 获取值数组  |
| resetValue()          |       | 重置下拉框  |

## 数据结构

```json
[{
    "code": "11",
    "name": "北京市",
    "childs": [{
        "code": "1101",
        "name": "市辖区",
        "childs": [
            { "code": "110101", "name": "东城区" },
            { "code": "110102", "name": "西城区" },
            { "code": "110105", "name": "朝阳区" }]
    }]
}, {
    "code": "31",
    "name": "上海市",
    "childs": [{
        "code": "3101",
        "name": "市辖区",
        "childs": [
            { "code": "310101", "name": "黄浦区" },
            { "code": "310104", "name": "徐汇区" },
            { "code": "310105", "name": "长宁区" }]
    }]
}, {
    "code": "44",
    "name": "广东省",
    "childs": [{
        "code": "4401",
        "name": "广州市",
        "childs": [
            { "code": "440103", "name": "荔湾区" },
            { "code": "440104", "name": "越秀区" },
            { "code": "440105", "name": "海珠区" }]
    }]
}]
```

如果名称和值相同，也可以用紧凑型的 Object 对象：

```json
{
    "北京市": {
        "市辖区": ["东城区", "西城区", "朝阳区"]
    },
    "上海市": {
        "市辖区": ["黄浦区", "徐汇区", "长宁区"]
    },
    "广东省": {
        "广州市": ["荔湾区", "越秀区", "海珠区"]
    }
}
```

## License

[MIT](http://opensource.org/licenses/MIT)
