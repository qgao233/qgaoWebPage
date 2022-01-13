$(function(){
    var isRePass = false;
    $(".mod-pass").blur(function(){
        if($(".mod-pass").val()){
            $(".mod-pass-tip").html("");
            if(!$(".re-mod-pass").val()){
                $(".re-mod-pass-tip").html("请输入").css("color","red")
            }else{
                $(".re-mod-pass-tip").html("")
                equalPass()
            }
        }else{
            if($(".re-mod-pass").val()){
                $(".mod-pass-tip").html("请输入").css("color","red");
            }else{
                $(".re-mod-pass-tip").html("")
            }
        }
    })
    $(".re-mod-pass").blur(function () {
        if($(".re-mod-pass").val()){
            $(".re-mod-pass-tip").html("");
            if(!$(".mod-pass").val()){
                $(".mod-pass-tip").html("请输入").css("color","red");
            }else {
                $(".mod-pass-tip").html("");
                equalPass()
            }
        }else{
            if($(".mod-pass").val()){
                $(".re-mod-pass-tip").html("请输入").css("color","red")
            }else{
                $(".mod-pass-tip").html("");
            }
        }
    })
    function equalPass() {
        if($(".mod-pass").val()!=$(".re-mod-pass").val()){
            $(".re-mod-pass-tip").html("different").css("color","red")
            isRePass = false;
            addLastClass()
        }else {
            $(".re-mod-pass-tip").html("")
            isRePass = true;
            removeLastClass()
        }
    }
    function addLastClass() {
        $(".last label a").html("暂不修改")
    }
    function removeLastClass() {
        $(".last label a").html("&nbsp;")
    }
    $(".btn-submit").click(function () {
        var params = $("#after-form").serialize();
        $.ajax({
            url:"http://localhost:8081/user/onetime/modify",
            type:"post",
            data:params,
            success:function (data) {
                if(data=="success"){
                    window.location.href="http://localhost:8080/index.html";
                }else{
                    alert("请刷新页面，重新尝试")
                }
            }
        })
    })
})