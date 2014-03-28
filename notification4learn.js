$(function(){
	var word = location.hash.substr(1);
	$("#word").append(word)
	$(document.body).click(function(){
		chrome.tabs.create({
			url:'main.html#'+word
		});
		window.close();
	});
	pron_audio.src="http://www.gstatic.com/dictionary/static/sounds/de/0/%s.mp3".format(word.replace(/ /ig,'_'));
	$("#pron_button").click(function(){
		console.log(word);
		return false;
	});
	$(document.body).mousedown(function(){
		if(event.which==2)
			window.close();
	});
	db.sql('SELECT * FROM oald7 WHERE headword=?',[word],function(tx,result){
		var content = result.rows.item(0)['content'];
		$("#pron").append($(content).find("span.oa_i_phon:first"));
		$("#chn").append($(content).find("span.oa_d span.oa_chn,span.oa_ud span.oa_chn").slice(0,3));
	});
	$("#pron_button").click(function(){
		pron_audio.play();
	});


	//设置字体
	//中文字体
	$("<style>*[class*=chn],button{font-family:%s;}</style>".format(localStorage.chn_fonts),{}).appendTo(document.head);
	//英文字体
	if(localStorage.eng_font_customize!=""){
		setEngFont(localStorage.eng_font_customize);
	}else if(localStorage.eng_fonts){
		setEngFont(localStorage.eng_fonts);
	}
	function setEngFont(font){
		$("<style>@import url(http://fonts.googleapis.com/css?family=%s);\nhtml,body,button{font-family:'%s';}</style>".format(font.replace(/ /ig,"+"),font)).appendTo(document.head);
	}

	
});
function timeAgo(duration){
	if(duration<60*60*1000){
		return Math.floor(duration/60000)+"分钟前";
	}
	if(duration<24*60*60*1000){
		return Math.floor(duration/3600000)+"小时前";
	}
	return Math.floor(duration/86400000)+"天前";
}