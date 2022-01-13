(function($){
	$.fn.lanbaiCropper = function (front_site) {  
        return this.each(function () {  
            var $this = $(this);//获取当前对象  
            var html = '<div id="model-frame-mask"></div>'+
						'<div id="model-frame">'+
							'<div id="img-title">'+
								'<div class="img-btn-cancel">×</div>'+
								'<h4>头像上传</h4>'+
							'</div>'+
							'<div id="file-input">'+
								'<input id="file-input-tip" name="img_file" type="file">点击这里上传文件'+
							'</div>'+
							'<div id="img-container">'+
								'<div class="img-left">'+
									'<div class="img-show" style="width: 400px;height: 300px;">'+
										'<img src="../img/photo.jpg">'+
									'</div>'+
								'</div>'+
								'<div class="img-right">'+
									'<div class="img-preview" style="width: 100px;height: 100px;overflow: hidden;"></div>'+
									'<div class="img-preview" style="width: 50px;height: 50px;overflow: hidden;"></div>'+
									'<div class="img-button">'+
										'<button class="rotate-right">顺时针旋转</button>'+
										'<button class="rotate-left">逆时针旋转</button>'+
									'</div>'+
								'</div>'+
							'</div>'+
							'<div style="clear:both;"></div>'+
							'<div id="img-footer">'+
								'<button class="img-btn-confirm">确定</button>'+
								'<button class="img-btn-cancel">取消</button>'+
							'</div>'+
						'</div>';
            $this.html(html);  
            
            
            function fadein(){
				$("#model-frame-mask").fadeIn(100);
				$("#model-frame").fadeIn(300);
			}
			
			function fadeout(){
				$("#model-frame-mask").fadeOut(100);
				$("#model-frame").fadeOut(300);
			}
			
			$(".open-upload").on("click",function(){
				fadein()
			})
			$(".img-btn-cancel").on("click",function(){
				fadeout()
			})
			
			
			var picScale = {
				width: 200,
				height: 200,
			};
			
			function initCropeer(){
				$(".img-show>img").cropper({
					aspectRatio: picScale.width / picScale.height,
					preview: $(".img-preview"),
					autoCrop: true,
					autoCropArea:0.4,
					//minCropBoxWidth:216,
					//minCropBoxHeight:144,
					zoomable: false,
					scalable: false,
					rotatable: true,
				});
			}
			
			initCropeer();
			
			var $fileUp = $("#file-input-tip");
			$fileUp.on("change",function(){
				beginCut();
			})
			//兼容性判定
			var support = {
				fileList: !!$fileUp.prop('files'),
				blobURLs: !!window.URL && URL.createObjectURL,
				formData: !!window.FormData
			};
			support.datauri = support.fileList && support.blobURLs;
			
			var $img,fileImg;
			
			function beginCut() {
				//不兼容的情况未做处理，可自行参考官方php example中的解决方法
				if(support.datauri) {
					var files = $fileUp.prop("files");
					if(files.length > 0) {
						fileImg = files[0];
					}
					if(isImageFile(fileImg)) {
						picUrl = URL.createObjectURL(fileImg);
						startCropper();
					}
				}
			}
			
			function isImageFile(file) {
				if(file.type) {
					return /^image\/\w+$/.test(file.type);
				} else {
					return /\.(jpg|jpeg|png|gif)$/.test(file);
				}
			}

			var active = false;

			function startCropper() {
				var _this = this;
				if(active) {
					$img.cropper('replace', picUrl);
				} else {

					$img = $('<img src="' + picUrl + '">');
					$(".img-show").empty().html($img);
					console.log($img.width());
					console.log($img.height());
					$img.cropper({
						aspectRatio: picScale.width / picScale.height,
						preview: $(".img-preview"),
						autoCrop: true,
						autoCropArea:0.4,
						//minCropBoxWidth:216,
						//minCropBoxHeight:144,
						zoomable: false,
						scalable: false,
						rotatable: true,
						ready: function() {
							var result = $img.cropper("getImageData");
							
							$img.cropper('crop');
							$img.cropper('setData', {
								width: picScale.width,
								height: picScale.height
							});
							//$img.cropper({minCropBoxWidth:mw,minCropBoxHeight:mh,});
							//$img.cropper("reset");
						},
						built:function(){
							$(".rotate-right").on({
								"mousedown":function(){
									rotateLeft = setInterval(function(){
										$img.cropper('rotate',1);
									},10);
									
								},
								"mouseup":function(){
									clearInterval(rotateLeft);
								}
							
							})
							$(".rotate-left").on({
								"mousedown":function(){
									rotateRight = setInterval(function(){
										$img.cropper('rotate',-1);
									},10);
									
								},
								"mouseup":function(){
									clearInterval(rotateRight);
								}
							
							})
							
						}
					});

					active = true;
				}
			}
			
			function stopCropper() {
				if(active) {
					$img.cropper("destroy");
					$img.prop("src","../../img/photo.jpg");
					$fileUp.val("");
					active = false;
				}
			}
			
			$(".img-btn-confirm").on('click', function() {
				//
				if(!$img) {
					alert("请上传图片!");
					return;
				}
				$img.cropper("getCroppedCanvas").toBlob(function(blob) {
					var formData = new FormData();
					formData.append('files', blob, fileImg.name);
					
					var headerParams = getHeaderParams();
					
					$.ajax({
						method: "post",
						url: front_site+"/img/user/upload", //用于文件上传的服务器端请求地址
						dataType:"json",
						data: formData,
						headers:headerParams,
						processData: false,
						contentType: false,
						success: function(data) {
							console.log(data);
							if(data.code==0){
								$(".img-icon").prop("src",front_site+"/img/user/get/"+user_id+"?random="+Math.random());
								$(".img-icon").css("display","block");
								fadeout();
								stopCropper();
								initCropeer();
							}else if(data.code==2000){
								jumpLogin(relative_path);
							}else{
								console.log(data.info);
							}
						}
					});
				});
			});
      	})  
    }
})(jQuery)
