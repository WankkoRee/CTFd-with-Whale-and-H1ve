var challenges;
var user_solves = [];
var templates = {};

renderer = new markdownit({
    html: true,
    linkify: true,
});
submit = function (cb, preview) {
    var challenge_id = parseInt($('#challenge-id').val());
    var submission = $('#submission-input').val();
    var url = "/api/v1/challenges/attempt";

    if (preview) {
        url += "?preview=true";
    }

    var params = {
        'challenge_id': challenge_id,
        'submission': submission
    };

    CTFd.fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function (response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function (response) {
        cb(response);
    });
};
CTFd._internal = {};
window.challenge = {};
CTFd._internal.challenge = window.challenge;
CTFd.lib = {
  markdown: function(){}
};
CTFd.ui = {
  ezq: {
    ezAlert: ezal
  }
};

function loadchal(id) {
  var obj = $.grep(challenges, function(e) {
    return e.id == id;
  })[0];

  if (obj.type === "hidden") {
    ezal({
      title: "Challenge Hidden!",
      body: "You haven't unlocked this challenge yet!",
      button: "Got it!"
    });
    return;
  }

  updateChalWindow(obj);
}

function loadchalbyname(chalname) {
  var obj = $.grep(challenges, function(e) {
    return e.name == chalname;
  })[0];

  updateChalWindow(obj);
}

function updateChalWindow(obj) {
  $.get(script_root + "/api/v1/challenges/" + obj.id, function(response) {
    var challenge_data = response.data;

    $.getScript(script_root + obj.script, function() {
      $.get(script_root + obj.template, function(template_data) {
        $("#challenge-window").empty();
        var template = nunjucks.compile(template_data);
        window.challenge.renderer = renderer;
        window.challenge.submit = submit;
        window.challenge.data = challenge_data;
        window.challenge.preRender();

        // challenge 描述
        challenge_data["description"] = window.challenge.render(
          challenge_data["description"]
        );

        challenge_data["script_root"] = script_root;
        // console.log(challenge_data);
        $("#challenge-window").append(template.render(challenge_data));

        $(".challenge-solves").click(function(e) {
          getsolves($("#challenge-id").val());
        });
        $(".nav-tabs a").click(function(e) {
          e.preventDefault();
          $(this).tab("show");
        });

        // Handle modal toggling
        $("#challenge-window").on("hide.bs.modal", function(event) {
          $("#submission-input").removeClass("wrong");
          $("#submission-input").removeClass("correct");
          $("#incorrect-key").slideUp();
          $("#correct-key").slideUp();
          $("#already-solved").slideUp();
          $("#too-fast").slideUp();
        });

        const displayHint = data => {
          ezal({
            title: "Hint",
            body: window.challenge.render(data.content),
            button: "Got it!"
          });
        };

        const displayUnlock = id => {
          ezq({
            title: "Unlock Hint?",
            body: "Are you sure you want to open this hint?",
            success: () => {
              const params = {
                target: id,
                type: "hints"
              };
              CTFd.fetch(script_root + "/api/v1/unlocks", {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  target: id,
                  type: "hints"
                })
              }).then(function (response) {
                if (response.status === 429) {
                    // User was ratelimited but process response
                    return response.json();
                }
                if (response.status === 403) {
                    // User is not logged in or CTF is paused.
                    return response.json();
                }
                return response.json();
              }).then(function (response) {
                if (response.success) {
                  loadHint(id);
                  return;
                }
                ezal({
                  title: "Error",
                  body: window.challenge.render(response.errors.score),
                  button: "Got it!"
                });
              });
            }
          });
        };

        const loadHint = id => {
          $.get(script_root + "/api/v1/hints/" + id, function(response) {
            if (response.data.content) {
              displayHint(response.data);
              return;
            }
            displayUnlock(id);
          });
        };

        $(".load-hint").on("click", function(event) {
          loadHint($(this).data("hint-id"));
        });

        $("#submit-key").click(function(e) {
          e.preventDefault();
          $("#submit-key").addClass("disabled-button");
          $("#submit-key").prop("disabled", true);
          window.challenge.submit(function(data) {
            renderSubmissionResponse(data);
            loadchals(function() {
              marksolves();
            });
          });
        });
        // start button
        $("#start-key").click(function(e) {
          e.preventDefault();
          $("#start-key").addClass("disabled-button");
          $("#start-key").prop("disabled", true);
          $("#delete-key").addClass("disabled-button");
          $("#delete-key").prop("disabled", true);
          window.challenge.start(function(data) {
            renderStartResponse(data);
            loadchals(function() {
              marksolves();
            });
          });
        });

        // deleete button
        $("#delete-key").click(function(e) {
          e.preventDefault();
          $("#start-key").addClass("disabled-button");
          $("#start-key").prop("disabled", true);
          $("#delete-key").addClass("disabled-button");
          $("#delete-key").prop("disabled", true);
          window.challenge.delete(function(data) {
            renderDeleteResponse(data);
            loadchals(function() {
              marksolves();
            });
          });
        });

        $("#submission-input").keyup(function(event) {
          if (event.keyCode == 13) {
            $("#submit-key").click();
          }
        });

        $(".input-field").bind({
          focus: function() {
            $(this)
              .parent()
              .addClass("input--filled");
            $label = $(this).siblings(".input-label");
          },
          blur: function() {
            if ($(this).val() === "") {
              $(this)
                .parent()
                .removeClass("input--filled");
              $label = $(this).siblings(".input-label");
              $label.removeClass("input--hide");
            }
          }
        });

        window.challenge.postRender();

        window.location.replace(
          window.location.href.split("#")[0] + "#" + obj.name
        );
        $("#challenge-window").modal();
      });
    });
  });
}

