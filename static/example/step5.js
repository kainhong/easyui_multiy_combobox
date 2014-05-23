$.fn.category = {
    url: "/data/category"
};

$(function ($) {
    var proxies = {};

    function Proxy(target) {
        var self = this;
        this.target = $(target);

        function init() {
            this.target.data("proxy", this);
            this.categoryId = this.target.attr('category-id');
            if (!this.categoryId)
                return;
            this.parentCategoryId = this.target.attr('parent-category-id');
            
            this.target.combobox({
                valueField: 'id',
                textField: 'text',
                editable: false,
                method: 'GET',
                onChange: onChanged
            });

            if (!self.parentCategoryId)
                this.load();
        }

        this.load = function () {
            loadData();
        }

        this.reLoad = function (parent) {
            self.target.combobox('clear').trigger('onselected');
            loadData();
        }

        function onChanged() {
            var target = self.target;
            target.trigger('onChanged');
            if (self._onChange)
                self._onChange.call(target, arguments[0], arguments[1]);
        }

        function getUrl() {
            var url = $.fn.category.url + '?id=' + self.categoryId;
            if (self.parentCategoryId) {
                url = url + '&parentid=' + self.parentCategoryId;
                var parent = proxies["c_" + self.parentCategoryId].target;
                var val = parent.combobox("getValue");
                if (val)
                    url = url + "&parentitemid=" + val;
            }
            return url;
        }

        function loadData() {
            var url = getUrl();
            self.target.combobox("reload", url);
        }

        init.call(this);
    }

    Proxy.prototype.bind = function (event, handle) {
        this.target.bind(event, handle);
    }

    var selectedEventHandle = function (event) {
        var target = event.target;
        var proxy = $.data(target, "proxy");
        $.each(proxies, function (index, item) {
            if (item.parentCategoryId == proxy.categoryId)
                item.reLoad(proxy);
        });
    };

    var comboxes = $(".easyui-combobox");
    for (var i = 0; i < comboxes.length; i++) {
        var target = comboxes[i];
        var proxy = new Proxy(target);
        proxy.bind("onChanged", selectedEventHandle);
        proxies["c_" + proxy.categoryId] = proxy;
    }
});