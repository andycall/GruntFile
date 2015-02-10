(function(){

	"use strict";

	Backbone.emulateHTTP = true;

	var Router = Backbone.Router.extend({
		routes : {
			'' : "home"
		}
	});


	var Order_Model = Backbone.Model.extend({
		url : "/getOrders",
		initialize : function(){
			this.autoRefresh();
		},
		defaults: {
			data:[
				{
					order_id: 1, //唯一id
					order_address: "江北区北城天街XXX", //订单地址
					order_ext: "尽快送到", //附加内容
					order_mobile: "13452523000", //订单电话
					order_name: "撒啊", //订单用户姓名
					order_pay_val: 0, //已支付金额
					order_time: 13245648, //订单时间,unix时间戳
					order_total: 0.1, //订单总价
					order_total_pay: 0.1, //总共所需付款金额
					shop_name: "店铺1", //店铺名称
					shop_tel: "13452523000", //店铺电话
					state: 0, //0等待处理, 1待付款,
					menu:[{
						menu_id: 1,
						menu_title: "零食"
					}]
				}
			],
			msg: "success",
			no: 0
		},
		autoRefresh : function(){
			var _this = this;
			_this.save({});
			setTimeout(function(){
				_this.autoRefresh();
			}, 2000);
		}
	});

	var Order_View = Backbone.View.extend({
		initialize : function(options){
			this.model.on('change', this.render, this);
		},
		template : $("#table_template").html(),

		events : {

		},

		render : function(){
			var _this = this;
			$(this.el).html(_.template(_this.template)({
				peoples : _this.model.toJSON().data
			}));
		}
	});



	var router =  new Router();
	var order_view = new Order_View({el : $("#person_info"), model : new Order_Model()});

	router.on('route:home', function(){
		order_view.render();
	});

	Backbone.history.start();
})();