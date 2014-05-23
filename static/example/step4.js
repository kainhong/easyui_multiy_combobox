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
            
            this.target.combobox({
                valueField: 'id',
                textField: 'text',
                editable: false,
                method:'GET',
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
            if (self._onChange )
                self._onChange.call(target, arguments[0],arguments[1]);
        }

        function getUrl() {
            var url = "/data/category" + '?id=' + self.categoryId;            
            return url;
        }

        function loadData() {
            var url = getUrl();
            self.target.combobox("reload", url);
        }

        /** why **/
        init.call(this);     
    }
    
    var comboxes = $(".easyui-combobox");
    for (var i = 0; i < comboxes.length; i++) {
        var target = comboxes[i];
        var proxy = new Proxy(target);         
        proxies["c_" + proxy.categoryId] = proxy;
    }

});