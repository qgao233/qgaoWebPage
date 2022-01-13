function changeLanguage(){
	$(".qgao-language ul li").on("click",function(){
		var _this = this;
		var bool = true;
		var arrowDown = '<div class="icon iconfont icon-arrow-down-bold arrow-down"></div>';
		$(".qgao-language ul li").each(function(){
			
			if($(_this).hasClass("active")) {
				bool = false;
				return false;
			}
			$(this).removeClass("active");
			$(this).children("div").remove();
			
		})
		if(bool == true){
			$(_this).addClass("active");
			$(_this).append(arrowDown);
			$(_this).insertBefore(".qgao-language ul li:first");
		}
	})
}

function toggleIndexCommonHeader(hiddenHeight){
	var $commonHeader = $("#common-header");
	
	//获得滚动高度，网页可见区域顶部与真正网页顶部之间的差值
	var	scrollTop = $(document).scrollTop();
	
	if(scrollTop - hiddenHeight > 0){
		$commonHeader.show(200).css("position","fixed");
	}else{
		$commonHeader.hide(200);
	}
}

function checkIndexCommonHeader(){
	var hiddenHeight = $("#header").height()+$("#banner").height()+$("#navigator").height();
	//初始化
	$("#common-header").hide();
	//滚动条滚动
	$(window).on('scroll',function(){
		toggleIndexCommonHeader(hiddenHeight);
	})
	//窗口放大缩小
	$(window).resize(function(){
		toggleIndexCommonHeader(hiddenHeight);
	})
}



function indexMain(){
	changeLanguage();
	relative_path = getRelativePath();
	initCommonHeader();
	checkIndexCommonHeader();
}
