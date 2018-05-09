#!/usr/bin/env node

var node_env = process.env.NODE_ENV;
var vhost = null;
if (node_env === "development") {
    vhost = "dev";
} else if (node_env === "test") {
    vhost = "test";
} else if (node_env === "deploy") {
    vhost = "deploy";
} else {
    console.log("NODE_ENV must be in development/test/deploy: ", node_env)
    process.exit(1);
}

var fs = require("fs");
var Promise = require("bluebird");
var request = require("request");
var util = require("util");
var yaml = require("js-yaml");
const pify = require('pify');
var amqp = require("amqplib/callback_api");
var models = require("../src/models");

models.init();

var cfg = yaml.safeLoad(fs.readFileSync(process.argv[2]));
// **TODO**: move this to a config file too
uri = util.format("amqp://%s:%s@%s:%d/%s", cfg["user"], cfg["pass"],
		  cfg["host"], cfg["port"], vhost);

const TM_BASE_URL = "https://api.weixin.qq.com/cgi-bin";
var TEMPLATE_ID = cfg["template_id"]?cfg["template_id"]:"oGaG-M_aZnJoXK-HH0DZYV1a2GQFM_vIixSq3kDtpnE";

const access_code_url = `${TM_BASE_URL}/token?grant_type=client_credential&appid=${process.env.WXXIE_APP_ID}&secret=${process.env.WXXIE_APP_SECRET}`;

var last_gottime = null;
var last_expires_in = null;
var last_access_token = null;

function getAccessToken() {
    if (last_gottime) {
	var now_time = Date.now()
	if (now_time < last_gottime + last_expires_in / 2) {
	    return Promise.resolve(last_access_token);
	}
    }
    return pify(request.get, { multiArgs: true })({
	url: access_code_url
    }).then((r) =>  {
	var [resp, res] = r
	res = JSON.parse(res);
	if (res.access_token) {
	    last_expires_in = res.expires_in * 1000
	    last_gottime = Date.now()
	    last_access_token = res.access_token
	    return last_access_token
	} else {
	    return Promise.reject(new Error(res.errcode + ": " + res.errmsg));
	}
    })
}


function postTemplateMessage(data) {
    return getAccessToken()
	.then((at) => {
	    console.log("post template message")
	    return pify(request.post, { multiArgs: true })({
		url: `${TM_BASE_URL}/message/wxopen/template/send?access_token=${at}`,
		json: data
	    })
	})
}

const stateString = {
    "failed": "运行出错",
    "finished": "运行完成"
}
const answerString = {
    "true": "真鞋",
    "not_sure": "不确定",
    "fake": "假鞋"
}

function getStatusString(state, answer) {
    var value = stateString[state]
    var color = null;
    if (state == "failed" || answer == "fake") {
	color = "#f44";
    } else if (answer == "not_sure") {
	color = "#808a87";
    } else {
	color = "#4b0";
    }
    if (state == "finished") {
	value = value + ": " + answerString[answer]
    }
    return {
	"value": value,
	"color": color
    }
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
    , seconds = parseInt((duration/1000)%60)
    , minutes = parseInt((duration/(1000*60))%60)
    , hours = parseInt((duration/(1000*60*60))%24);
    // hours = (hours < 10) ? "0" + hours : hours;
    // minutes = (minutes < 10) ? "0" + minutes : minutes;
    // seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + "时" + minutes + "分" + seconds + "." + milliseconds + "秒";
}

amqp.connect(uri, function(err, conn) {
    conn.createChannel(function(err, ch) {
	var q = cfg["queue_name"];
	
	ch.assertQueue(q, cfg["queue_cfg"]);
	ch.prefetch(cfg["queue_limit"]);
	console.log(" [*] Waiting for messages in %s/%s. To exit press CTRL+C", vhost, q);
	ch.consume(q, function(msg) {
	    var res = JSON.parse(msg.content.toString());
	    console.log(" [x] Received", res);
	    return models.User.getTaskAndUser(res["user_id"], res["task_id"]).then((r) => {
		var [u, t] = r;
		t.update(res, null, true)
		    .then(() => {
			console.log("update info for user %d task %d", res["user_id"], res["task_id"])
			console.log("form: ", t.get("form_id"))
			if (t.get("form_id")) {
			    // push template message
			    var form_id = t.get("form_id");
			    var openid = u.get("openId");
			    var user_id = u.get("id");
			    var task_id = t.get("id");
			    var comment = t.get("comment")?t.get("comment"):"无";
			    var shoe_model = t.get("shoe_model");
			    var status = getStatusString(res.state, res.answer);
			    var use_time = msToTime(res["finish_time"] - res["start_time"]);
			    return postTemplateMessage(
				{
				    "touser": openid,
				    "template_id": TEMPLATE_ID,
				    "page": `/pages/task/task?user_id=${user_id}&id=${task_id}`,
				    "form_id": form_id,
				    "data": {
					"keyword1": {
					    "value": t.get("task_name")
					},
					"keyword2": {
					    "value": comment
					},
					"keyword3": {
					    "value": shoe_model
					},
					"keyword4": status,
					"keyword5": {
					    "value": use_time
					},
					"keyword6": {
					    "value": new Date(res["finish_time"]).toLocaleString()
					},
					"keyword7": {
					    "value": "您的任务运行结束, 可查看详情"
					}
				    },
				    "emphasis_keyword": "keyword1.DATA"
				})
			}
		    })
		    .catch((err) => {
			console.log(err);
			throw err;
		    });
	    })
		.then(() => { ch.ack(msg); });
	}, {noAck: false});
    });
});
