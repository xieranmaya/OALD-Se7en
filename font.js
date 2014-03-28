document.write("<style type=text/css>");

for(var i=0,l=eng_fonts;i<l;i++){
	document.write("@import url(http://fonts.googleapis.com/css?family=%s);\n".format(eng_fonts[i].replace(/ /ig,"+")));
}
document.write("html,body,button{font-family:'%s'}".format(localStorage.eng_fonts));

document.write("</style>");