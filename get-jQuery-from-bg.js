window.$ = window.jQuery = function(selector){
	var $ = chrome.extension.getBackgroundPage().$;
	return $(selector, document);
};