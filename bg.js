if (localStorage.version < chrome.manifest.version || localStorage.version === undefined) {
    var updateinfo = new Notification('Oald Se7en Chrome App', {
        icon: 'icon.gif',
        body: '您好！Oald Se7en Chrome App 已升级到最新版本(v %s)：\n1.修复提醒失效的问题，请各位务必升级到Chrome最新版本'.format(chrome.manifest.version)
    });

    updateinfo.onclick = function() {
        //window.open("main.html");
        window.open("https://chrome.google.com/webstore/detail/oald-7-%E7%89%9B%E6%B4%A5%E9%AB%98%E9%98%B6%E7%AC%AC%E4%B8%83%E7%89%88/nmdnfeohnddmdmknpjbmnknkmkpcehhn/details?hl=zh-CN&gl=CN");
        this.cancel();
    };

    //updateinfo.show();
    localStorage.version = chrome.manifest.version; //更新版本号
    localStorage.installdate = localStorage.installdate || +new Date(); //安装日期
    localStorage.randomnotifyinterval = localStorage.randomnotifyinterval || "90"; //随机弹出单词的间隔，前期版本中没有此选项
    for (var i = 0, len = wordlistitem.length; i < len; i++) {
        if (wordlistitem[i][0] == "ox3000") {
            localStorage["learn" + wordlistitem[i][0]] = localStorage["learn" + wordlistitem[i][0]] || "true";
        } else {
            localStorage["learn" + wordlistitem[i][0]] = localStorage["learn" + wordlistitem[i][0]] || "false";
        }
    }
    localStorage.eng_fonts = localStorage.eng_fonts || "Milonga";
    localStorage.chn_fonts = localStorage.chn_fonts || "仿宋";
    localStorage.eng_font_customize = localStorage.eng_font_customize || "";
    localStorage.font_size = localStorage.font_size || "1";
    localStorage.onlyee = localStorage.onlyee || "false";
    localStorage.removeItem("autopron");
    localStorage.shortcuts = "true"; //快捷键
    localStorage.shownotificationchn = "false"; //默认不显示复习窗口中文，更利于在句子中学习单词
}

//把bg的hash设置为版本
window.location.hash = chrome.manifest.version;

if (localStorage.firstrun != 'runed') {
    //首次运行，打开main进行安装操作
    localStorage.firstrun = 'runed';
    window.open('main.html');
}

chrome.omnibox.onInputEntered.addListener(function(text) {
    chrome.tabs.create({
        url: 'main.html#' + text
    });
    db.sql('INSERT INTO history VALUES(null,?,null,?)', [text, +new Date()], function() {});
});

if (localStorage.nomenu != "true") {
    chrome.contextMenus.create({
        type: "normal",
        title: "查看 %s 在 Oald 7 中的解释",
        contexts: ["selection"],
        onclick: function(data) {
            var word = data.selectionText;
            word = word.replace(/[, !\?\.]/ig, ''); //去掉，？！。和空格
            chrome.tabs.create({
                url: 'main.html#' + data.selectionText.toLowerCase()
            });
            //db.sql('INSERT INTO history VALUES(null,?,?,?)',[data.selectionText.toLowerCase(),data.pageUrl,+new Date()],function(){});
            db.sql('SELECT * FROM history WHERE word=?', [data.selectionText.toLowerCase()], function(tx, result) {
                if (result.rows.length === 0) { //没有这个词的历史记录
                    db.sql('INSERT INTO history VALUES(null,?,?,?)', [data.selectionText.toLowerCase(), data.pageUrl, +new Date()], function() {});
                } else if (result.rows.item(0).source === null) { //有记录但是source为空的话
                    db.sql('UPDATE history SET source=? WHERE id=?', [data.pageUrl, result.rows.item(0).id], function() {
                        console.log("success...");
                    });
                    console.log("word exists, but source not exist...set source...");
                    console.log(data.pageUrl);
                }
            });
        }
    });
}

if (localStorage.autonotify == "true") {
    //艾宾浩斯提醒
    db.sql('SELECT * FROM vocabulary WHERE time>?', [new Date() - 16 * 86400 * 1000], function(tx, result) {
        for (var i = 0; i < result.rows.length; i++) {
            notify(result.rows.item(i));
        }
    });
}

if (localStorage.randomnotify == "true") {
    //生词表随机提醒，需要改，用limit直接查询出随机行。
    setInterval(function() {
        if (Math.random() < (1 / localStorage.randomnotifyinterval)) {
            db.sql('SELECT * FROM vocabulary', [], function(tx, result) {
                var word = result.rows.item(Math.randomInt(0, result.rows.length - 1))['word'];
                popup(word);
                //	console.log('the random word is:',word);
            });
        }
    }, 60000);
}

chrome.extension.onRequest.addListener(function(word) {
    //如果放在上面的if里面，那么首次运行它将不会注册，于是不会提醒单词
    db.sql('SELECT * FROM vocabulary WHERE word=?', [word], function(tx, result) {
        notify(result.rows.item(0));
    });
});