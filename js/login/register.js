$(function(){
	
//	var relative_path = "../../";
//	var front_site = get_data(relative_path+"data/data.json","front-site");
//	var front_page_site = get_data(relative_path+"data/data.json","front-page-site");
	
	var relative_path = getRelativePath();
	var front_site = data_file.get_data(relative_path,"front-site");
	var front_page_site = data_file.get_data(relative_path,"front-page-site");
	
	
	var isMail = false;
	var isCode = false;
	var isCheck = false;
	checkButton();
	$(".val-code").focus(function(){
		var src = $(".val-code-img").attr("src");
		if(!src) {
			getCode();
        }
	})
	$(".val-code-img").click(function(){
		getCode();
	})
    $(".regist-mail").blur(function () {
        checkMail($(".regist-mail").val())
    })
	$(".val-code").blur(function () {
		checkCode($(".val-code").val())
    })
	$(".rule-check").change(function () {
		if($(this).is(":checked")){
			isCheck=true;
			checkButton();
		}else{
			isCheck=false;
			checkButton()
		}
    })
	$(".btn-submit").click(function () {
		var toMail=$(".regist-mail").val();
		$.ajax({
			url:front_site+"/mail/send",
			type:"post",
            async:false,
			dataType:"json",
			data:"toMail="+toMail+"&frontPageHost="+front_page_site,
			success:function(data){
				if(data.code==0){
					$(".regist-form").empty();
					var html = '<div style="width: 100%;margin: 100px 0;text-align: center;float: none;">'+
							'<div>邮件已发送至</div>'+
							'<div><h3>'+toMail+'</h3></div>'+
							'<div>请登录邮箱查询并激活此账号！</div>'+
						'</div>';
					$(".regist-form").html(html);
				}else {
					alert(data.info);
				}
			}
		})
    })
    function checkMail(mail) {
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if(!mail){
            $(".regist-mail-tip").html("请输入").css("color","red");
            isMail=false;
            checkButton();
		}else if(!reg.test(mail)){
            $(".regist-mail-tip").html("非法").css("color","red");
            isMail=false;
            checkButton();
        }else{

            $.ajax({
                url:front_site+"/mail/find",
                type:"get",
                dataType:"json",
                data:"mail="+mail,
                success:function (data) {
                    if(data.code==0){
                        $(".regist-mail-tip").html("通过").css("color","green");
                        isMail=true;
                        checkButton();
                    }else {
                        $(".regist-mail-tip").html("已存在").css("color","red");
                        isMail=false;
                        checkButton();
                    }
                }
            })
		}

    }
    function getCode(){
    	$.ajax({
    		url:front_site+"/validate/code/get",
            type:"get",
            dataType:"json",
            success:function (data) {
            	if(data.code==0){
            		$(".val-code-img").attr("src","data:image/gif;base64,"+data.data.img);
            		sessionStorage.setItem("sessionId",data.data.sessionId);
            	}
				
            }
    	})
    }
    function checkCode(code) {
		if(!code){
            $(".val-code-tip").html("请输入").css("color","red");
		}else{
            $.ajax({
                url:front_site+"/validate/code/check",
                type:"post",
                dataType:"json",
                data:"code="+code+"&sessionId="+sessionStorage.getItem("sessionId"),
                success:function (data) {
                    if(data.code==0){
                        $(".val-code-tip").html("通过").css("color","green");
                        isCode=true;
                        checkButton()
                    }else{
                        $(".val-code-tip").html(data.info).css("color","red");
                        getCode();
                        isCode=false;
                        checkButton();
					}
                }
            })
        }
    }
    function checkButton(){
        if(isMail==true && isCode==true && isCheck==true){
            $(".btn-submit").removeClass("no-click")
        }else{
            $(".btn-submit").addClass("no-click")
        }
	}

})