$("#submission-input").keyup(function(event) {
  if (event.keyCode == 13) {
    $("#submit-key").click();
  }
});

function renderSubmissionResponse(response, cb) {
  var result = response.data;
  var result_message = $("#result-message");
  var result_notification = $("#result-notification");
  var answer_input = $("#submission-input");
  result_notification.removeClass();
  result_message.text(result.message);
  // console.log(result);
  if (result.status === "authentication_required") {
    window.location =
      script_root +
      "/login?next=" +
      script_root +
      window.location.pathname +
      window.location.hash;
    return;
  } else if (result.status === "incorrect") {
    // Incorrect key
    result_notification.addClass(
      "alert alert-danger alert-dismissable text-center"
    );
    result_notification.slideDown();


    answer_input.removeClass("correct");
    answer_input.addClass("wrong");
    setTimeout(function() {
      answer_input.removeClass("wrong");
    }, 3000);
  } else if (result.status === "correct") {
    // Challenge Solved
    result_notification.addClass(
      "alert alert-success alert-dismissable text-center"
    );
    result_notification.slideDown();

    $(".challenge-solves").text(
      parseInt(
        $(".challenge-solves")
          .text()
          .split(" ")[0]
      ) +
        1 +
        " 人已解出"
    );

    answer_input.val("");
    answer_input.removeClass("wrong");
    answer_input.addClass("correct");
    var socket=io();
    console.log('有人提交Flag啦');
    var mes="有人提交Flag啦";
    socket.emit('rank_socket',mes);

  } else if (result.status === "already_solved") {
    // Challenge already solved
    result_notification.addClass(
      "alert alert-info alert-dismissable text-center"
    );
    result_notification.slideDown();

    answer_input.addClass("correct");
  } else if (result.status === "paused") {
    // CTF is paused
    result_notification.addClass(
      "alert alert-warning alert-dismissable text-center"
    );
    result_notification.slideDown();
  } else if (result.status === "ratelimited") {
    // Keys per minute too high
    result_notification.addClass(
      "alert alert-warning alert-dismissable text-center"
    );
    result_notification.slideDown();

    answer_input.addClass("too-fast");
    setTimeout(function() {
      answer_input.removeClass("too-fast");
    }, 3000);
  }
  setTimeout(function() {
    $(".alert").slideUp();
    $("#submit-key").removeClass("disabled-button");
    $("#submit-key").prop("disabled", false);
  }, 3000);

  if (cb) {
    cb(result);
  }
}

