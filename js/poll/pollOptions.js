function switchOptions(){
			var $navOptTab = $(".create-navigate li");
			var $navOptContent = $(".create-items>div");
			$navOptTab.on("click",function(){
				var _this=this;
				$navOptTab.each(function(index,object){
					if(_this==object){
						$(object).addClass("active");
						$navOptContent.eq(index).show('0.5');
					}else{
						$(object).removeClass("active");
						$navOptContent.eq(index).hide()
					}
					if($(_this).data("attr")!="option-text"){
						$(".create-items").addClass("mgnpad")
					}else{
						$(".create-items").removeClass("mgnpad");
					}
				})
			})
		}
		
		function addInputItem(){
			$(".option-text li:last-child div.form2-item-icon").disable();
			itemIconCheck();
			itemInputCheck();
			$(".option-text li:last-child .item-input").on("input propertychange",function(){
				
				$(this).siblings("div.form2-item-icon").enable();//解除“删除禁用”
				$(this).off("input propertychange");//解绑实时监听
				itemInputCheck();
				var ItemInputLi = '<li>'
								+'<input class="item-input item-input-option" placeholder="Add Option"/>'
								+'<div class="form-item-icon form2-item-icon"><div class="glyphicon glyphicon-trash"></div></div>'
								+'<div class="clearFloat"></div>'
							+'</li>';
				$(".option-text ol").append(ItemInputLi);//添加选项
				$(".option-text li:last-child div.form2-item-icon").disable();//给新增选项添加“删除禁用”
				$(".option-text .form2-item-icon").off("click");
				itemIconCheck();
				
				
				addInputItem();//递归调用
			})
		}
		function itemIconCheck(){
			$(".option-text li .form2-item-icon").on("click",function(){
				$(this).parent("li").hide("0.5",function(){
					$(this).remove();
				});
				continueCheck();
			})
		}
		//'input propertychange'实时触发
		function itemInputCheck(){
			$(".option-text li .item-input").on("input propertychange",function(){
				continueCheck();
			})
		}
		function continueCheck(){
			
			var $optionLi = $(".option-text ol>li");
			$optionLi.each(function(index,object){
				if(!isEmpty($(object).children(".item-input").val())){
					$(".continue-button").enable();
					return false;
				}else{
					$(".continue-button").disable();
				}
			})
		}