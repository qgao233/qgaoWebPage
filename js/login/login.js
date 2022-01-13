
function initReturnUrl(){
	var return_uri = getRequestParameter().return_uri;
	if(!!return_uri){
		$(".return-uri").val(return_uri);
	}
}


//跨域请求分为简单跨域请求和非简单跨域请求
//设置一下contentType为其它的值，比如application/json,此次请求就会被认为是非简单跨域请求，浏览器就会提交预检options请求
function checkIsCookieLogin(){
	var user_service = data_file.get_data(relative_path,"back_end").user_service;
	var return_code = data_file.get_data(relative_path,"data_protocol").return_code;
			
	$.ajax({
		type:"get",
		url:user_service+"/testGetCookie",
		contentType: 'application/json',
	    xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
		async:false,
		success:function(data){
			if(data.code==return_code.success){
//				localStorage.setItem("lanbai-user-sessionId",data.data.token);
//          	//半小时
//          	var expireTime = 1000*60*30;
//          	localStorage.setItem("lanbai-user-deadline",new Date().getTime()+expireTime);
//				
//				//登录成功后跳转
//				if(!!$(".return-uri").val()){
//					window.location.href=relative_path+$(".return-uri").val();
//				}else{
//              	jumpIndex(relative_path);
//				}
				console.log("登录成功")
				alert("登录成功");
			}
		}
	});
}


function initLogin(){
	
	
	//可以不同方式的上方导航条
	$(".title-nav li").each(function(index,obj){
		$(obj).click(function(){
			var marLeft = parseInt($(".left-content").css("margin-left").replace(/[^0-9]/ig,""));
			if(index==0){
				$(".title-nav-frame").animate({
					left:0,
					width:$(obj).outerWidth(true)
				})
				marLeft = Math.abs(marLeft);
				$(".left-content").animate({
					"margin-left":-375+marLeft+"px"
				})
			}else if(index==1){
				$(".title-nav-frame").animate({
					left:$(".title-nav-frame").outerWidth(true),
					width:$(obj).outerWidth(true)
				})
				$(".left-content").animate({
					"margin-left":-375-marLeft+"px"
				})
			}
		})
	})
	var isUserMail = true;
	var isPass = false;
//	$(".form-user-mail").blur(function () {
//		isUserMail = checkUserMail($(".form-user-mail").val());
//  })
	
	$(".form-pass-word").blur(function () {
		if(!$(".form-pass-word").val()){
			$(".pass-tip").html("请输入").css("color","red");
			isPass = true;
		}else{
            $(".pass-tip").html("");
			isPass = true;
        }
    })
	$(".btn-submit").click(function () {
//		&& $(".move-code").val()=="true"
		if(isUserMail && isPass ){
			var user_service = data_file.get_data(relative_path,"back_end").user_service;
			var return_code = data_file.get_data(relative_path,"data_protocol").return_code;
			
			
            var params = $("#login-form").serialize();
            params = decodeURIComponent(params,true);
            console.log(params)
            //xhrFields: {withCredentials: true},crossDomain: true,
            //1、允许创建来自不同域的cookie信息；2、每次的跨域请求都允许带上该cookie信息
            $.ajax({
                url:user_service+"/login",
                type:"post",
                dataType:"json",
				async:false,
                data:params,
	    		xhrFields: {
	                withCredentials: true
	            },
	            crossDomain: true,
                success:function(data){
                    if(data.code == return_code.success){
//                  	console.log(data);
//                  	localStorage.setItem("lanbai-user-sessionId",data.data.token);
//                  	//半小时
//                  	var expireTime = 1000*60*30;
//                  	localStorage.setItem("lanbai-user-deadline",new Date().getTime()+expireTime);
                    	
						//登录成功后跳转
						if(!!$(".return-uri").val()){
							window.location.href=relative_path+$(".return-uri").val();
						}else{
							console.log("登录成功")
							alert("登录成功");
//		                	jumpIndex(relative_path);
						}
					}else if(data.code == return_code.parameter_error){
                    	console.log("parameter_error")
						alert("请检查邮箱与密码格式是否正确")
					}else if(data.code == return_code.service_error){
						console.log("service_error")
						alert("服务错误，请联系站长进行处理！")
					}else if(data.code == return_code.unauthc){
						console.log("unauthc")
						alert("请检查邮箱与密码是否正确！")
					}
                }
            })
		}else {
			console.log("输入验证未完成");
		}

    })
}

function checkUserMail(val) {
    var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    var isUserMail = false;
	if(!val){
		$(".mail-tip").html("请输入").css("color","red");
		isUserMail = false;
	}else if(!reg.test(val)){
        $(".mail-tip").html("非法").css("color","red");
        isUserMail = false;
    }else{
        $(".mail-tip").html("")
        isUserMail = true;
    }
    return isUserMail;
}