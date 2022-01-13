(function($){
    $.fn.imageCode = function (front_site) {
        //初始化参数
        var defaults = {
            callback:""  //回调函数
        };
//      var opts = $.extend(defaults, options);
        return this.each(function () {
            var $this = $(this);//获取当前对象
            var html1 = '<div class="code-k-div">'+
                '<div class="code-con">'+
                '<div class="code-btn">'+
                '<div class="code-img code-img-position">'+
                '<div class="code-img-con">'+
                '<div class="code-mask">'+
                '<img class="img-mask" />'+
                '</div>'+
                '<img class="img-bg" />'+
                '</div>'+
                '<div class="code-push">'+
                '<i class="icon-login-bg icon-w-25 icon-push">刷新</i>'+
                '<span class="code-tip"></span>'+
                '</div>'+
                '</div>'+
                '<div class="code-btn-img code-btn-m"></div>'+
                '<span>按住滑块，拖动完成上方拼图</span>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '<input type="hidden" class="move-code" value="false">';
            $this.html(html1);
            getPicture();
            //定义拖动参数
            var $divMove = $(this).find(".code-btn-img"); //拖动按钮
            var $divWrap = $(this).find(".code-btn");//鼠标可拖拽区域
            var $mask = $this.find(".code-mask");//抠出的图片
            var $fresh = $(this).find(".icon-push");//刷新按钮
            var mX = 0, mY = 0;//定义鼠标X轴Y轴
            var dX = 0, dY = 0;//定义滑动区域左、上位置
            var isDown = false;//mousedown标记
            var isRotate = false;//刷新按钮是否旋转
            if(document.attachEvent) {//ie的事件监听，拖拽div时禁止选中内容，firefox与chrome已在css中设置过-moz-user-select: none; -webkit-user-select: none;
                $divMove[0].attachEvent('onselectstart', function() {
                    return false;
                });
            }
            function getPicture(){
                $.ajax({
                    url:front_site+"/validate/movecode/get",
                    type:"get",
                    dataType:"json",
                    success:function(data){
                        $.each(data.data.val.imageDetails,function(index,object){
                            $(".img-"+object.name).attr("src","data:image/png;base64,"+object.value)
                        })
                        $(".code-mask").css({"top":data.data.val.otlY+1+"px"})
                        sessionStorage.setItem("sessionId",data.data.sessionId);
                        isRotate=false;
                    },
                    complete:function(data){
                        isRotate=false;
                    }
                })
            }


            //刷新事件
            $fresh.click(function(){
                var deg = 0;
                var speed = 10;
                isRotate=true;
                rotate();
                getPicture();
                function rotate(){
                    deg = deg - speed;

                    $fresh.animate({},function(){
                        $fresh.css({
                            "transform":"rotateZ("+deg+"deg)",
                            "-ms-transform":"rotateZ("+deg+"deg)",
                            "-moz-transform":"rotateZ("+deg+"deg)",
                            "-webkit-transform":"rotateZ("+deg+"deg)",
                            "-o-transform":"rotateZ("+deg+"deg)"
                        })
                    })
                    if(deg==-360){
                        deg = 0;
                    }
                    if(isRotate==false){
                        return;
                    }
                    setTimeout(function(){
                        rotate();
                    },1);
                }
            });
            //按钮拖动事件
            $divMove.on({
                mousedown: function (e) {
                    //清除提示信息
                    $this.find(".code-tip").html("");
                    var event = e || window.event;
//                  mX = event.pageX;
//                  console.log(mX);
                    dX = $divWrap.offset().left;
                    dY = $divWrap.offset().top;
                    isDown = true;//鼠标拖拽启动
                    $(this).addClass("active");
                    //修改按钮阴影
                    $divMove.css({"box-shadow":"0 0 5px 5px #AAA"});
                    $mask.css({"display":"block"});
                }
            });
            //鼠标点击松手事件
            $divMove.mouseup(function (e) {
                var lastX = $mask.offset().left - dX ;
                console.log(lastX)
                isDown = false;//鼠标拖拽启
                $divMove.removeClass("active");
                //还原按钮阴影
                $divMove.css({"box-shadow":"0 0 3px 3px #ccc"});
                // $mask.css({"box-shadow":"0 0 3px #ccc"});
                checkcode(lastX);
            });
            $(".code-img-position").on({
                mouseenter:function(e){
                    $(e.target).css("display","block");
                }
            })
            $(".code-btn").on({
                mouseenter:function(e){
                    $(".code-img-position").css("display","block");
                },
                mouseleave:function(e){
                    setTimeout(function(){
                        $(".code-img-position").css("display","none");
                    },400);
                }
            })
            //滑动事件
            $divWrap.mousemove(function (event) {
                var event = event || window.event;
                var x = event.pageX;//鼠标滑动时的X轴
                if (isDown) {
                    if(x>(dX+20) && x<dX+$(this).width()-20){
                        $divMove.css({"left": (x - dX - 20) + "px"});//div动态位置赋值
                        $mask.css({"left": (x - dX - 20) + "px"});
                    }
                }
            });
            //验证数据
            function checkcode(code){
                var iscur=false;
                //判断ajax
                var data={"distance":code,"sessionId":sessionStorage.getItem("sessionId")};
                $.ajax({
                    type:"post",
                    url:front_site+"/validate/movecode/check",
                    async:true,
                    data:data,
                    success:function(data){
                        if(data.code==0){
                            iscur=true;
                            $(".move-code").val("true");
                        }else{
                            iscur=false;
                            $(".move-code").val("false");
                        }
                        setTimeout(function(){
		                    if(iscur){
		                        checkcoderesult(1,"验证通过");
		//                      $this.find(".code-k-div").hide();
		                        getPicture();
		                        setTimeout(function() {
		                            $divMove.removeClass("error");
		                            $mask.animate({"left":"0px"},200);
		                            $divMove.animate({"left": "0px"},200);
		                        },400);
		//                      opts.callback({code:1000,msg:"验证通过",msgcode:"23dfdf123"});
		                    }else{
		                        $divMove.addClass("error");
		                        checkcoderesult(0,data.info);
		//                      opts.callback({code:1001,msg:"验证不通过"});
		                        setTimeout(function() {
		                            $divMove.removeClass("error");
		                            $mask.animate({"left":"0px"},200);
		                            $divMove.animate({"left": "0px"},200);
		                        },400);
		                    }
		                },500)
                    }
                });
                
            }
            //验证结果
            function checkcoderesult(i,txt){
                if(i==0){
                    $this.find(".code-tip").removeClass("code-tip-green");
                    $this.find(".code-tip").addClass("code-tip-red");
                }else{
                    $this.find(".code-tip").removeClass("code-tip-red")
                    $this.find(".code-tip").addClass("code-tip-green");
                }
                $this.find(".code-tip").html(txt);
            }
        })
    }
})(jQuery)
