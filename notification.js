$(function(){
	var word = location.hash.substr(1);
	$("#word").append(word).click(function(){
		chrome.tabs.create({
			url:'main.html#'+word
		});
		window.close();
		return false;
	});

	// $("body").click(function(){
	// 	console.log(event.which);
	// 	return false;
	// });
	// $("#pron_button").click(function(){
	// //	console.log(word);
	// //	chrome.extension.sendRequest(word);
	// }).on("contextmenu",function(){

	// });
	$(document.body).mousedown(function(){
		if(event.which==2)
			window.close();
	});
	$("#toggle_example").click(function(){
		var example = $("#example").toggleClass("hide");
		if(example.hasClass("hide")){
			localStorage.shownotificationexample="false";
		}else{
			delete localStorage.shownotificationexample;
		}
		return false;
	});

	$("#toggle_chn").click(function(){
		var example = $("#chn").toggleClass("hide");
		if(example.hasClass("hide")){
			localStorage.shownotificationchn="false";
		}else{
			delete localStorage.shownotificationchn;
		}
		return false;
	});

	if(localStorage.shownotificationexample=="false"){
		$("#example").toggleClass("hide");
	}

	if(localStorage.shownotificationchn=="false"){
		$("#chn").toggleClass("hide");
	}
	$("#chn").addClass("hide");

	pron_audio.src="http://www.gstatic.com/dictionary/static/sounds/de/0/%s.mp3".format(word);
	pron_audio2.src="http://www.gstatic.com/dictionary/static/sounds/de/0/%s@1.mp3".format(word);
	db.sql('SELECT * FROM oald7 WHERE headword=?',[word],function(tx,result){
		var content = result.rows.item(0)['content'];
		$("#pron").append($(content).find("span.oa_i_phon:first"));
		$("#chn").append($(content).find("span.oa_d span.oa_chn,span.oa_ud span.oa_chn").slice(0,3));

		var tmpexample = $($(content).find("span.oa_x")[0].childNodes).get();
		tmpexample.pop();
		tmpexample = tmpexample.map(function(e){
			// console.log(e);
			return $(e).text();
		});
		// $("#example").append($(tmpexample).text());
		$("#example").append(tmpexample.join(" "));
	});
	db.sql('SELECT * FROM vocabulary WHERE word=?',[word],function(tx,result){
		var time = new Date(result.rows.item(0)['time']);
		$("#time").append(time.toSimpleTime2()+"("+timeAgo(new Date()-time)+")");
	});
	$("#pron_button,body").click(function(){
		pron_audio.play();
		pron_audio2.play();
	});




	//设置字体
	//中文字体
	$("<style>*[class*=chn],button{font-family:%s;}</style>".format(localStorage.chn_fonts),{}).appendTo(document.head);
	//英文字体
	if(localStorage.eng_font_customize!=undefined&&localStorage.eng_font_customize!=""){
		console.log("customize");
		setEngFont(localStorage.eng_font_customize);
	}else if(localStorage.eng_fonts){
		console.log("eng...");
		setEngFont(localStorage.eng_fonts);
	}else{
		console.log("default");
		setEngFont("Kotta One");
	}
	function setEngFont(font){
		$("<style>@import url(http://fonts.googleapis.com/css?family=%s);\nhtml,body,button{font-family:'%s';}</style>".format(font.replace(/ /ig,"+"),font)).appendTo(document.head);
	}
});
function timeAgo(duration){
	if(duration<60*60*1000){
		return Math.round(duration/60000)+"分钟前";
	}
	if(duration<24*60*60*1000){
		return Math.round(duration/3600000)+"小时前";
	}
	return Math.round(duration/86400000)+"天前";
}
