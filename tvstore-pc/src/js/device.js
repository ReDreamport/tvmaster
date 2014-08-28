(function (Y) {
    var setupEvents = function () {
        $('.btn-add-device').click(function () {
            var devices = Y.data.local.getJSON('devices') || [];

            var serialNo = $('.connect .serialNo').val();
            var connectKey = $('.connect .connectKey').val();
            var name = $('.connect .name').val();

            var device = _.find(devices, function (d) {
                return d.serialNo === serialNo
            });
            if (device) {
                alert('已在列表中中！');
                return;
            }

            var device = {serialNo: serialNo, connectKey: connectKey, name: name};
            devices.push(device);
            Y.data.local.setJSON("devices", devices);

            showDevice(device);
        });

        $('.device-list').on('click', '.btn-remove-device', function () {
            var $li = $(this).closest('.device-li').remove();
            var serialNo = $li.attr('data-serialNo');
            var devices = Y.data.local.getJSON('devices') || [];
            var devices_new = _.filter(devices, function (d) {
                return d.serialNo !== serialNo
            });
            Y.data.local.setJSON("devices", devices_new);
        });

        $('.device-list').on('click', '.btn-connect-device', function () {
            var $li = $(this).closest('.device-li');
            var serialNo = $li.attr('data-serialNo');
            var devices = Y.data.local.getJSON('devices') || [];
            var device = _.find(devices, function (d) {
                return d.serialNo === serialNo
            });
            device && connectDevice(device);
        });
    };

    var connectDevice = function (device) {
        var $li = Y.ui.findByAttrite('serialNo', device.serialNo, $('.device-list'));
        var $status = $li.find('.status');
        $status.html('连接中...').addClass("connecting");
        if (!Y.v.clientId) {
            Y.app.signUp(function () {
                connectDevice(device);
            });
        }
        var req = {clientId: Y.v.clientId, deviceSerialNo: device.serialNo, deviceConnectKey: device.connectKey};
        Y.data.remote.postJSON(Y.c.server_root + "connections", req)
            .done(function (res) {
                var devices = Y.data.local.getJSON('devices');
                var p_device = _.find(devices, function (d) {
                    return d.serialNo === device.serialNo;
                });

                var deviceId = res.deviceId;

                if (p_device) {
                    p_device.id = deviceId;
                    Y.data.local.setJSON('devices', devices);
                }

                Y.v.mq.then(function (channel) {
                    channel.assertExchange("connection", "topic", {durable: false});
                    var req = {controlSerialNo: Y.v.clientSerialNo, controlName: Y.v.clientName };
                    channel.publish("connection", "conn_req." + deviceId,
                        new Buffer(JSON.stringify(req)));
                    var queueName = "conn_res." + Y.v.clientSerialNo;
                    channel.assertQueue("conn_res." + Y.v.clientSerialNo, {durable: false}).then(function (q) {
                        channel.bindQueue(queueName, "connection", "conn_res." + Y.v.clientSerialNo).then(function () {
                            channel.consume(queueName, function (msg) {
                                if (msg) {
                                    var res = JSON.parse(msg.content.toString());
                                    if (res.status) {
                                        $status.html('连接成功').addClass("connected");
                                        return;
                                    }
                                }
                                $status.html('设备拒绝连接').addClass("rejected");
                            }, {noAck: true});
                        });
                    });
                }, function () {
                    $status.html('无法连接').addClass("fail");
                });
            }).fail(function (jqXHR, textStatus, errorThrown) {
                var res = jqXHR.responseText && JSON.parse(jqXHR.responseText);
                if (res && res.as400) {
                    $status.html(device.name + " [" + device.serialNo + "]: " + res.message).addClass("fail");
                } else {
                    $status.html('无法连接').addClass("fail");
                }
            });

    }

    var showDevice = function (device) {
        var $deviceList = $('.device-list');
        var $li = $('.tmpl .device-li').clone()
            .appendTo($deviceList).attr('data-serialNo', device.serialNo);
        $li.find('.name').html(device.name);
        setTimeout((function () {
            connectDevice(device)
        }), 10);
    };

    var init = function () {
        var devices = Y.data.local.getJSON('devices');
        if (!devices) {
            return;
        }

        for (var i = devices.length - 1; i >= 0; --i) {
            var device = devices[i];
            showDevice(device);
        }
    };

    $(function () {
        setupEvents();
        init();
    });


})(TVSTOREX);