var database = openDatabase('oald7', '1.0', 'Database for oald7', 1024 * 1024 * 1000);

var db = {
    sql: function(sql, args, callBack) {
        if (database) {
            database.transaction(function(tx) {
                tx.executeSql(sql, args, callBack, db.logger);
            });
        } else {
            console.log('fail');
        }
    },
    logger: function(tx, error) {
        console.log(error.message);
        console.log(error);
    }
};

var popup = function(word) {
    db.sql('SELECT * FROM vocabulary WHERE word=?', [word], function(tx, result) {
        if (result.rows.length === 0) return;
        console.log(result.rows.length);
        var time = result.rows.item(0)['time'];
        db.sql('SELECT * FROM oald7 WHERE headword=?', [word], function(tx, result) {
            var content = result.rows.item(0)['content'];
            var notification = new Notification("%s /%s/ (%s)".format(word, $(content).find("span.oa_i_phon:first").text(), timeAgo(+new Date() - time)), {
                icon: 'icon.gif',
                body: $(content).find("span.oa_d span.oa_chn,span.oa_ud span.oa_chn").slice(0, 3).map(function() {
                    return $(this).text();
                }).get().join("\n")
            });

            var lastClickTime = 0;
            notification.onclick = function() {

                //本次单词的时间与上次时间之差小于500毫秒，判定为双击
                if (new Date() - lastClickTime < 500) {
                    window.open("main.html#" + word);
                    this.cancel();
                    delete notification;
                    clearTimeout(window.playDelay);
                } else { //否则判定为单击,500毫秒以后发音
                    window.playDelay = setTimeout(function() {
                        playWord(word);
                    }, 600);
                }

                lastClickTime = new Date();
                return true;
            };
        });
    });
};

var playWord = function(word) {
    pron.src = "http://www.gstatic.com/dictionary/static/sounds/de/0/%s.mp3".format(word);
    pron1.src = "http://www.gstatic.com/dictionary/static/sounds/de/0/%s@1.mp3".format(word);
    pron.play();
    pron1.play();
};

var popup4learn = function(word) {
    db.sql('SELECT * FROM oald7 WHERE headword=?', [word], function(tx, result) {
        var content = result.rows.item(0)['content'];
        var notification = new Notification("%s /%s/ (亲，学习啦~)".format(word, $(content).find("span.oa_i_phon:first").text()), {
            icon: 'learn-pics/learn' + Math.floor(Math.random() * 10) + '.jpg',
            body: $(content).find("span.oa_d span.oa_chn,span.oa_ud span.oa_chn").slice(0, 3).map(function() {
                return $(this).text();
            }).get().join("\n")
        });
        notification.onclick = function() {
            window.open("main.html#" + word);
            this.cancel();
        };
    });
};

function notify(item) {
    var addTime = new Date(item['time']).getTime() - 5;
    var word = item['word'];
    setTimer(function() {
        popup(word);
    }, addTime + 6 * 60 * 1000); //5分钟,实为6分钟,考虑到还有一分钟是在看解释
    setTimer(function() {
        popup(word);
    }, addTime + 30 * 60 * 1000); //30分钟
    setTimer(function() {
        popup(word);
    }, addTime + 12 * 60 * 60 * 1000); //12小时
    setTimer(function() {
        popup(word);
    }, addTime + 86400 * 1000); //1天
    setTimer(function() {
        popup(word);
    }, addTime + 86400 * 2 * 1000); //2天
    setTimer(function() {
        popup(word);
    }, addTime + 86400 * 4 * 1000); //4天
    setTimer(function() {
        popup(word);
    }, addTime + 86400 * 7 * 1000); //7天
    setTimer(function() {
        popup(word);
    }, addTime + 86400 * 15 * 1000); //15天
}

//返回duration时间段的时间
function timeAgo(duration) {
    if (duration < 60 * 60 * 1000) {
        return Math.floor(duration / 60000) + "分钟前";
    }
    if (duration < 24 * 60 * 60 * 1000) {
        return Math.floor(duration / 3600000) + "小时前";
    }
    return Math.floor(duration / 86400000) + "天前";
}

chrome.manifest = chrome.app.getDetails();

var eng_fonts = [
    "Arial",
    "Roboto Slab",
    "Roboto",
    "Ubuntu",
    "Georgia",
    "Macondo Swash Caps",
    "Days One",
    "Milonga",
    "IM Fell English",
    "Combo",
    "Autour One",
    "Josefin Slab",
    "Quicksand",
    "Chicle",
    "Kotta One",
    "Averia Serif Libre",
    "Happy Monkey",
    "Special Elite"
];
var chn_fonts = [
    "宋体",
    "微软雅黑",
    "楷体",
    "仿宋",
    "新宋体",
    "方正静蕾简体",
    "文泉驿微米黑",
    "幼园"
];