function renderStartResponse(response, cb) {
  var result = response.data;
  var result_message = $("#result-message");
  var instance = $("#instance");
  var result_notification = $("#result-notification");
  var answer_input = $("#submission-input");
  result_notification.removeClass();
  result_message.text(result.message);
  // console.log(result.instance);
  if (result.status === "authentication_required") {
    window.location =
      script_root +
      "/login?next=" +
      script_root +
      window.location.pathname +
      window.location.hash;
    return;
  } else if (result.status === "success") {
    // Start failed
    result_notification.addClass(
      "alert alert-success alert-dismissable text-center"
    );
    instance.text(result.instance);
    result_notification.slideDown();
    instance.slideDown();

    answer_input.removeClass("correct");
    answer_input.addClass("wrong");
    setTimeout(function() {
      answer_input.removeClass("wrong");
    }, 3000);
    // Start success
  } else if (result.status === "failed") {
    // Challenge Solved
    result_notification.addClass(
      "alert alert-danger alert-dismissable text-center"
    );
    result_notification.slideDown();

    answer_input.val("");
    answer_input.removeClass("wrong");
    answer_input.addClass("correct");
  } else if (result.status === "already_started") {
    // Challenge already solved
    result_notification.addClass(
      "alert alert-info alert-dismissable text-center"
    );
    instance.text(result.instance);
    instance.slideDown();
    result_notification.slideDown();

    answer_input.addClass("correct");
  }
  setTimeout(function() {
    $(".alert").slideUp();
    $("#start-key").removeClass("disabled-button");
    $("#start-key").prop("disabled", false);
    $("#delete-key").removeClass("disabled-button");
    $("#delete-key").prop("disabled", false);
  }, 3000);

  if (cb) {
    cb(result);
  }
}

function renderDeleteResponse(response, cb) {
  var result = response.data;
  var result_message = $("#result-message");
  var instance = $("#instance");
  var result_notification = $("#result-notification");
  var answer_input = $("#submission-input");
  result_notification.removeClass();
  result_message.text(result.message);
  // console.log(result);
  if (result.status === "authentication_required") {
    window.location =
      script_root +
      "/login?next=" +
      script_root +
      window.location.pathname +
      window.location.hash;
    return;
  } else if (result.status === "success") {
    // Start failed
    result_notification.addClass(
      "alert alert-success alert-dismissable text-center"
    );
    result_notification.slideDown();
    instance.slideUp();

    answer_input.removeClass("correct");
    answer_input.addClass("wrong");
    setTimeout(function() {
      answer_input.removeClass("wrong");
    }, 3000);
    // Start success
  } else if (result.status === "failed") {
    // Challenge Solved
    result_notification.addClass(
      "alert alert-danger alert-dismissable text-center"
    );
    result_notification.slideDown();

    answer_input.val("");
    answer_input.removeClass("wrong");
    answer_input.addClass("correct");
  } else if (result.status === "not_started") {
    // Challenge already solved
    result_notification.addClass(
      "alert alert-info alert-dismissable text-center"
    );
    result_notification.slideDown();

    answer_input.addClass("correct");
  }
  setTimeout(function() {
    $(".alert").slideUp();
    $("#start-key").removeClass("disabled-button");
    $("#start-key").prop("disabled", false);
    $("#delete-key").removeClass("disabled-button");
    $("#delete-key").prop("disabled", false);
  }, 3000);

  if (cb) {
    cb(result);
  }
}


function marksolves(cb) {
  $.get(script_root + "/api/v1/" + user_mode + "/me/solves", function(
    response
  ) {
    var solves = response.data;
    for (var i = solves.length - 1; i >= 0; i--) {
      var id = solves[i].challenge_id;
      var btn = $('button[value="' + id + '"]');
      btn.addClass("solved-challenge");
      btn.prepend("<i class='fas fa-check corner-button-check'></i>");
    }
    if (cb) {
      cb();
    }
  });
}

