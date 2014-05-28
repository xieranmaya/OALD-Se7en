//String
String.prototype.has = function(s) {
    if (this.indexOf(s) > -1) {
        return true;
    }
    return false;
}
String.prototype. in = function(s) {
    if (s.indexOf(this) > -1) {
        return true;
    }
    return false;
}
String.prototype.format = function() {
    var tmp = this;
    for (var i = 0; i < arguments.length; i++) {
        tmp = tmp.replace('%s', arguments[i]);
    }
    return tmp;
}
String.prototype.format2 = function() {
    var args = [].slice.call(arguments)
    var i = 0
    return this.replace(/\%s/g, function() {
        return args[i++]
    })
}
String.prototype.reverse = function(sep) {
    var splitext = this.split("");
    var revertext = splitext.reverse();
    var reversed = revertext.join(sep || "");
    return reversed;
}
String.prototype.startWith = function(s) {
    if (this.indexOf(s) == 0)
        return true;
    return false;
}
String.prototype.endWith = function(s) {
    if (this.indexOf(s) == (this.length - s.length))
        return true;
    return false;
}
String.prototype.right = function(l) {
    return this.substr(this.length - l, l);
}
String.prototype.left = function(l) {
    return this.substr(0, l);
}
//Date
Date.prototype.toSimpleTime = function(sep) {
    var sep = sep || '/';
    var year = this.getUTCFullYear();
    var month = (this.getUTCMonth() + 1) < 10 ? "0" + (this.getUTCMonth() + 1) : this.getUTCMonth() + 1;
    var day = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
    return year + sep + month + sep + day + " " + this.toLocaleTimeString();
}
Date.prototype.toSimpleTime2 = function(sep) { //只有日期，小时和分钟，没有年份以及秒数
    var sep = sep || '/';
    var month = (this.getUTCMonth() + 1) < 10 ? "0" + (this.getUTCMonth() + 1) : this.getUTCMonth() + 1;
    var day = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
    return month + sep + day + " " + this.toTimeString().left(5);
}

//Array
Array.prototype.sub = function(start, len) {
    var a = new Array();
    var end = start + len;
    if (end > this.length) {
        end = this.length - 1;
    }
    for (i = start; i < end; i++) {
        a.push(this[i]);
    }
    return a;
}
Array.prototype.has = function(o) {
    for (var i = 0; i < this.length; i++) {
        if (o === this[i]) {
            return true;
        }
    }
    return false;
}
Array.prototype.remove = function(o) {
    var count = 0;
    if (!Array.isArray(o)) {
        for (var x in this) {
            if (this[x] == o) {
                this.splice(x, 1);
                count++;
            }
        }
        return count;
    } else {
        return 0;
    }
}
Array.prototype.each = Array.prototype.forEach;

Array.prototype.toLiteral = function() {
    return '["' + this.join('","') + '"]';
}

//Math
Math.randomInt = function(m, n) {
    //返回包函m，n的m，n之间的随机整数
    return Math.floor(Math.random() * (Math.abs(m - n) + 1)) + Math.floor(Math.min(m, n));
}
Math.randomColor = function() {
    return "#" + Math.random().toString(16).substr(2, 6).toUpperCase();
}

function setTimer(fn, time) {
    //在指定的时间运行fn,time只能是number.simple version...
    if (time >= new Date().getTime()) {
        return setTimeout(fn, time - new Date());
    }
    return null;
}

function setTimer2(fn, timeStr) {
    //同上,但第二个参数是一个表示时间的字符串,如"Sun Feb,12 2012 12:35:25"
    var time = new Date(timeStr).getTime();
    return setTimer(fn, time);
}

function clearTimer(st) {
    if (st) {
        clearTimeout(st);
    }
}