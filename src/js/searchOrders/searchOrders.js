(function(){

	"use strict";

	Backbone.emulateHTTP = true;

	var Router = Backbone.Router.extend({
		routes : {
			'' : "home",
			"result" : "result"
		},
		searchState : false
	});


	var ResultModel = Backbone.Model.extend({
		defaults: {
			data : [
				{
					order_id: 1,
					order_address : "北城天街",
					order_ext : "尽快送到",
					order_mobile : "18532016284",
					order_name : "andycall",
					order_pay_val : 0,
					order_time : 1423122546738,
					order_total : 0.1,
					order_total_pay : 0.2,
					shop_name : "KFC",
					shop_tel : "18523017284",
					state : 0,
					username : "yhtree",
					menu : [
						{
							menu_id : 1,
							menu_title : "KFC"
						}
					]
				}
			],
			msg : "success",
			no : 0
		}
	});

	var FormModel = Backbone.Model.extend({
		url : "/searchOrders",
		defaults : {
			order_act: "张三", //顾客姓名
			order_mobile: "18500742221", //顾客电话
			order_address: "重庆九龙坡区xxxx", //配送地址
			username: "人员1", //配送人员名称
			type: 0, //0已配送，1未配送
			start_time: 123655, //unix时间戳，js +new Date()类型请除以1000
			end_time: 124523	//unix时间戳，js +new Date()类型请除以1000
		},
		regTest : {
			order_act : /^[\w\u4E00-\u9FA5][\u4E00-\u9FA5\w\d_]{0,19}$/,
			order_mobile : /1[3|5|7|8][0-9]{9}/,
			order_address : /[\u4E00-\u9FA5|\w]{2,22}/,
			username : /[\w\u4e00-\u9fa5]{2,6}/,
			start_time : /\d{13}/,
			end_time : /\d{13}/
		},

		errMsg : {
			order_act : "用户名输入错误！",
			order_mobile : "手机号码输入错误！",
			order_address : "地址输入错误！",
			username : "用户名输入错误！",
			start_time : "开始时间错误！",
			end_time : "结束时间错误！"
		},
		validate : function(attrs){
			var _this = this;
			for(var key in attrs){
				if(attrs.hasOwnProperty(key)){
					if(!(new RegExp(_this.regTest[key]).test(attrs[key]))){
						console.log(key, attrs[key]);
						_this.trigger("invalid:" + key, _this.errMsg[key], _this);
					}
				}
			}
		}
	});

	var ResultView = Backbone.View.extend({
		initialize : function(options){
			this.model.on('change', this.render(), this);
			this.model.set("data", router.formData);
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


	var FormView = Backbone.View.extend({
		initialize : function(options){
			console.log('inited');
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
			1: "not admin,login again", //查询会矫正对应的cookie
			2: "timeout" //后端超时
		},
		events : {
			"submit #search-form" : "submit_func",
			"blur #start_time" : "deny_time",
			"keydown .select_time" : "disable_input"
		},
		disable_input : function(e){
			return false;
		},
		render: function(){
			$(this.el).html(this.template({}));
		},
		"deny_time" : function(e){
			setTimeout(function(){
				$("#end_time").datepicker("setStartDate", $("#start_time").datepicker("getDate"));
			}, 200);
		},
		template : _.template($("#form_template").html()),
		"submit_func" : function(e){
			var data = $(e.target).serializeObject();
			var flag = true;
			var _this = this;
			data.start_time = +$("#start_time").datepicker("getDate");
			data.end_time = +$("#end_time").datepicker("getDate");
			var errMsg = this.model.errMsg;
			this.$el.find(".form-control").each(function(){
				$(this).removeClass("error");
			});
			/* jshint ignore:start */
			for(var key in errMsg){
				if(errMsg.hasOwnProperty(key)){
					this.model.on("invalid:" + key, function(msg){
						$("#" + this).addClass('error').attr("placeholder", msg);
						flag = false;

					}.bind(key, errMsg[key]));
				}
			}

			/* jshint ignore:end */
			this.model.set(data, {
				validate : true
			});

			if(flag){
				this.model.save(data, {
					success : function(model){
						var flag = false,
							no = parseInt(model.get('no'));
						if(no === 0){
							flag = true;
							router.formData = model.get('data');
							router.searchState = true;
							router.navigate("/result", {trigger: true});
						}
						_this.log(_this.error[no], flag);

					},
					error : function(error){
						_this.log(error.toString(), false);
					}
				});
			}
			return false;

		}
	});

	var router =  new Router();
	var person_info = $("#person_info");

	var form_view = new FormView({el : person_info, model :new FormModel()});

	router.on('route:home', function(){
		form_view.render();
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
