CTFd._internal.challenge.data = undefined

CTFd._internal.challenge.renderer = CTFd.lib.markdown();

CTFd._internal.challenge.preRender = function() {}

CTFd._internal.challenge.render = function(markdown) {
    return CTFd._internal.challenge.renderer.render(markdown)
}

CTFd._internal.challenge.postRender = function() { loadInfo(); }

if ($ === undefined) $ = CTFd.lib.$;

function loadInfo() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    var params = {};

    CTFd.fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (window.t !== undefined) {
            clearInterval(window.t);
            window.t = undefined;
        }
        
        if (response.remaining_time === undefined) {
            $('#whale-panel').html('<div class="card" style="width: 100%;">' +
                '<div class="card-body">' +
                '<h5 class="card-title">环境信息</h5>' +
                '<button type="button" class="btn btn-primary card-link" id="whale-button-boot" onclick="CTFd._internal.challenge.boot()">启动题目环境</button>' +
                '</div>' +
                '</div>');
        } else {
            if (response.type === 'http') {
                $('#whale-panel').html('<div class="card" style="width: 100%;">' +
                    '<div class="card-body">' +
                    '<h5 class="card-title">环境信息</h5>' +
                    '<h6 class="card-subtitle mb-2 text-muted" id="whale-challenge-count-down">剩余时间: ' + response.remaining_time + 's</h6>' +
                    '<h6 class="card-subtitle mb-2 text-muted">内网域名: ' + response.lan_domain + '</h6>' +
                    '<p class="card-text">题目地址: <a href="http://' + response.domain + '" target="_blank">http://' + response.domain + '</a></p>' +
                    '<button type="button" class="btn btn-danger card-link" id="whale-button-destroy" onclick="CTFd._internal.challenge.destroy()">关闭题目环境</button>' +
                    '<button type="button" class="btn btn-success card-link" id="whale-button-renew" onclick="CTFd._internal.challenge.renew()">重置题目环境</button>' +
                    '</div>' +
                    '</div>');
            } else {
                $('#whale-panel').html('<div class="card" style="width: 100%;">' +
                    '<div class="card-body">' +
                    '<h5 class="card-title">环境信息</h5>' +
                    '<h6 class="card-subtitle mb-2 text-muted" id="whale-challenge-count-down">剩余时间: ' + response.remaining_time + 's</h6>' +
                    '<h6 class="card-subtitle mb-2 text-muted">内网域名: ' + response.lan_domain + '</h6>' +
                    '<p class="card-text">题目地址：' + response.ip + ':' + response.port + '</p>' +
                    '<button type="button" class="btn btn-danger card-link" id="whale-button-destroy" onclick="CTFd._internal.challenge.destroy()">关闭题目环境</button>' +
                    '<button type="button" class="btn btn-success card-link" id="whale-button-renew" onclick="CTFd._internal.challenge.renew()">重置题目环境</button>' +
                    '</div>' +
                    '</div>');
            }

            function showAuto() {
                const c = $('#whale-challenge-count-down')[0];
                if (c === undefined) return;
                const origin = c.innerHTML;
                const second = parseInt(origin.split(": ")[1].split('s')[0]) - 1;
                c.innerHTML = '剩余时间: ' + second + 's';
                if (second < 0) {
                    loadInfo();
                }
            }

            window.t = setInterval(showAuto, 1000);
        }
    });
};

CTFd._internal.challenge.destroy = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    $('#whale-button-destroy')[0].innerHTML = "关闭中...";
    $('#whale-button-destroy')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "题目环境已关闭！",
                button: "确认"
            });
        } else {
            $('#whale-button-destroy')[0].innerHTML = "关闭题目环境";
            $('#whale-button-destroy')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.msg,
                button: "确认"
            });
        }
    });
};

CTFd._internal.challenge.renew = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    $('#whale-button-renew')[0].innerHTML = "重置中...";
    $('#whale-button-renew')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "题目环境已重置！",
                button: "确认"
            });
        } else {
            $('#whale-button-renew')[0].innerHTML = "重置题目环境";
            $('#whale-button-renew')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.msg,
                button: "确认"
            });
        }
    });
};

CTFd._internal.challenge.boot = function() {
    var challenge_id = parseInt($('#challenge-id').val());
    var url = "/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    $('#whale-button-boot')[0].innerHTML = "启动中...";
    $('#whale-button-boot')[0].disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function(response) {
        if (response.success) {
            loadInfo();
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "题目环境已启动！",
                button: "确认"
            });
        } else {
            $('#whale-button-boot')[0].innerHTML = "启动题目环境";
            $('#whale-button-boot')[0].disabled = false;
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.msg,
                button: "确认"
            });
        }
    });
};


CTFd._internal.challenge.submit = function(preview) {
    var challenge_id = parseInt($('#challenge-id').val())
    var submission = $('#submission-input').val()

    var body = {
        'challenge_id': challenge_id,
        'submission': submission,
    }
    var params = {}
    if (preview)
        params['preview'] = true

    return CTFd.api.post_challenge_attempt(params, body).then(function(response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response
        }
        return response
    })
};