function load_user_solves(cb) {
  if (authed) {
    $.get(script_root + "/api/v1/" + user_mode + "/me/solves", function(
      response
    ) {
      var solves = response.data;

      for (var i = solves.length - 1; i >= 0; i--) {
        var chal_id = solves[i].challenge_id;
        user_solves.push(chal_id);
      }
      if (cb) {
        cb();
      }
    });
  } else {
    cb();
  }
}
const classsignMap  = {
  "205601401": "计算机20.1本",
  "205612401": "网络20.2本",
  "205615401": "智能20.3本",
  "205614401": "数据20.4本",
  "206310401": "物联网20.5本",
  "205606401": "软件20.6本",
  "205606402": "软件20.7本",
  "205606403": "软件20.8本",
  "205606404": "软件20.9本",
  "205606405": "软件20.10本",
  "205606406": "软件20.11本",
  "205613401": "软件20.12本",
  "205613402": "软件20.13本",
  "205613403": "软件20.14本",
  "205613404": "软件20.15本",
  "206316401": "软件20.16本",
  "206316402": "软件20.17本",
  "206316403": "软件20.18本",
  "206317401": "软件20.19本",
  "206317402": "软件20.20本",
  "206317403": "软件20.21本",
  "205616401": "计算机20.22本",
  "206319201": "软件20.23专升本",
  "206319202": "软件20.24专升本",
  "206319203": "软件20.25专升本",
  "206319204": "软件20.26专升本",

  "215601401": "计科21.1本",
  "215619402": "计算机21.2本",
  "215619403": "计算机21.3本",
  "215619404": "计算机21.4本",
  "215619405": "计算机21.5本",
  "215606406": "软件21.6本",
  "215606407": "软件21.7本",
  "215606408": "软件21.8本",
  "215606409": "软件21.9本",
  "215606410": "软件21.10本",
  "215606411": "软件21.11本",
  "215606412": "软件21.12本",
  "215606413": "软件21.13本",
  "215613414": "软件21.14本",
  "215613415": "软件21.15本",
  "215613416": "软件21.16本",
  "215613417": "软件21.17本",
  "215613418": "软件21.18本",
  "216316419": "软件21.19本",
  "216316420": "软件21.20本",
  "216316421": "软件21.21本",
  "216316422": "软件21.22本",
  "216317423": "软件21.23本",
  "216317424": "软件21.24本",
  "216317425": "软件21.25本",
  "216317426": "软件21.26本",
  "216317427": "软件21.27本",
  "216319228": "软件21.28专升本",
  "216319229": "软件21.29专升本",
  "216319230": "软件21.30专升本",
  "216319231": "软件21.31专升本",
};
function getsolves(id) {
  $.get(script_root + "/api/v1/challenges/" + id + "/solves", function(
    response
  ) {
    var data = response.data;
    $(".challenge-solves").text(parseInt(data.length) + (parseInt(data.length) === 0 ? " 人解出这题，快冲" : " 人已解出"));
    var box = $("#challenge-solves-names");
    box.empty();
    for (var i = 0; i < data.length; i++) {
      var id = data[i].account_id;
      if (Object.keys(classsignMap).includes(data[i].idc.substr(0,9))) {
        var class_ = classsignMap[data[i].idc.substr(0,9)];
      } else {
        var class_ = "非参赛年级";
      }
      var name = data[i].name;
      var date = moment(data[i].date)
        .local()
        .fromNow();
      var account_url = data[i].account_url;
      box.append(
        '<tr><td><a href="{0}">{2}</td><td>{3}</td></tr>'.format(
          account_url,
          id,
          (
              data[i].user.startsWith("NYNUSEC-")
                  ?
                  '<img src="https://q2.qlogo.cn/headimg_dl?dst_uin='+data[i].qq+'&spec=2" alt="QQ头像" width="30" height="30" style="vertical-align: sub;margin-right: 4px;border-radius: 15px;"/><div style="display: inline-block;line-height: 15px;">'+class_+'<br/>'+'NYNUSEC · '+htmlentities(name)+'</div>'
                  :
                  '<img src="https://q2.qlogo.cn/headimg_dl?dst_uin='+data[i].qq+'&spec=2" alt="QQ头像" width="30" height="30" style="vertical-align: sub;margin-right: 4px;border-radius: 15px;"/><div style="display: inline-block;line-height: 15px;">'+class_+'<br/>'+htmlentities(name)+'</div>'
          ),
          date
        )
      );
    }
  });
}

