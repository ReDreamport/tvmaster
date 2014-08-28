(function (Y) {
    var gui = require && require("nw.gui");
    var win = gui && gui.Window.get();

    // body 跟随窗口大小
    var afterResizeWindow = function () {
        var $body = $('body');
        // 40 是标题栏高度
        var content_height = win.height - 40;
        $body.height(content_height);
        $('.page').height(content_height);
    };

    Y.app.signUp = function (callback) {
        var client = Y.data.local.getJSON("client");
        if (client && client.serialNo) {
            after(client);
        } else {
            Y.data.remote.postJSON(Y.c.server_root + 'controls/signup')
                .done(function (info) {
                    Y.data.local.setJSON("client", info);
                    after(info);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    alert("连接服务器失败" + jqXHR.statusCode);
                });
        }

        function after(client) {
            Y.v.clientId = client.id;
            Y.v.clientSerialNo = client.serialNo;
            Y.v.clientName = client.name || ("客户端#" + client.serialNo);
            $('.devicesDiv .me .clientName').html(Y.v.clientName);
            $('.devicesDiv .me .clientSerialNo').html(client.serialNo);

            callback && callback();
        }
    }

    var init = function () {
        afterResizeWindow();
        Y.app.signUp();
    };

    var setupEvents = function () {
        // 窗口
        $(window).resize(afterResizeWindow);
        $(".btn-close-win").click(function () {
            win.close();
        });
        $(".btn-refresh-win").click(function () {
            win.reload();
        });
        $(".btn-min-win").click(function () {
            win.minimize();
        });
        var win_max = false; // 创建是否最大化了
        $(".btn-max-win").click(function () {
            win_max ? win.maximize() : win.unmaximize();
            win_max = !win_max;
        });
        // 调试工具
        $(".btn-debug-tool").click(function () {
            win.showDevTools();
        });

        // 导航按钮
        $('.nav-item a').click(function () {
            $('.nav-item').removeClass('active');
            var $this = $(this);
            $this.parent().addClass('active');
            var target = $this.attr('data-target');
            $('.page').hide();
            $(target).show();
        });

        $('.app-list').on('mouseenter', '.app-item', function () {
            $(this).find('.back').show();
        }).on('mouseleave', '.app-item', function () {
            $(this).find('.back').hide();
        });

        $('.app-list').on('click', '.btn-install-app', function () {
            installApp($(this).closest('.app-item'));
        });

    };

    var installApp = function ($item) {
        var devices = Y.data.local.getJSON('devices');
        if (!(devices && devices.length > 0)) {
            alert('尚无设备连接，请先连接设备。');
            return;
        }

        var app = $item.data('app');

        if (devices.length > 1) {
            var $chooser = $(".device-chooser").empty();

            for (var i = devices.length - 1; i >= 0; --i) {
                var d = devices[i];
                var $div = $('<div>').appendTo($chooser);
                $('<input class="device" type="checkbox">').val(d.serialNo).appendTo($div);
                $div.append("&nbsp;&nbsp;" + d.name + "(" + d.serialNo + ")");
            }

            $chooser.dialog({model: true, buttons: [
                { text: "确定", click: function () {
                    $(this).dialog("close");
                    var deviceSerialNos = [];
                    $chooser.find('.device:checked').each(function (idx, ele) {
                        deviceSerialNos.push($(ele).val());
                    });
                    if (!deviceSerialNos.length) {
                        return;
                    }
                    Y.service.installApps([app._id], deviceSerialNos);
                } },
                { text: "取消", click: function () {
                    $(this).dialog("close");
                } }
            ] });
        }
    }

    // 显示应用列表
    var initApps = function () {
        var url = Y.c.server_root + "apps" + "?pageSize=30&pageNo=1";

        $.getJSON(url, function (apps) {
            var $list = $('.app-list');
            var $li_tmpl = $('.tmpl .app-item');

            apps.forEach(function (app) {
                var $li = $li_tmpl.clone().data('app', app);

                var icons;
                var iconUrl = app.icon && (icons = app.icon.split(";")) && icons[0];
                if (iconUrl) {
                    iconUrl = Y.c.oss_root + iconUrl;
                    $li.find('.icon').attr('src', iconUrl);
                }
                $li.find('.name').html(app.name);
                if (app.fileSize) {
                    $li.find('.fileSize').html("大小：" + (app.fileSize / 1000 / 1000) + "MB");
                }

                $list.append($li);
            });

        });

    };

    var initMQ = function () {
        var amqplib = require('amqplib').connect(Y.c.mq_url);

        Y.v.mq = amqplib.then(function (conn) {
            var gui = require('nw.gui');
            var win = gui.Window.get();

            conn.on('error', function (err) {
                alert('网络连接中断（MQ）');
                console.log(err);
                initMQ();
            });

            win.on('loading', function () {
                try {
                    conn.close();
                } catch (e) {
                }
            });

            win.on('closed', function () {
                try {
                    conn.close();
                } catch (e) {
                }
            });

            return conn.createChannel().then(function (ch) {
                return ch;
            });
        }).then(null, function () {
            setTimeout(function () {
                initMQ();
            }, 5000);
        });
    }

    $(function () {
        init();
        initMQ();
        setupEvents();
        initApps();
    });

})(TVSTOREX);