$(function(){

	console.time("Time used for event binding");

	$("#version").text(chrome.manifest.version);
	if(localStorage.autozoom===undefined){
		//first fun, not update;
		localStorage.nomenu="false";//关闭菜单
		localStorage.autonotify="true";//自动提醒
		localStorage.autotrad="false";//自动繁体
		localStorage.autozoom="false";//自动缩放
		localStorage.randomnotify="false";//自动随机提醒
		localStorage.randomnotifyinterval="90";//随机提醒及学习频率
		localStorage.displayOnHashNull="ox3000";//hash为空时显示来自哪里的词汇
		$("#install").show();
		init();
		return;
	}

	if(localStorage.autozoom!="true"){
		window.onresize=resize2;
		resize2();
	}

	var word = location.hash.substr(1);
	if(word === ''){
		new Promise(function(resolve, reject){
			var displayOnHashNull = 'vocabulary';
			if(displayOnHashNull == "vocabulary" || displayOnHashNull == "history"){
				db.sql("SELECT count(*) FROM %s".format(displayOnHashNull),[],function(tx,result){
					var len = result.rows.item(0)['count(*)'];
					var count = Math.floor(len*Math.random());
					db.sql("SELECT * FROM %s LIMIT %s,%s".format(displayOnHashNull,count+1,1),[],function(tx,result){
						var word = result.rows.item(0).word;
						resolve(word);
					});
				});
			}else{
				var wordlist = chrome.extension.getBackgroundPage()[displayOnHashNull];
				var len = wordlist.length;
				resolve( wordlist[Math.floor(Math.random()*len)] );
			}
		}).then(function(word){
			console.log(word);
			showWord(word);
			// location.hash = word;
		});
	}

	search.value=word;//search是搜索框。。。。自己都不记得了。。。。
	//search.select();
	showWord(word);
	updateList(word);
	showVocabulary();
	showHistory();
	addHistory(word);

	// 单击生词表和历史记录时切换记数
	$("#vocabulary>h1,#history>h1").click(function(){
		//alert("数量："+$(this).next().next().find("div").length);
	}).toggle(function(){
		this.innerText = $(this).next().next().find("div").length;
	},function(){
		this.innerText = $(this).parent()[0].id.replace(/\b(\w)/,function(m){return m.toUpperCase();});
	});

	// 弹出设置界面并为界面内Input域赋值
	$("#settings-button").click(function(){
		$("#settings").show();
		$("#settings input").each(function(){
			switch(this.type){
				case "checkbox":
					this.checked = (localStorage[this.name]=="true");
					break;
				case "range":
				case "text":
					this.value = (localStorage[this.name]||"");
					break;
			}
		});
	});
	$("#tools-button").click(function(){
		$("#tools").show();
	});
	$("#help-button").click(function(){
		$("#help").show();
	});

	// 保存设置
	$("#save-settings").click(function(){
		$("#settings input,#settings select").each(function(){
			switch(this.type){
				case "checkbox":
					localStorage[this.name] = this.checked;
					break;
				case "range":
				case "text":
					localStorage[this.name] = this.value;
					break;
				case "select-one":
					localStorage[this.name] = this.value;
					break;
			}
		});
		$("#settings").hide();
	});
	// 关闭各种设置界面：Tools，Settings，Help
	$("span.close").click(function(){
		$(this).parent().fadeOut(0);
	});

	// 搜索按钮
	$("#search-button").click(function(){
		var word = $("#list>div>div:first").text();
		location.hash=word;
		addHistory(word);
	});
	// 搜索框
	$('#search').keyup(function(){
		var word = this.value;

		if(window.event.keyCode==13){
			// var word = $("#list>div>div:first").text();
			location.hash = word;

			// db.sql("SELECT * FROM oald7 WHERE headword=?",[word],function(){});


			// 3D 旋转特效
			// content.style.webkitTransform="rotateY(90deg)";
			// //content.style.opacity="0";
			// setTimeout(function(){

			// location.hash = word;
			// showWord(word,function(){

			// // content.style.webkitTransitionDuration="0.25s";
			// // content.style.webkitTransform="rotatey(0deg)";
			// // content.style.opacity="1";

			// });
			// content.style.webkitTransitionDuration="0";
			// content.style.webkitTransform="rotatey(-90deg)";
			// setTimeout(function(){
			// content.style.webkitTransitionDuration="0.25s";
			// content.style.webkitTransform="rotatey(0deg)";
			// content.style.opacity="1";

			// },1);

			// },250);

			// location.hash=word
			addHistory(word);
			//this.blur();
		}

		//延时显示列表，因为速度没那么快
		clearTimeout(window.st);
		window.st = setTimeout(function(){
			updateList(word);
		},200);

		// 取消事件冒泡以供快捷键使用
		return false;
	}).change(function(){
		// 就是这里这个导致了搜索完成后鼠标直接点击需要两次才能打开单词的问题
		// updateList(this.value);
	}).click(function(){
		// this.select();
	}).mouseenter(function(){
		// this.select();
	}).bind('webkitspeechchange',function(){
		updateList(this.value);
	}).on('paste',function(){
		_self = this;
		setTimeout(function(){
			updateList(_self.value);
		},1);
	});

	$("#search-vocabulary,#search-history").bind('keyup click',function(){
		var $list = $(this).parent().next();
		if(this.value===""){
			$list.children().show();
			return;
		}
		$list.children().show();
		$list.find("div:not(:contains('%s'))".format(this.value)).hide();
	}).keyup(function(){
		return false;
	});

	$("body").keyup(function(){
		//快捷键
		if(localStorage.shortcuts!="true"){
			//该功能可以关闭
			return;
		}
		var word = location.hash.substr(1);
		//console.log(window.event.keyCode);
		switch(window.event.keyCode){
			case 83://s,search
				search.select();
				break;
			case 65://a,append or remove vocabulary
				var operation = add.innerText;
				operation==="+"?addVocabulary(word):removeVocabulary(word);
				break;
			case 81:
			case 80://p,pronunciation
				pronunciation.play();
				break;
			case 82://r,reload
				location.reload();
				break;
			case 'O'.charCodeAt(0)://o,close window
			case 88://x,close window
				window.close();
				break;
			case 70://f
			case 74://j,page down
				$("#content").stop().animate({
					scrollTop:$("#content").scrollTop()+100+"px"
				},150,'swing');
				break;
			case 68://d
			case 75://k,page up
				$("#content").stop().animate({
					scrollTop:$("#content").scrollTop()-100+"px"
				},150,'swing');
				break;
			case 84://t,goto top
				$("#content").scrollTop(0);
				break;
			case 66://b,goto bottom
				$("#content").scrollTop(9999);
				break;
			case 191://?,show shortcuts
				if(window.event.shiftKey){
					$(help).show();
				}
				break;
			case 27://esc,close help
				$(help).hidebreak();
				break;
			case 'C'.charCodeAt(0):
			case 'N'.charCodeAt(0)://prev tab
				//alert('prev tab.');
				break;
			case 'M'.charCodeAt(0):
			case 'V'.charCodeAt(0)://next tab
				//alert('next tab.');
				break;
			default:
				break;
		}
	});

	// 发音按钮
	$("#pron").click(function(){
		pronunciation.play();
		pronunciation1.play();
	});

	// 加入生词本
	$("#add").click(function(){
		var word = headword.innerText;
		console.log(word);
		var operation = this.innerText;
		if(operation==="+"){
			addVocabulary(word);
		}else if(operation==="-"){
			removeVocabulary(word);
		}
	});

	// 清空历史记录
	$("#clearhistory").click(function(){
		clearHistory();
	});
	$("div.word-list>div").live('click',function(){
		//location.hash=this.innerText;//这一行直接触发showWord()
		$("div.current").removeClass('current');
		$(this).toggleClass('current');
		if($(this).parent()[0]==$("#list-content")[0]){
			addHistory($(this).text());
		}
	});
	$("#vocabulary-content>div>span.del").live('click',function(){
		removeVocabulary($(this).parent().text());
		return false;
	});
	$("#history-content>div>span.del").live('click',function(){
		removeHistory($(this).parent().text());
		return false;
	});
	// 这一行是为了快速删除时点击太快而导致把单词加入生词表
	$("span.del").live("dblclick",function(){return false;});
	$("#history-content>div").live('dblclick',function(){
		// console.log($(this).attr('word'));
		addVocabulary($(this).attr('word'));
	});


	//字体相关
	var $eng_fonts_select = $("#eng_fonts");
	var $chn_fonts_select = $("#chn_fonts");
	var $font_style = $("#font-style");
	for(var i=0;i<eng_fonts.length;i++){
		$eng_fonts_select.append('<option value="%s">%s</option>'.format(eng_fonts[i],eng_fonts[i]));
		// $font_style.append("@import url(http://fonts.googleapis.com/css?family=%s);\n".format(eng_fonts[i].replace(/ /ig,"+")));
	}
	$font_style.append("@import url(http://fonts.googleapis.com/css?family=%s);\n".format(eng_fonts.map(function(o){return o.replace(/ /ig,"+")}).join("|")));
	for(var i=0;i<chn_fonts.length;i++){
		$chn_fonts_select.append('<option value="%s">%s</option>'.format(chn_fonts[i],chn_fonts[i]));
	}
	$("#eng_fonts").on("change",function(){
		console.log($(this.selectedOptions).text());
		setEngFont(this.value);
	});
	$("#chn_fonts").on("change",function(){
		setChnFont(this.value);
	});
	//页面加载时设置页面字体
	setEngFont(localStorage.eng_fonts);
	setChnFont(localStorage.chn_fonts);
	//自选字体
	if(localStorage.eng_font_customize!==""){
		$font_style.prepend("@import url(http://fonts.googleapis.com/css?family=%s);\n".format(localStorage.eng_font_customize.replace(/ /ig,"+")));
		setEngFont(localStorage.eng_font_customize);
	}
	$("#eng_font_customize").on("paste keyup change",function(){
		console.log("paste...");
		if(this.value===""){
			setEngFont(eng_fonts.value);
			return;
		}
		setTimeout(function(){//粘进来是异步的。。。。直接读的话是之前的值
			var font = eng_font_customize.value;
			console.log(font);
			$font_style.prepend("@import url(http://fonts.googleapis.com/css?family=%s);\n".format(font.replace(/ /ig,"+")));
			setEngFont(font);
		},50);
	});
	//设置下拉框选中状态
	$eng_fonts_select.find("option[value='%s']".format(localStorage.eng_fonts)).attr("selected","true");
	$chn_fonts_select.find("option[value='%s']".format(localStorage.chn_fonts)).attr("selected","true");

	//正文字体大小
	function setFontSize(size){
		$font_style.append("#content{zoom:%s}".format(size));
	}
	setFontSize(localStorage.font_size);
	$("#font-size-value").text(localStorage.font_size*100+"%");
	$("#font_size").change(function(){
		$("#font-size-value").text(this.value*100+"%");
		$("#content").css("zoom",this.value);
	}).mouseup(function(){
		setFontSize(this.value);
		$("#content").css("zoom","");
	});
	//字体相关结束

	//仅显示英英解释
	if(localStorage.onlyee == "true"){
		$font_style.append("[class*=chn]{display:none;}");
	}

	//英英解释及例句发音
	$("span.oa_d,span.oa_ud,span.oa_x").live("mousedown",function(){
		//console.log(event.which);
		if(event.which!=2){
			return;
		}
		var i;
		var soundtext = "";
		for(i=0;i<this.childNodes.length-1;i++){
			switch(this.childNodes[i].nodeType){
				case 3:
					soundtext += this.childNodes[i].nodeValue+" ";
					break;
				case 1:
					soundtext += this.childNodes[i].innerText+" ";
					break;
			}
		}
		//var soundtext = this.childNodes[0].nodeValue;
		var soundsrc = "http://translate.google.cn/translate_tts?ie=UTF-8&tl=en&q=%s".format(encodeURI(soundtext.trim()));
		console.log(soundsrc);
		soundsrc = soundsrc.replace(/\"/g,"&quot;");
		console.log(soundsrc);
		//此为动态构造的一个发音工具
		window.splay = $('<audio src="%s" />'.format(soundsrc),{
			//src:soundsrc
		}).on('ended',function(){
			console.log('playing ended...');
		})[0].play();
		console.log('playing...');
		return false;
	});
	/*例句发音地址
	http://translate.google.cn/translate_tts?ie=UTF-8&tl=en&q=The%20conference%20was%20attended%20by%20delegates%20from%2056%20countries
	*/

	console.timeEnd("Time used for event binding");
});

// jQuery 插件，单词滑入滑出动画
// (function($){
// 	$.fn.wordinout = function(action){
// 		if(action==="in"){
// 			//this.slideToggle().css("left","200px").animate({left:"0px"},600);
// 			this.slideToggle();
// 		}
// 		if(action==="out"){
// 			//this.animate({left:"200px"},600).slideToggle();
// 			this.slideToggle();
// 		}
// 		return this;
// 	};
// })(jQuery);


function setEngFont(font){
	$("html,body,button,input").css("font-family",font);
	// console.log("setting eng fonts;....");
	// console.log(font);
}
function setChnFont(font){
	//$("*[class*=chn]").css("font-family",font);
	//本函数如果用上面一行是无效的，原因是这个函数运行时单词界面都还没出来，单词内容是异步的
	$("#font-style").append('*[class*=chn],*[class*=_cn]{font-family:"%s"}'.format(font||"仿宋"));
	// console.log("setting chn fonts;....")
	// console.log(font);
}


function setTitle(word){
	var title = $("title")[0];
	title.innerHTML = word + " - Oald 7";
}
function showWord(word,callback){
	setTitle(word);
	headword.innerText=word;
	$(headword).attr('title','');

	var pronbase ="http://www.gstatic.com/dictionary/static/sounds/de/0/%s.mp3";
	var pronbase1="http://www.gstatic.com/dictionary/static/sounds/de/0/%s@1.mp3";
	var pronsrc="";
	if(word.indexOf(',')>0){
		pronsrc=word.split(' ')[0].toLowerCase();
	}else{
		pronsrc=word.toLowerCase().replace(/ /ig,'_');
	}

	pronunciation.src=pronbase.format(pronsrc);
	pronunciation1.src=pronbase1.format(pronsrc);

	//显示单词解释
	db.sql('SELECT * FROM oald7 WHERE headword=?',[word],function(tx,result){
		for(var i=0;i<result.rows.length;i++){
			var wordcontent = result.rows.item(i)['content'];
			wordcontent = wordcontent.replace(/([^a-zA-Z])sb([^a-zA-Z])/ig,"$1somebody$2");//替换里面的sb. 为somebody,下同
			wordcontent = wordcontent.replace(/([^a-zA-Z])sth([^a-zA-Z])/ig,"$1something$2");
			//wordcontent = wordcontent.replace(/\bsix\b/ig,"one").replace(/\bten\b/ig,"two");
			content.innerHTML=localStorage.autotrad=="true"?traditionalized(wordcontent):wordcontent;//转换繁体并加载
			$(content).find('span.oa_xh').each(function(){
				$(this).wrap('<a href="main.html#%s"></a>'.format($(this)[0].firstChild.textContent.replace(/[()\d]/ig,'')));
			});
			if(callback){
				callback();
			}
		}

		/*//加载Collins词典
		$(content)
			.append('<hr>来自Collins词典(<a href="http://www.iciba.com/%s/" target="_blank">爱词霸</a>)的释义:'.format(word))
			.append($('<div>').load('http://www.iciba.com/%s/ div#dict_tab_1'.format(word),function(){
				//console.log($("#dict_tab_1 li:hidden").show().length);
				$("div.caption span.text_blue").each(function(){
					$(this).appendTo($(this).parent());
				})
		}));*/
	});

	//设置添加删除的那个按钮，需要检测当前单词是否在生词表里。这个需要改，这代码屎啊。。。
	// db.sql('SELECT * FROM vocabulary',[],function(tx,result){
	// 	var vocabulary = [];
	// 	for(var i = 0;i<result.rows.length;i++){
	// 		vocabulary.push(result.rows.item(i)['word']);
	// 	}
	// 	if(vocabulary.has(word)){
	// 		add.innerText="-";
	// 	}else{
	// 		add.innerText="+";
	// 	}
	// });

	// 功能同上，重写的，上面那效率，简直低的吓人啊，也不知道我当初是怎么写出来的。。。
	db.sql('SELECT word FROM vocabulary WHERE word=?',[word],function(tx,result){
		if(result.rows.length>0){
			add.innerText = "-";
		}else{
			add.innerText = "+";
		}
	});

	//显示单词title里的时间来源添加查询时间等信息
	db.sql('SELECT * FROM history WHERE word=?',[word],function(tx,result){
		//console.log('found in history...');
		if(result.rows.length>0){
			var data = result.rows.item(0);
			headword.title = 'Source: %s'.format(data['source']);
			headword.title += '\nFirst Lookup: %s(%s)'.format(new Date(data['time']).toSimpleTime(),timeAgo(new Date()-new Date(data['time'])));
			$(headword).wrapInner('<a href="%s" target="_blank"></a>'.format(data['source']===null?'javascript:void(0);':data['source']));
		}
	});
	db.sql('SELECT * FROM vocabulary WHERE word=?',[word],function(tx,result){
		//console.log('found in vocabulary...');
		if(result.rows.length>0){
			data = result.rows.item(0);
			headword.title += "\nTime Added: %s(%s)".format(new Date(data['time']).toSimpleTime(),timeAgo(new Date()-new Date(data['time'])));
			headword.title += "\nNow Time: %s".format(new Date().toSimpleTime());
		}
	});
	//$.getScript("http://count7.51yes.com/click.aspx?id=75316569&logo=1");
}
function updateList(word){
	word = $.trim(word);
	db.sql('SELECT * FROM oald7 WHERE headword>=? ORDER BY headword limit 168',[word],function(tx,result){
		if(result.rows.length===0)return;

		$('#list-content').empty().scrollTop(0);

		$('#list-content').append('<div class="current"><a href="main.html#%s">%s</a></div>'.format(result.rows.item(0)['headword'],result.rows.item(0)['headword']));

		for(var i=1;i<result.rows.length;i++){
			$('#list-content').append('<div><a href="main.html#%s">%s</a></div>'.format(result.rows.item(i)['headword'],result.rows.item(i)['headword']));
		}
		//listAnimate($("#list-content"));
	});
}
function showHistory(){
	console.log("showing history...");
	db.sql('SELECT * FROM history ORDER BY id DESC',[],function(tx,result){
		console.log("history......");
		console.log(result);
		var historylist = [];
		for(var i=0;i<result.rows.length;i++){
			var tmp = new Date(result.rows.item(i)['time']);
			var source = result.rows.item(i)['source'];
			var word = result.rows.item(i)['word'];
			historylist.push('<div title="Time: %s\nSource: %s" word="%s"><span title="删除" class="del"></span><a href="main.html#%s">%s</a></div>'.format(tmp.toSimpleTime(),source,word,word,word));
			//$('#history-content').append('<div title="Time: %s\nSource: %s" word="%s"><span title="删除" class="del"></span><a href="main.html#%s">%s</a></div>'.format(tmp.toSimpleTime(),source,word,word,history));
		}
		$('#history-content').append(historylist.join(''));
		//listAnimate($("#history-content"));
	});
}
function addHistory(word,src){
	src = src||null;
	db.sql('INSERT INTO history VALUES(NULL,?,?,?)',[word,src,+new Date()],function(){
		$("#history-content").prepend('<div title="Time: %s\nSource: %s" word="%s"><span title="删除" class="del"></span><a href="main.html#%s">%s</a></div>'.format(new Date().toSimpleTime(),src,word,word,word)).find("div:first").hide().delay(500).slideToggle();
	});
}
function removeHistory(word){
	db.sql('DELETE FROM history WHERE word=?',[word],function(){
		$('#history-content div[word="%s"]'.format(word)).slideToggle(300,function(){
			$(this).remove();
		});
	});
}
function clearHistory(){
	if(confirm("您确定要清空所有查询历史吗？\n！！清空历史将丢失单词的来源网页信息！！")&&confirm("请再次确认！")){
		db.sql('DELETE FROM history',[],function(){
			$("#history-content").empty();
		});
	}
}
function removeVocabulary(word){
	db.sql('DELETE FROM vocabulary WHERE word=?',[word],function(){
		$('#vocabulary-content div[word="%s"]'.format(word)).slideToggle(function(){
			$(this).remove();
		});
	});
	add.innerText="+";
}
function addVocabulary(word){
	db.sql('INSERT INTO vocabulary VALUES(NULL,?,NULL,?)',[word,+new Date()],function(){
		$("#vocabulary-content").prepend('<div title="Time: %s\nSource: null" word="%s"><span title="删除" class="del"></span><a href="main.html#%s">%s</a></div>'.format(new Date().toSimpleTime(),word,word,word)).find("div:first").hide().slideToggle();
		if(localStorage.autonotify=="true"){
			chrome.extension.sendRequest(word);
		}
	});
	add.innerText="-";
}
function showVocabulary(){
	db.sql('SELECT * FROM vocabulary ORDER BY id DESC',[],function(tx,result){
		$('#vocabulary-content').empty().scrollTop(0);
		var vocabularylist = [];
		for(var i=0;i<result.rows.length;i++){
			var source = result.rows.item(i)['source'];
			var word = result.rows.item(i)['word'];
			vocabularylist.push('<div title="Time: %s\nSource: %s" word="%s"><span title="删除" class="del"></span><a href="main.html#%s">%s</a></div>'.format(new Date(result.rows.item(i)['time']).toSimpleTime(),source,word,word,word));
			//$('#vocabulary-content').append('<div title="Time: %s\nSource: %s" word="%s"><span title="删除" class="del"></span><a href="main.html#%s">%s</a></div>'.format(new Date(result.rows.item(i)['time']).toSimpleTime(),source,word,word,word));
		}
		$('#vocabulary-content').append(vocabularylist.join(''));
		//listAnimate($("#vocabulary-content"));
		// $("#vocabulary-content>div").css("opacity",0).each(function(i,o){
		// 	setTimeout(function(){
		// 		$(o).animate({'opacity':1},200);
		// 	},i*20);
		// });
	});
}
function listAnimate($parent){
	$parent.find(">div").css({
		"-webkit-transform":"rotatex(180deg)",
		"opacity":"0",
		"-webkit-transition":"-webkit-transform 0.2s linear, opacity 0.2s linear"
	}).each(function(i,o){
		setTimeout(function(){
			//$(o).animate({"-webkit-transform":"rotateX(0deg)"},300);
			$(o).css({
				"-webkit-transform":"rotatex(0deg)",
				"opacity":"1"
			});
		},i*60);
	});
}
function isInVocabulary(word){
}

window.onhashchange = function(){
	var word = location.hash.substr(1);
	showWord(word);
};

function setzoom(z){
	main.style.zoom=z;
}
function resize2(){
	var ww = document.body.clientWidth;
	setzoom(ww/1150);
}
//first fun, init
function init(){
	db.sql('CREATE TABLE IF NOT EXISTS vocabulary (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT UNIQUE, source TEXT, time INTEGER)',[],function(){
		console.log("vocabulary ok");
	});
	db.sql('CREATE UNIQUE INDEX IF NOT EXISTS word ON vocabulary (word)',[],function(){
		console.log("vocabulary ok");
	});
	db.sql('CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT UNIQUE, source TEXT, time INTEGER)',[],function(){
		console.log("history ok");
	});
	db.sql('CREATE TABLE IF NOT EXISTS oald7 (headword TEXT PRIMARY KEY UNIQUE, content TEXT)',[],function(){/*)  这错误尼马太不容易发现了。。。之前少了sql语句里的最后一个括号*/
		console.log("oald7 ok");
	});
	loadData();
}
function insertNLineSQL(n){
	n--;
	var sql = 'INSERT INTO oald7 ';
	for(var i = 0;i<n;i++){
		sql += 'SELECT ?,? UNION ';
	}
	sql+='SELECT ?,?';
	return sql;
}
function loadData(){
	sql = insertNLineSQL(400);
	var i = 10;

	var progress = 0;

	function insertOK(){
		console.log('insert data ok...');

		progress++;
		$("#install-progress")[0].value=progress;
		if(progress==127){
		//	$("#install>h1").html("安装完成，请在阅读完使用方法后刷新页面！");
		}
	}

	function loadToDB(data){
		data = data.replace(/\t/ig,'\n').split('\n');
		data.length = data.length-1;
		console.log(data.length,i);
		//$("#install-progress")[0].value=i;
		//insert into db code...
		if(i<22){
			for(var j=0;j<10;j++){
				db.sql(sql,data.sub(j*800,800),insertOK);
			}
		}else{
			for(var j=0;j<6;j++){
				db.sql(sql,data.sub(j*800,800),insertOK);
			}
			sql = insertNLineSQL(39);
			db.sql(sql,data.sub(j*800,39*2),insertOK);
		}

		if(i==22){
			db.sql('CREATE UNIQUE INDEX IF NOT EXISTS headword ON oald7 (headword)',[],function(){
				$("#install>h1").html("安装完成，请在阅读完使用方法后刷新页面！");
				location.reload();
			});
			//这行应该是安装到最后时执行
			//db.sql('VACUUM oald7',[],function(){});
			return;
		}i++;
		$.get('data/%s.dat'.format(i),loadToDB,'text');
	}

	$.get('data/%s.dat'.format(i),loadToDB,'text');
}

//繁简转换函数，感谢hao123
function charPYStr() {
	return '锕皑蔼碍爱嗳嫒瑷暧霭谙铵鹌肮袄奥媪骜鳌坝罢钯摆败呗颁办绊钣帮绑镑谤剥饱宝报鲍鸨龅辈贝钡狈备惫鹎贲锛绷笔毕毙币闭荜哔滗铋筚跸边编贬变辩辫苄缏笾标骠飑飙镖镳鳔鳖别瘪濒滨宾摈傧缤槟殡膑镔髌鬓饼禀拨钵铂驳饽钹鹁补钸财参蚕残惭惨灿骖黪苍舱仓沧厕侧册测恻层诧锸侪钗搀掺蝉馋谗缠铲产阐颤冁谄谶蒇忏婵骣觇禅镡场尝长偿肠厂畅伥苌怅阊鲳钞车彻砗尘陈衬伧谌榇碜龀撑称惩诚骋枨柽铖铛痴迟驰耻齿炽饬鸱冲冲虫宠铳畴踌筹绸俦帱雠橱厨锄雏础储触处刍绌蹰传钏疮闯创怆锤缍纯鹑绰辍龊辞词赐鹚聪葱囱从丛苁骢枞凑辏蹿窜撺错锉鹾达哒鞑带贷骀绐担单郸掸胆惮诞弹殚赕瘅箪当挡党荡档谠砀裆捣岛祷导盗焘灯邓镫敌涤递缔籴诋谛绨觌镝颠点垫电巅钿癫钓调铫鲷谍叠鲽钉顶锭订铤丢铥东动栋冻岽鸫窦犊独读赌镀渎椟牍笃黩锻断缎簖兑队对怼镦吨顿钝炖趸夺堕铎鹅额讹恶饿谔垩阏轭锇锷鹗颚颛鳄诶儿尔饵贰迩铒鸸鲕发罚阀珐矾钒烦贩饭访纺钫鲂飞诽废费绯镄鲱纷坟奋愤粪偾丰枫锋风疯冯缝讽凤沣肤辐抚辅赋复负讣妇缚凫驸绂绋赙麸鲋鳆钆该钙盖赅杆赶秆赣尴擀绀冈刚钢纲岗戆镐睾诰缟锆搁鸽阁铬个纥镉颍给亘赓绠鲠龚宫巩贡钩沟苟构购够诟缑觏蛊顾诂毂钴锢鸪鹄鹘剐挂鸹掴关观馆惯贯诖掼鹳鳏广犷规归龟闺轨诡贵刽匦刿妫桧鲑鳜辊滚衮绲鲧锅国过埚呙帼椁蝈铪骇韩汉阚绗颉号灏颢阂鹤贺诃阖蛎横轰鸿红黉讧荭闳鲎壶护沪户浒鹕哗华画划话骅桦铧怀坏欢环还缓换唤痪焕涣奂缳锾鲩黄谎鳇挥辉毁贿秽会烩汇讳诲绘诙荟哕浍缋珲晖荤浑诨馄阍获货祸钬镬击机积饥迹讥鸡绩缉极辑级挤几蓟剂济计记际继纪讦诘荠叽哜骥玑觊齑矶羁虿跻霁鲚鲫夹荚颊贾钾价驾郏浃铗镓蛲歼监坚笺间艰缄茧检碱硷拣捡简俭减荐槛鉴践贱见键舰剑饯渐溅涧谏缣戋戬睑鹣笕鲣鞯将浆蒋桨奖讲酱绛缰胶浇骄娇搅铰矫侥脚饺缴绞轿较挢峤鹪鲛阶节洁结诫届疖颌鲒紧锦仅谨进晋烬尽劲荆茎卺荩馑缙赆觐鲸惊经颈静镜径痉竞净刭泾迳弪胫靓纠厩旧阄鸠鹫驹举据锯惧剧讵屦榉飓钜锔窭龃鹃绢锩镌隽觉决绝谲珏钧军骏皲开凯剀垲忾恺铠锴龛闶钪铐颗壳课骒缂轲钶锞颔垦恳龈铿抠库裤喾块侩郐哙脍宽狯髋矿旷况诓诳邝圹纩贶亏岿窥馈溃匮蒉愦聩篑阃锟鲲扩阔蛴蜡腊莱来赖崃徕涞濑赉睐铼癞籁蓝栏拦篮阑兰澜谰揽览懒缆烂滥岚榄斓镧褴琅阆锒捞劳涝唠崂铑铹痨乐鳓镭垒类泪诔缧篱狸离鲤礼丽厉励砾历沥隶俪郦坜苈莅蓠呖逦骊缡枥栎轹砺锂鹂疠粝跞雳鲡鳢俩联莲连镰怜涟帘敛脸链恋炼练蔹奁潋琏殓裢裣鲢粮凉两辆谅魉疗辽镣缭钌鹩猎临邻鳞凛赁蔺廪檩辚躏龄铃灵岭领绫棂蛏鲮馏刘浏骝绺镏鹨龙聋咙笼垄拢陇茏泷珑栊胧砻楼娄搂篓偻蒌喽嵝镂瘘耧蝼髅芦卢颅庐炉掳卤虏鲁赂禄录陆垆撸噜闾泸渌栌橹轳辂辘氇胪鸬鹭舻鲈峦挛孪滦乱脔娈栾鸾銮抡轮伦仑沦纶论囵萝罗逻锣箩骡骆络荦猡泺椤脶镙驴吕铝侣屡缕虑滤绿榈褛锊呒妈玛码蚂马骂吗唛嬷杩买麦卖迈脉劢瞒馒蛮满谩缦镘颡鳗猫锚铆贸麽没镁门闷们扪焖懑钔锰梦眯谜弥觅幂芈谧猕祢绵缅渑腼黾庙缈缪灭悯闽闵缗鸣铭谬谟蓦馍殁镆谋亩钼呐钠纳难挠脑恼闹铙讷馁内拟腻铌鲵撵辇鲶酿鸟茑袅聂啮镊镍陧蘖嗫颟蹑柠狞宁拧泞苎咛聍钮纽脓浓农侬哝驽钕诺傩疟欧鸥殴呕沤讴怄瓯盘蹒庞抛疱赔辔喷鹏纰罴铍骗谝骈飘缥频贫嫔苹凭评泼颇钋扑铺朴谱镤镨栖脐齐骑岂启气弃讫蕲骐绮桤碛颀颃鳍牵钎铅迁签谦钱钳潜浅谴堑佥荨悭骞缱椠钤枪呛墙蔷强抢嫱樯戗炝锖锵镪羟跄锹桥乔侨翘窍诮谯荞缲硗跷窃惬锲箧钦亲寝锓轻氢倾顷请庆揿鲭琼穷茕蛱巯赇虮鳅趋区躯驱龋诎岖阒觑鸲颧权劝诠绻辁铨却鹊确阕阙悫让饶扰绕荛娆桡热韧认纫饪轫荣绒嵘蝾缛铷颦软锐蚬闰润洒萨飒鳃赛伞毵糁丧骚扫缫涩啬铯穑杀刹纱铩鲨筛晒酾删闪陕赡缮讪姗骟钐鳝墒伤赏垧殇觞烧绍赊摄慑设厍滠畲绅审婶肾渗诜谂渖声绳胜师狮湿诗时蚀实识驶势适释饰视试谥埘莳弑轼贳铈鲥寿兽绶枢输书赎属术树竖数摅纾帅闩双谁税顺说硕烁铄丝饲厮驷缌锶鸶耸怂颂讼诵擞薮馊飕锼苏诉肃谡稣虽随绥岁谇孙损笋荪狲缩琐锁唢睃獭挞闼铊鳎台态钛鲐摊贪瘫滩坛谭谈叹昙钽锬顸汤烫傥饧铴镗涛绦讨韬铽腾誊锑题体屉缇鹈阗条粜龆鲦贴铁厅听烃铜统恸头钭秃图钍团抟颓蜕饨脱鸵驮驼椭箨鼍袜娲腽弯湾顽万纨绾网辋韦违围为潍维苇伟伪纬谓卫诿帏闱沩涠玮韪炜鲔温闻纹稳问阌瓮挝蜗涡窝卧莴龌呜钨乌诬无芜吴坞雾务误邬庑怃妩骛鹉鹜锡牺袭习铣戏细饩阋玺觋虾辖峡侠狭厦吓硖鲜纤贤衔闲显险现献县馅羡宪线苋莶藓岘猃娴鹇痫蚝籼跹厢镶乡详响项芗饷骧缃飨萧嚣销晓啸哓潇骁绡枭箫协挟携胁谐写泻谢亵撷绁缬锌衅兴陉荥凶汹锈绣馐鸺虚嘘须许叙绪续诩顼轩悬选癣绚谖铉镟学谑泶鳕勋询寻驯训讯逊埙浔鲟压鸦鸭哑亚讶垭娅桠氩阉烟盐严岩颜阎艳厌砚彦谚验厣赝俨兖谳恹闫酽魇餍鼹鸯杨扬疡阳痒养样炀瑶摇尧遥窑谣药轺鹞鳐爷页业叶靥谒邺晔烨医铱颐遗仪蚁艺亿忆义诣议谊译异绎诒呓峄饴怿驿缢轶贻钇镒镱瘗舣荫阴银饮隐铟瘾樱婴鹰应缨莹萤营荧蝇赢颖茔莺萦蓥撄嘤滢潆璎鹦瘿颏罂哟拥佣痈踊咏镛优忧邮铀犹诱莸铕鱿舆鱼渔娱与屿语狱誉预驭伛俣谀谕蓣嵛饫阈妪纡觎欤钰鹆鹬龉鸳渊辕园员圆缘远橼鸢鼋约跃钥粤悦阅钺郧匀陨运蕴酝晕韵郓芸恽愠纭韫殒氲杂灾载攒暂赞瓒趱錾赃脏驵凿枣责择则泽赜啧帻箦贼谮赠综缯轧铡闸栅诈斋债毡盏斩辗崭栈战绽谵张涨帐账胀赵诏钊蛰辙锗这谪辄鹧贞针侦诊镇阵浈缜桢轸赈祯鸩挣睁狰争帧症郑证诤峥钲铮筝织职执纸挚掷帜质滞骘栉栀轵轾贽鸷蛳絷踬踯觯钟终种肿众锺诌轴皱昼骤纣绉猪诸诛烛瞩嘱贮铸驻伫槠铢专砖转赚啭馔颞桩庄装妆壮状锥赘坠缀骓缒谆准着浊诼镯兹资渍谘缁辎赀眦锱龇鲻踪总纵偬邹诹驺鲰诅组镞钻缵躜鳟翱并卜沉丑淀迭斗范干皋硅柜后伙秸杰诀夸里凌么霉捻凄扦圣尸抬涂洼喂污锨咸蝎彝涌游吁御愿岳云灶扎札筑于志注凋讠谫郄勐凼坂垅垴埯埝苘荬荮莜莼菰藁揸吒吣咔咝咴噘噼嚯幞岙嵴彷徼犸狍馀馇馓馕愣憷懔丬溆滟溷漤潴澹甯纟绔绱珉枧桊桉槔橥轱轷赍肷胨飚煳煅熘愍淼砜磙眍钚钷铘铞锃锍锎锏锘锝锪锫锿镅镎镢镥镩镲稆鹋鹛鹱疬疴痖癯裥襁耢颥螨麴鲅鲆鲇鲞鲴鲺鲼鳊鳋鳘鳙鞒鞴齄';
}
function ftPYStr() {
	return '錒皚藹礙愛噯嬡璦曖靄諳銨鵪骯襖奧媼驁鰲壩罷鈀擺敗唄頒辦絆鈑幫綁鎊謗剝飽寶報鮑鴇齙輩貝鋇狽備憊鵯賁錛繃筆畢斃幣閉蓽嗶潷鉍篳蹕邊編貶變辯辮芐緶籩標驃颮飆鏢鑣鰾鱉別癟瀕濱賓擯儐繽檳殯臏鑌髕鬢餅稟撥缽鉑駁餑鈸鵓補鈽財參蠶殘慚慘燦驂黲蒼艙倉滄廁側冊測惻層詫鍤儕釵攙摻蟬饞讒纏鏟產闡顫囅諂讖蕆懺嬋驏覘禪鐔場嘗長償腸廠暢倀萇悵閶鯧鈔車徹硨塵陳襯傖諶櫬磣齔撐稱懲誠騁棖檉鋮鐺癡遲馳恥齒熾飭鴟沖衝蟲寵銃疇躊籌綢儔幬讎櫥廚鋤雛礎儲觸處芻絀躕傳釧瘡闖創愴錘綞純鶉綽輟齪辭詞賜鶿聰蔥囪從叢蓯驄樅湊輳躥竄攛錯銼鹺達噠韃帶貸駘紿擔單鄲撣膽憚誕彈殫賧癉簞當擋黨蕩檔讜碭襠搗島禱導盜燾燈鄧鐙敵滌遞締糴詆諦綈覿鏑顛點墊電巔鈿癲釣調銚鯛諜疊鰈釘頂錠訂鋌丟銩東動棟凍崠鶇竇犢獨讀賭鍍瀆櫝牘篤黷鍛斷緞籪兌隊對懟鐓噸頓鈍燉躉奪墮鐸鵝額訛惡餓諤堊閼軛鋨鍔鶚顎顓鱷誒兒爾餌貳邇鉺鴯鮞發罰閥琺礬釩煩販飯訪紡鈁魴飛誹廢費緋鐨鯡紛墳奮憤糞僨豐楓鋒風瘋馮縫諷鳳灃膚輻撫輔賦復負訃婦縛鳧駙紱紼賻麩鮒鰒釓該鈣蓋賅桿趕稈贛尷搟紺岡剛鋼綱崗戇鎬睪誥縞鋯擱鴿閣鉻個紇鎘潁給亙賡綆鯁龔宮鞏貢鉤溝茍構購夠詬緱覯蠱顧詁轂鈷錮鴣鵠鶻剮掛鴰摑關觀館慣貫詿摜鸛鰥廣獷規歸龜閨軌詭貴劊匭劌媯檜鮭鱖輥滾袞緄鯀鍋國過堝咼幗槨蟈鉿駭韓漢闞絎頡號灝顥閡鶴賀訶闔蠣橫轟鴻紅黌訌葒閎鱟壺護滬戶滸鶘嘩華畫劃話驊樺鏵懷壞歡環還緩換喚瘓煥渙奐繯鍰鯇黃謊鰉揮輝毀賄穢會燴匯諱誨繪詼薈噦澮繢琿暉葷渾諢餛閽獲貨禍鈥鑊擊機積饑跡譏雞績緝極輯級擠幾薊劑濟計記際繼紀訐詰薺嘰嚌驥璣覬齏磯羈蠆躋霽鱭鯽夾莢頰賈鉀價駕郟浹鋏鎵蟯殲監堅箋間艱緘繭檢堿鹼揀撿簡儉減薦檻鑒踐賤見鍵艦劍餞漸濺澗諫縑戔戩瞼鶼筧鰹韉將漿蔣槳獎講醬絳韁膠澆驕嬌攪鉸矯僥腳餃繳絞轎較撟嶠鷦鮫階節潔結誡屆癤頜鮚緊錦僅謹進晉燼盡勁荊莖巹藎饉縉贐覲鯨驚經頸靜鏡徑痙競凈剄涇逕弳脛靚糾廄舊鬮鳩鷲駒舉據鋸懼劇詎屨櫸颶鉅鋦窶齟鵑絹錈鐫雋覺決絕譎玨鈞軍駿皸開凱剴塏愾愷鎧鍇龕閌鈧銬顆殼課騍緙軻鈳錁頷墾懇齦鏗摳庫褲嚳塊儈鄶噲膾寬獪髖礦曠況誆誑鄺壙纊貺虧巋窺饋潰匱蕢憒聵簣閫錕鯤擴闊蠐蠟臘萊來賴崍徠淶瀨賚睞錸癩籟藍欄攔籃闌蘭瀾讕攬覽懶纜爛濫嵐欖斕鑭襤瑯閬鋃撈勞澇嘮嶗銠鐒癆樂鰳鐳壘類淚誄縲籬貍離鯉禮麗厲勵礫歷瀝隸儷酈壢藶蒞蘺嚦邐驪縭櫪櫟轢礪鋰鸝癘糲躒靂鱺鱧倆聯蓮連鐮憐漣簾斂臉鏈戀煉練蘞奩瀲璉殮褳襝鰱糧涼兩輛諒魎療遼鐐繚釕鷯獵臨鄰鱗凜賃藺廩檁轔躪齡鈴靈嶺領綾欞蟶鯪餾劉瀏騮綹鎦鷚龍聾嚨籠壟攏隴蘢瀧瓏櫳朧礱樓婁摟簍僂蔞嘍嶁鏤瘺耬螻髏蘆盧顱廬爐擄鹵虜魯賂祿錄陸壚擼嚕閭瀘淥櫨櫓轤輅轆氌臚鸕鷺艫鱸巒攣孿灤亂臠孌欒鸞鑾掄輪倫侖淪綸論圇蘿羅邏鑼籮騾駱絡犖玀濼欏腡鏍驢呂鋁侶屢縷慮濾綠櫚褸鋝嘸媽瑪碼螞馬罵嗎嘜嬤榪買麥賣邁脈勱瞞饅蠻滿謾縵鏝顙鰻貓錨鉚貿麼沒鎂門悶們捫燜懣鍆錳夢瞇謎彌覓冪羋謐獼禰綿緬澠靦黽廟緲繆滅憫閩閔緡鳴銘謬謨驀饃歿鏌謀畝鉬吶鈉納難撓腦惱鬧鐃訥餒內擬膩鈮鯢攆輦鯰釀鳥蔦裊聶嚙鑷鎳隉蘗囁顢躡檸獰寧擰濘苧嚀聹鈕紐膿濃農儂噥駑釹諾儺瘧歐鷗毆嘔漚謳慪甌盤蹣龐拋皰賠轡噴鵬紕羆鈹騙諞駢飄縹頻貧嬪蘋憑評潑頗釙撲鋪樸譜鏷鐠棲臍齊騎豈啟氣棄訖蘄騏綺榿磧頎頏鰭牽釬鉛遷簽謙錢鉗潛淺譴塹僉蕁慳騫繾槧鈐槍嗆墻薔強搶嬙檣戧熗錆鏘鏹羥蹌鍬橋喬僑翹竅誚譙蕎繰磽蹺竊愜鍥篋欽親寢鋟輕氫傾頃請慶撳鯖瓊窮煢蛺巰賕蟣鰍趨區軀驅齲詘嶇闃覷鴝顴權勸詮綣輇銓卻鵲確闋闕愨讓饒擾繞蕘嬈橈熱韌認紉飪軔榮絨嶸蠑縟銣顰軟銳蜆閏潤灑薩颯鰓賽傘毿糝喪騷掃繅澀嗇銫穡殺剎紗鎩鯊篩曬釃刪閃陜贍繕訕姍騸釤鱔墑傷賞坰殤觴燒紹賒攝懾設厙灄畬紳審嬸腎滲詵諗瀋聲繩勝師獅濕詩時蝕實識駛勢適釋飾視試謚塒蒔弒軾貰鈰鰣壽獸綬樞輸書贖屬術樹豎數攄紓帥閂雙誰稅順說碩爍鑠絲飼廝駟緦鍶鷥聳慫頌訟誦擻藪餿颼鎪蘇訴肅謖穌雖隨綏歲誶孫損筍蓀猻縮瑣鎖嗩脧獺撻闥鉈鰨臺態鈦鮐攤貪癱灘壇譚談嘆曇鉭錟頇湯燙儻餳鐋鏜濤絳討韜鋱騰謄銻題體屜緹鵜闐條糶齠鰷貼鐵廳聽烴銅統慟頭鈄禿圖釷團摶頹蛻飩脫鴕馱駝橢籜鼉襪媧膃彎灣頑萬紈綰網輞韋違圍為濰維葦偉偽緯謂衛諉幃闈溈潿瑋韙煒鮪溫聞紋穩問閿甕撾蝸渦窩臥萵齷嗚鎢烏誣無蕪吳塢霧務誤鄔廡憮嫵騖鵡鶩錫犧襲習銑戲細餼鬩璽覡蝦轄峽俠狹廈嚇硤鮮纖賢銜閑顯險現獻縣餡羨憲線莧薟蘚峴獫嫻鷴癇蠔秈躚廂鑲鄉詳響項薌餉驤緗饗蕭囂銷曉嘯嘵瀟驍綃梟簫協挾攜脅諧寫瀉謝褻擷紲纈鋅釁興陘滎兇洶銹繡饈鵂虛噓須許敘緒續詡頊軒懸選癬絢諼鉉鏇學謔澩鱈勛詢尋馴訓訊遜塤潯鱘壓鴉鴨啞亞訝埡婭椏氬閹煙鹽嚴巖顏閻艷厭硯彥諺驗厴贗儼兗讞懨閆釅魘饜鼴鴦楊揚瘍陽癢養樣煬瑤搖堯遙窯謠藥軺鷂鰩爺頁業葉靨謁鄴曄燁醫銥頤遺儀蟻藝億憶義詣議誼譯異繹詒囈嶧飴懌驛縊軼貽釔鎰鐿瘞艤蔭陰銀飲隱銦癮櫻嬰鷹應纓瑩螢營熒蠅贏穎塋鶯縈鎣攖嚶瀅瀠瓔鸚癭頦罌喲擁傭癰踴詠鏞優憂郵鈾猶誘蕕銪魷輿魚漁娛與嶼語獄譽預馭傴俁諛諭蕷崳飫閾嫗紆覦歟鈺鵒鷸齬鴛淵轅園員圓緣遠櫞鳶黿約躍鑰粵悅閱鉞鄖勻隕運蘊醞暈韻鄆蕓惲慍紜韞殞氳雜災載攢暫贊瓚趲鏨贓臟駔鑿棗責擇則澤賾嘖幘簀賊譖贈綜繒軋鍘閘柵詐齋債氈盞斬輾嶄棧戰綻譫張漲帳賬脹趙詔釗蟄轍鍺這謫輒鷓貞針偵診鎮陣湞縝楨軫賑禎鴆掙睜猙爭幀癥鄭證諍崢鉦錚箏織職執紙摯擲幟質滯騭櫛梔軹輊贄鷙螄縶躓躑觶鐘終種腫眾鍾謅軸皺晝驟紂縐豬諸誅燭矚囑貯鑄駐佇櫧銖專磚轉賺囀饌顳樁莊裝妝壯狀錐贅墜綴騅縋諄準著濁諑鐲茲資漬諮緇輜貲眥錙齜鯔蹤總縱傯鄒諏騶鯫詛組鏃鉆纘躦鱒翺並蔔沈醜澱叠鬥範幹臯矽櫃後夥稭傑訣誇裏淩麽黴撚淒扡聖屍擡塗窪餵汙鍁鹹蠍彜湧遊籲禦願嶽雲竈紮劄築於誌註雕訁譾郤猛氹阪壟堖垵墊檾蕒葤蓧蒓菇槁摣咤唚哢噝噅撅劈謔襆嶴脊仿僥獁麅餘餷饊饢楞怵懍爿漵灩混濫瀦淡寧糸絝緔瑉梘棬案橰櫫軲軤賫膁腖飈糊煆溜湣渺碸滾瞘鈈鉕鋣銱鋥鋶鐦鐧鍩鍀鍃錇鎄鎇鎿鐝鑥鑹鑔穭鶓鶥鸌癧屙瘂臒襇繈耮顬蟎麯鮁鮃鮎鯗鯝鯴鱝鯿鰠鰵鱅鞽韝齇';
}
function traditionalized(cc) {
	var str = '';
	for (var i = 0; i < cc.length; i++) {
		if (charPYStr().indexOf(cc.charAt(i)) != -1) str += ftPYStr().charAt(charPYStr().indexOf(cc.charAt(i)));
		else str += cc.charAt(i);
	}
	return str;
}
function simplized(cc) {
	var str = '';
	for (var i = 0; i < cc.length; i++) {
		if (ftPYStr().indexOf(cc.charAt(i)) != -1) str += charPYStr().charAt(ftPYStr().indexOf(cc.charAt(i)));
		else str += cc.charAt(i);
	}
	return str;
}