function loadchals(cb) {
  $.get(script_root + "/api/v1/challenges", function(response) {
    var categories = [];
    challenges = response.data;

    $("#challenges-board").empty();

    for (var i = challenges.length - 1; i >= 0; i--) {
      challenges[i].solves = 0;
      if ($.inArray(challenges[i].category, categories) == -1) {
        var category = challenges[i].category;
        categories.push(category);

        var categoryid = category.replace(/ /g, "-").hashCode();
        var categoryrow = $(
          "" +
            '<div id="{0}-row" class="pt-5">'.format(categoryid) +
            '<div class="category-header col-md-12 mb-3">' +
            "</div>" +
            '<div class="category-challenges col-md-12">' +
            '<div class="challenges-row col-md-12"></div>' +
            "</div>" +
            "</div>"
        );
        categoryrow
          .find(".category-header")
          .append($("<h3>" + category + "</h3>"));

        $("#challenges-board").append(categoryrow);
      }
    }

    for (var i = 0; i <= challenges.length - 1; i++) {
      var chalinfo = challenges[i];
      var challenge = chalinfo.category.replace(/ /g, "-").hashCode();
      var chalid = chalinfo.name.replace(/ /g, "-").hashCode();
      var catid = chalinfo.category.replace(/ /g, "-").hashCode();
      var chalwrap = $(
        "<div id='{0}' class='col-md-3 d-inline-block'></div>".format(chalid)
      );

      if (user_solves.indexOf(chalinfo.id) == -1) {
        var chalbutton = $(
          "<button class='btn btn-dark challenge-button w-100 text-truncate pt-3 pb-3 mb-2' value='{0}'></button>".format(
            chalinfo.id
          )
        );
      } else {
        var chalbutton = $(
          "<button class='btn btn-dark challenge-button solved-challenge w-100 text-truncate pt-3 pb-3 mb-2' value='{0}'><i class='fas fa-check corner-button-check'></i></button>".format(
            chalinfo.id
          )
        );
      }

      var chalheader = $("<p>{0}</p>".format(chalinfo.name));
      var chalscore = $("<span>{0}</span>".format(chalinfo.value));
      for (var j = 0; j < chalinfo.tags.length; j++) {
        var tag = "tag-" + chalinfo.tags[j].value.replace(/ /g, "-");
        chalwrap.addClass(tag);
      }

      chalbutton.append(chalheader);
      chalbutton.append(chalscore);
      chalwrap.append(chalbutton);

      $("#" + catid + "-row")
        .find(".category-challenges > .challenges-row")
        .append(chalwrap);
    }

    $(".challenge-button").click(function(e) {
      loadchal(this.value);
      getsolves(this.value);
    });

    if (cb) {
      cb();
    }
  });
}

$("#submit-key").click(function(e) {
  submitkey(
    $("#challenge-id").val(),
    $("#submission-input").val(),
    $("#nonce").val()
  );
});

$(".challenge-solves").click(function(e) {
  getsolves($("#challenge-id").val());
});

$("#challenge-window").on("hide.bs.modal", function(event) {
  $("#submission-input").removeClass("wrong");
  $("#submission-input").removeClass("correct");
  $("#incorrect-key").slideUp();
  $("#correct-key").slideUp();
  $("#already-solved").slideUp();
  $("#too-fast").slideUp();
});

var load_location_hash = function() {
  if (window.location.hash.length > 0) {
    loadchalbyname(decodeURIComponent(window.location.hash.substring(1)));
  }
};

function update(cb) {
  load_user_solves(function() {
    // Load the user's solved challenge ids
    loadchals(function() {
      //  Load the full list of challenges
      if (cb) {
        cb();
      }
    });
  });
}

$(function() {
  update(function() {
    load_location_hash();
  });
});

$(".nav-tabs a").click(function(e) {
  e.preventDefault();
  $(this).tab("show");
});

$("#challenge-window").on("hidden.bs.modal", function() {
  $(".nav-tabs a:first").tab("show");
  history.replaceState("", document.title, window.location.pathname);
});

setInterval(update, 300000);
