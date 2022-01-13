var radius = 220;		//球的半径
var dtr = Math.PI / 180;
var d = 300;
var mcList = [];		//装的所有的标签的宽高信息
var lasta = 1;
var lastb = 1;
var distr = true;
var tspeed = 1;
var size = 250;
var active = true;
 
var mouseX = 0;
var mouseY = 0;
 
var howElliptical = 1;
 
var aA = null;
var oDiv = null;
 
var tagCloudMain = function () {
  var i = 0;
  var oTag = null;
 
  oDiv = document.getElementById('tagsList');
  aA = oDiv.getElementsByTagName('a');
 
  for (i = 0; i < aA.length; i++) {
    oTag = {};
    oTag.offsetWidth = aA[i].offsetWidth;  //返回元素的宽度（包括元素宽度、内边距和边框，不包括外边距）
    oTag.offsetHeight = aA[i].offsetHeight;
    mcList.push(oTag);
  }
 
  sineCosine(0, 0, 0);
 
  positionAll();
 
  for(i = 0; i < aA.length; i++) {
  	aA[i].onmouseover = function () {
	    active = false;
	  };
	 
	  aA[i].onmouseout = function () {
	    active = true;
	  };
  }
 
  
 //onmousemove 事件触发后，再触发 onmouseover 事件。
  oDiv.onmousemove = function (ev) {
    var oEvent = window.event || ev;
    //clientX: 鼠标相对于浏览器窗口可视区域的X，Y坐标（窗口坐标）
    //offsetLeft: 返回元素的左外缘距离最近采用非static父元素内壁的距离
    mouseX = oEvent.clientX - (oDiv.offsetLeft + oDiv.offsetWidth / 2);
    mouseY = oEvent.clientY - (oDiv.offsetTop + oDiv.offsetHeight / 2);
 
    mouseX /= 5;
    mouseY /= 5;
  };
  
	setInterval(update, 30);
  
};


//Object.defineProperty(window, 'active', {
//	get: function() {
//	    console.log('get：' + active);
//	    return active;
//	},
//	set: function(value) {
//	      if(!value ){
//		  	clearInterval(fresh);
//		  	clearInterval(firstFresh);
//		  	console.log(Math.abs(aAll))
//		  	console.log("##############################")
//		  }else{
//		  	fresh = setInterval(update, 30);
//		  	console.log("fresh")
//		  }
//	}
//});

//Object.defineProperty(window, 'active', {
//	get: function() {
//	    console.log('get：' + active);
//	    return active;
//	},
//	set: function(value) {
//	      if(value){
//	      	fresh = setInterval(update, 30);
//		  }
//	}
//});

var first = true;
function update() {
//if (active) {
//  aAll = (-Math.min(Math.max(-mouseY, -size), size) / radius) * tspeed;
//  bAll = (Math.min(Math.max(-mouseX, -size), size) / radius) * tspeed;
//}
//else {
//  aAll = lasta * 0.98;	//减速
//  bAll = lastb * 0.98;
//}
//lasta = aAll;
//lastb = bAll;
  
  
  
 
//if (Math.abs(aAll) <= 0.01 && Math.abs(bAll) <= 0.01) {
//	clearInterval(fresh);
//	lasta=1;
//	lastb=1;
//  return;
//}

	if(active){
		if(first){
			aAll = 0.5;
			bAll = 0.5;
		}else{
			aAll = (-Math.min(Math.max(-mouseY, -size), size) / radius) * tspeed;
    		bAll = (Math.min(Math.max(-mouseX, -size), size) / radius) * tspeed;
		}
	}else{
		first = false;
		return;
	}
 
 
  var c = 0;
  sineCosine(aAll, bAll, c);
  for (var j = 0; j < mcList.length; j++) {
    var rx1 = mcList[j].cx;
    var ry1 = mcList[j].cy * ca + mcList[j].cz * (-sa);
    var rz1 = mcList[j].cy * sa + mcList[j].cz * ca;
 
    var rx2 = rx1 * cb + rz1 * sb;
    var ry2 = ry1;
    var rz2 = rx1 * (-sb) + rz1 * cb;
 
    var rx3 = rx2 * cc + ry2 * (-sc);
    var ry3 = rx2 * sc + ry2 * cc;
    var rz3 = rz2;
 
    mcList[j].cx = rx3;
    mcList[j].cy = ry3;
    mcList[j].cz = rz3;
 
    per = d / (d + rz3);
 
    mcList[j].x = (howElliptical * rx3 * per) - (howElliptical * 2);
    mcList[j].y = ry3 * per;
    mcList[j].scale = per;
    mcList[j].alpha = per;
 
    mcList[j].alpha = (mcList[j].alpha - 0.6) * (10 / 6);
  }
 
  doPosition();
  depthSort();
}
 
