var $continueDivFixed = $(".create-continue-fixed");
var $continueDiv = $(".create-continue");
function continueDivHideShow(){
	var winHeight = $(window).height();//可视窗口高度
	var bottom = $continueDiv[0].getBoundingClientRect().bottom;
	if(bottom - winHeight > 0){
		$continueDivFixed.show();
	}else{
		$continueDivFixed.hide();
	}
}
function continueDivSwitch(){
	//初始化
	continueDivHideShow();
	//滚动条滚动
	$(window).on('scroll',function(){
		continueDivHideShow();
	})
	//窗口放大缩小
	$(window).resize(function(){
		continueDivHideShow();
	})
}