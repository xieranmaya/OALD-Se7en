setInterval(function(){
	if(Math.random()<1/localStorage.randomnotifyinterval&&(localStorage.learnox3000=="true")){
		popup4learn(ox3000[Math.randomInt(0,ox3000.length-1)]);
	}
},60000);

setInterval(function(){
	if(Math.random()<1/localStorage.randomnotifyinterval&&(localStorage.learnoxacademic=="true")){
		popup4learn(oxacademic[Math.randomInt(0,oxacademic.length-1)]);
	}
},60000);

setInterval(function(){
	if(Math.random()<1/localStorage.randomnotifyinterval&&(localStorage.learntofel=="true")){
		popup4learn(tofel[Math.randomInt(0,tofel.length-1)]);
	}
},60000);

setInterval(function(){
	if(Math.random()<1/localStorage.randomnotifyinterval&&(localStorage.learncet6=="true")){
		popup4learn(cet6[Math.randomInt(0,cet6.length-1)]);
	}
},60000);

setInterval(function(){
	if(Math.random()<1/localStorage.randomnotifyinterval&&(localStorage.learncet4=="true")){
		popup4learn(cet4[Math.randomInt(0,cet4.length-1)]);
	}
},60000);

// wordlistitem.each(function(l){
// 	setInterval(function(){
// 		if(Math.random()<1/localStorage.randomnotifyinterval && localStorage["learn"+l[0]] == true){
// 			popup4learn(window[l[0]](Math.randomInt(0,window[l[0]].length-1)));
// 		}
// 	},60000);
// });
// var popup4learn = function(word){
// 	var learnNotification = webkitNotifications.createHTMLNotification(
// 		"notification4learn.html#"+word
// 	);
	
// 	learnNotification.show();
// }


/*

setInterval(function(){
	if(Math.random()<1/localStorage.randomnotifyinterval){
		popup4s(ox3000[Math.floor(Math.random()*ox3000.length)]);
	}
},60000);

function popup4s(word){
	var notification = webkitNotifications.createHTMLNotification(
		'notification4s.html#'+word
	);
	notification.show();
}
*/