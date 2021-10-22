function updatescores() {
  $.get(script_root + "/api/v1/scoreboard", function(response) {
    var teams = response.data;
    var table = $("#scoreboard tbody");
    table.empty();
    for (var i = 0; i < teams.length; i++) {
      var row =
        "<tr>\n" +
        '<th scope="row" class="text-center">{0}</th>'.format(teams[i].pos) +  // 排名
        '<td><a href="{0}/team/{1}">{2}</a></td>'.format(  // 用户名
          script_root,
          teams[i].id,
          htmlentities(teams[i].name)
        ) +
        '<td class="text-center">' +
          (
              (teams[i].website && (teams[i].website.startsWith("http://") || teams[i].website.startsWith("https://")))
                  ?
                  '<a href="{0}" target="_blank">\n<i class="fas fa-external-link-alt" data-toggle="tooltip" data-placement="top" title="" data-original-title="{0}"></i>\n</a>'.format(teams[i].website)
                  :
                  ""
          ) +
        "</td>" +  // 网站
        '<td class="d-none d-md-table-cell d-lg-table-cell"><span>{0}</span></td>'.format(htmlentities(teams[i].affiliation)) +  // 个性签名
        '<td class="d-none d-md-table-cell d-lg-table-cell"><span>{0}</span></td>'.format(
            (teams[i].country)
                ?
                '<i class="flag-{0}"></i>{0}'.format(teams[i].country)  // 理论上应该调用python中的lookup_country_code函数进行全称补全，不过问题不大 没强迫症就行
                :
                ''
        ) +  // 国家地区
        '<td>{0}</td>'.format(teams[i].score) +  // 得分
        "</tr>";
      table.append(row);
    }
  });
}

function cumulativesum(arr) {
  var result = arr.concat();
  for (var i = 0; i < arr.length; i++) {
    result[i] = arr.slice(0, i + 1).reduce(function(p, i) {
      return p + i;
    });
  }
  return result;
}

function UTCtoDate(utc) {
  var d = new Date(0);
  d.setUTCSeconds(utc);
  return d;
}

function scoregraph() {
  $.get(script_root + "/api/v1/scoreboard/top/10", function(response) {
    var places = response.data;

    if (Object.keys(places).length === 0) {
      // Replace spinner
      $("#score-graph").html(
        '<div class="text-center"><h3 class="spinner-error">No solves yet</h3></div>'
      );
      return;
    }

    var teams = Object.keys(places);
    var traces = [];
    for (var i = 0; i < teams.length; i++) {
      var team_score = [];
      var times = [];
      for (var j = 0; j < places[teams[i]]["solves"].length; j++) {
        team_score.push(places[teams[i]]["solves"][j].value);
        var date = moment(places[teams[i]]["solves"][j].date);
        times.push(date.toDate());
      }
      team_score = cumulativesum(team_score);
      var trace = {
        x: times,
        y: team_score,
        mode: "lines+markers",
        name: places[teams[i]]["name"],
        marker: {
          color: colorhash(places[teams[i]]["name"] + places[teams[i]]["id"])
        },
        line: {
          color: colorhash(places[teams[i]]["name"] + places[teams[i]]["id"])
        }
      };
      traces.push(trace);
    }

    traces.sort(function(a, b) {
      var scorediff = b["y"][b["y"].length - 1] - a["y"][a["y"].length - 1];
      if (!scorediff) {
        return a["x"][a["x"].length - 1] - b["x"][b["x"].length - 1];
      }
      return scorediff;
    });

    var layout = {
      title: "Top 10 Teams",
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      hovermode: "closest",
      font : {'color':'c9cacc'},
      xaxis: {
        showgrid: false,
        showspikes: true
      },
      yaxis: {
        showgrid: false,
        showspikes: true
      },
      legend: {
        orientation: "h"
      }
    };

    $("#score-graph").empty(); // Remove spinners
    document.getElementById("score-graph").fn =
      "CTFd_scoreboard_" + new Date().toISOString().slice(0, 19);
    Plotly.newPlot("score-graph", traces, layout, {
      // displayModeBar: false,
      displaylogo: false
    });
  });
}

function update() {
  updatescores();
  scoregraph();
}

setInterval(update, 300000); // Update scores every 5 minutes
scoregraph();

window.onresize = function() {
  Plotly.Plots.resize(document.getElementById("score-graph"));
};
