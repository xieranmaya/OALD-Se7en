wordlistitem.each(function(item){
	setInterval(function(){
		var listname = item[0];
		if(Math.random()<1/localStorage.randomnotifyinterval && localStorage["learn"+listname] == "true"){
			popup4learn(window[listname][Math.randomInt(0,window[listname].length-1)]);
		}
	},60000);
});