function depthSort() {
  var i = 0;
  var aTmp = [];
 
  for (i = 0; i < aA.length; i++) {
    aTmp.push(aA[i]);
  }
 
  aTmp.sort(function (vItem1, vItem2) {
    if (vItem1.cz > vItem2.cz) {
      return -1;
    }
    else if (vItem1.cz < vItem2.cz) {
      return 1;
    }
    else {
      return 0;
    }
  });
  for (i = 0; i < aTmp.length; i++) {
    aTmp[i].style.zIndex = i;
  }
}
function positionAll() {
  var phi = 0;
  var theta = 0;
  var max = mcList.length;
  var i = 0;
 
  var aTmp = [];
  var oFragment = document.createDocumentFragment();
 
  //随机排序
  for (i = 0; i < aA.length; i++) {
    aTmp.push(aA[i]);
  }
 
  aTmp.sort(function () {
    return Math.random() < 0.5 ? 1 : -1;
  });
  for (i = 0; i < aTmp.length; i++) {
    oFragment.appendChild(aTmp[i]);
  }
  oDiv.appendChild(oFragment);
  for (var i = 1; i < max + 1; i++) {
    if (distr) {
      phi = Math.acos(-1 + (2 * i - 1) / max);
      theta = Math.sqrt(max * Math.PI) * phi;
    }
    else {
      phi = Math.random() * (Math.PI);
      theta = Math.random() * (2 * Math.PI);
    }
    //坐标变换
    mcList[i - 1].cx = radius * Math.cos(theta) * Math.sin(phi);
    mcList[i - 1].cy = radius * Math.sin(theta) * Math.sin(phi);
    mcList[i - 1].cz = radius * Math.cos(phi);
 
//  aA[i - 1].style.left=mcList[i - 1].cx+oDiv.offsetWidth /2-mcList[i - 1].offsetWidth/2+'px';
//  aA[i - 1].style.top=mcList[i - 1].cy+oDiv.offsetHeight/2-mcList[i - 1].offsetHeight/2+'px';

	aA[i - 1].style.left=mcList[i - 1].cx + radius +'px';
    aA[i - 1].style.top=mcList[i - 1].cy + radius +'px';

  }
}
function doPosition() {
  var l = oDiv.offsetWidth / 2;
  var t = oDiv.offsetHeight / 2;
  for (var i = 0; i < mcList.length; i++) {
//  aA[i].style.left = mcList[i].cx + l - mcList[i].offsetWidth / 2 + 'px';
//  aA[i].style.top = mcList[i].cy + t - mcList[i].offsetHeight / 2 + 'px';

 
 	aA[i].style.left = mcList[i].cx + radius + 'px';
    aA[i].style.top = mcList[i].cy + radius + 'px';
 
    aA[i].style.fontSize = Math.ceil(12 * mcList[i].scale / 2) + 'px';
 
    aA[i].style.filter = "alpha(opacity=" + 100 * mcList[i].alpha + ")";
    aA[i].style.opacity = mcList[i].alpha;
  }
}
function sineCosine(a, b, c) {
  sa = Math.sin(a * dtr);
  ca = Math.cos(a * dtr);
  sb = Math.sin(b * dtr);
  cb = Math.cos(b * dtr);
  sc = Math.sin(c * dtr);
  cc = Math.cos(c * dtr);
}