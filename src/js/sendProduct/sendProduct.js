(function(){

	"use strict";

	Backbone.emulateHTTP = true;
	//Backbone.emulateJSON = true;

	var Router = Backbone.Router.extend({
		routes : {
			'' : "home",
			"result" : "result"
		},
		searchState : false
	});


	var FormModel = Backbone.Model.extend({
		defaults : {
			order_id : "",
			uid : 0
		},
		regTest : {
			order_id : /\d{1,3}/,
			uid : /\d{1,3}/
		},

		errMsg : {
			order_id : "",
			uid : ""
		},
		validate : function(attrs){
			var _this = this;
			for(var key in attrs){
				if(attrs.hasOwnProperty(key)){
					if(!(new RegExp(_this.regTest[key]).test(attrs[key]))){
						_this.trigger("invalid:" + key, _this.errMsg[key], _this);
					}
				}
			}
		}
	});


	var Order_Model = Backbone.Model.extend({
		url : "/getOrders",
		initialize : function(){
			this.save();
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
		}
	});
	var Index_Model = Backbone.Model.extend({
		url : "/getUser",
		initialize : function(){
			this.save();
		},
		defaults: {
			data:[
				{
					uid: 1, //人员编号，唯一值
					username:"人员1",
					type:0, //0代表业务员，1代表快递员,2表示管理者
					is_login: true, //是否打卡上班
					pos: "239,152", //经纬度，请使用js进行分割
					phone_num: "18500742221",
					portrait: "http://www.baidu.com/" //人员头像
				}
			],
			msg: "success",
			no: 0
		}
	});

	var ResultView = Backbone.View.extend({
		initialize : function(options){
			var _this = this;
			this.model.on('change', this.render, this);
			this.model.sync("create", router.formData , {
				url : "/sendProduct",
				success : function(data){
					if(parseInt(data.no) === 1){
						_this.model.set(data);
					}
					else{
						router.navigate("/", {trigger: true});
					}
					var flag = false;
					if(data.no === 0){
						flag = true;
					}

					_this.log(_this.error[data.no], flag);
				}
			});
		},
		log : function log(msg, flag){
			var topbar = $("#top_bar");
			topbar.html(msg);
			if(flag){
				topbar.removeClass("red").addClass("blue");
			}
			else{
				topbar.removeClass("blue").addClass("red");
			}
			topbar.animate({
				top: '0'
			});

			setTimeout(function(){
				topbar.animate({
					top : "-50px"
				});
			}, 3000);
		},
		error : {
			0: "success",
			1: "already send",//已被某人员确认配送
			2: "timeout",
			3: "other fail"
		},
		template : $("#table_template").html(),

		events : {

		},

		render : function(){
			var _this = this;
			$(this.el).html(_.template(_this.template)({
				value : _this.model.toJSON().data
			}));
		}
	});


	var ResultModel = Backbone.Model.extend({
		defaults: {
			data:{
				uid: 1, //人员编号，唯一值
				username:"人员1",
				type:0, //0代表业务员，1代表快递员,2表示管理者
				is_login: true, //是否打卡上班
				pos: "239,152", //经纬度，请使用js进行分割
				phone_num: "18500742221",
				portrait: "http://www.baidu.com/", //人员头像
			},
			msg: "success",
			no: 1
		}
	});



	var FormView = Backbone.View.extend({

		initialize : function(options){
			var _this = this;
			_this.options = options || {};
			var errMsg = this.model.errMsg;
			this.$el.find(".form-control").each(function(){
				$(this).removeClass("error");
			});
			for(var key in errMsg){
				if(errMsg.hasOwnProperty(key)){
					/* jshint ignore:start */
					this.model.on("invalid:" + key, function(msg){
						$("#" + this).addClass('error').attr("placeholder", msg);
						_this.flag = false;
					}.bind(key, errMsg[key]));
					/* jshint ignore:end  */
				}
			}


			options.orderModel.on('change', this.render_order, this);
			options.indexModel.on('change', this.render_user, this);
		},
		events : {
			"submit #search-form" : "submit_func",
			"change #order_id" : "order_select",
			"change #type" : "type_select"
		},
		"order_select" : function(e){
			$("#order_result").val(e.target.value);
		},
		"type_select" : function(e){
			$("#uid_result").val(e.target.value);
		},
		template_order : _.template($("#order_template").html()),
		render_order : function(){
			$("#order_container").html(this.template_order({
				orders : this.options.orderModel.toJSON().data
			}));
		},
		template_user : _.template($("#user_template").html()),
		render_user : function(){
			$("#user_container").html(this.template_user({
				users : this.options.indexModel.toJSON().data
			}));
		},
		template_form : _.template($("#form_template").html()),
		render_form : function(){
			this.$el.html(this.template_form({}));
		},
		"submit_func" : function(e){
			e.preventDefault();
			var data = $(e.target).serializeObject();
			var _this = this;

			this.flag = true;

			this.model.set(data, {
				validate : true
			});

			if(this.flag){
				router.formData = this.model;
				router.searchState = true;
				router.navigate("/result", {trigger: true});
			}
			return false;

		}
	});

	var router =  new Router();
	var person_info = $("#person_info");

	var form_view = new FormView({el : person_info, model :new FormModel(), orderModel : new Order_Model(), indexModel : new Index_Model()});


	router.on('route:home', function(){
		form_view.render_form();
		form_view.render_order();
		form_view.render_user();
	});

	router.on('route:result', function(){
		if(!this.searchState){
			return router.navigate('/', {trigger: true});
		}
		var result_view = new ResultView({el : person_info, model : new ResultModel()});
		result_view.render();
	});

	Backbone.history.start();
})();