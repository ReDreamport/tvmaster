var TVSTOREX = TVSTOREX || {};

(function (Y) {
    // 应用特定方法集
    Y.app = {};
    // 缓存
    window.fast = Y.v = {};
    // 常量
    Y.c = {};
    Y.c.server_root = "http://115.29.15.202:8080/api/";
    Y.c.oss_root = "http://xiaocong.oss.aliyuncs.com/";
    Y.c.mq_url = "amqp://test:test@115.29.15.202/tvstorex?heartbeat=3";

    // 数据类工具方法
    Y.data = {};
    Y.data.local = {};
    Y.data.session = {};
    Y.data.remote = {};

    Y.data.local.getString = function (key) {
        return localStorage[key];
    };

    Y.data.local.setString = function (key, value) {
        localStorage[key] = value;
    };

    Y.data.local.getJSON = function (key) {
        var str = localStorage[key];
        return str && JSON.parse(str);
    };

    Y.data.local.setJSON = function (key, value) {
        localStorage[key] = JSON.stringify(value);
    };

    Y.data.session.getString = function (key) {
        return sessionStorage[key];
    };

    Y.data.session.setString = function (key, value) {
        sessionStorage[key] = value;
    };

    Y.data.remote.postJSON = function (url, jsonData) {
        return  $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(jsonData),
            contentType: "application/json; charset=UTF-8"
        });
    }

    //
    Y.ui = {};
    Y.ui.findByAttrite = function (name, value, $parent) {
        return $parent.find('[data-' + name + '="' + value + '"]');
    }

    //
    Y.service = {};
    Y.service.installApps = function (appIds, deviceSerialNos) {
        var req = {appIds: appids, deviceSerialNos: deviceSerialNos};
        Y.data.remote.postJSON('installations/' + Y.v.clientId, req)
            .done(function (res) {

            }).fail(function (jqXHR) {

            });
    }

})(TVSTOREX);