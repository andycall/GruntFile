var MapObj = (function(){

	"use strict";

	var marker,
		toolBar;
	var map = new AMap.Map("mapContainer",{
		resizeEnable: true,
		//二维地图显示视口
		view: new AMap.View2D({
			zoom:13 //地图显示的缩放级别
		})
	});

	//地图中添加地图操作ToolBar插件
	map.plugin(["AMap.ToolBar"],function(){
		toolBar = new AMap.ToolBar(); //设置地位标记为自定义标记
		map.addControl(toolBar);
	});

	function addMarker(data){
		/* jshint ignore:start */
		/* jshint ignore:end  */
		map.clearMap();
		var LngLatX = parseFloat(data.pos.split(",")[0]);
		var LngLatY = parseFloat(data.pos.split(',')[1]);
		var marker = new AMap.Marker({
			map: map,
			//位置
			position: new AMap.LngLat(LngLatX,LngLatY),
			//复杂图标
			icon: "http://webapi.amap.com/images/0.png"
		});
		marker.setMap(map);  //在地图上添加点
		map.setFitView(); //调整到合理视野
		var infoWindow = new AMap.InfoWindow({
			isCustom : true,  //使用自定义窗体
			content : _.template($("#pop_template").html())({
				username : data.username,
				phone_num : data.phone_num,
				portrait : data.portrait
			}),
			offset:new AMap.Pixel(16, -45)//-113, -140
		});

		$("body").on('click', '.close' ,function(){
			closeInfoWindow();
		});
		infoWindow.open(map,marker.getPosition());
	}


	//关闭信息窗体
	function closeInfoWindow(){
		map.clearInfoWindow();
	}


	return {
		addMarker : addMarker
	};

})();