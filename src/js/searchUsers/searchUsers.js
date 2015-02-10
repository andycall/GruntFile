(function(){

	"use strict";

	Backbone.emulateHTTP = true;
	//Backbone.emulateJSON = true;

	var Router = Backbone.Router.extend({
		routes : {
			'' : "home",
			"result/:index" : "result"
		},
		searchState : false
	});


	var ResultModel = Backbone.Model.extend({
		url : "/searchUsers",
		defaults: {
			data:[

			],
			msg: "success",
			no: 0
		}
	});

	var FormModel = Backbone.Model.extend({
		defaults : {
			username : "",
			type : 0
		},
		regTest : {
			username : /^[\w\u4E00-\u9FA5][\u4E00-\u9FA5\w\d_]{0,19}$/,
			type : /\d{1}/
		},

		errMsg : {
			username : "用户名输入错误！",
			type : "用户类型输入错误！"
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

	var ResultView = Backbone.View.extend({
		initialize : function(options){
			this.model.set("data", router.formData);
		},
		template : _.template($("#table_template").html()),
		render : function(index){
			var _this = this;
			$(this.el).html(_this.template({
				value : _this.model.toJSON().data[index]
			}));
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

			options.resultModel.on('change', this.render, this);

		},
		flag : true,
		is_ready : false,
		select_index : 0,
		events : {
			"submit #search-form" : "submit_func",
			"keydown #username" : "blur_search",
			"click .search_item" : "dream_true"
		},
		render : function(){
			var _this = this;
			if(_this.is_ready && this.options.resultModel.toJSON().data.length > 0){
				$("#search-dropdown").
					html(_this.template({ users  : this.options.resultModel.toJSON().data})).
					show();
			}
		},
		template : _.template($("#search_template").html()),
		dream_true : function(e){
			var item = e.target;
			while(item.nodeName !== "A"){
				item = item.children[0];
			}

			var username = item.innerHTML;
			var type = $(item).attr('data-type');
			var index=  $(item).attr('data-index');

			$("#username").val(username);
			$("#type").val(type);
			$("#search-dropdown").hide();

			this.select_index = parseInt(index);
		},
		is_sending : false,
		"blur_search" : function(e){
			var _this = this;
			if(_this.is_sending){
				return true;
			}
			_this.is_ready = true;
			setTimeout(function(){
				var data = $(e.target).serializeObject();

				_this.is_sending = true;
				_this.options.resultModel.save(data, {
					success : function(){
						_this.is_sending = false;
					}
				});
			}, 10);
		},
		"submit_func" : function(e){
			e.preventDefault();
			var data = $(e.target).serializeObject();
			var _this = this;
			data.start_time = +$("#start_time").datepicker("getDate");
			data.end_time = +$("#end_time").datepicker("getDate");

			this.flag = true;

			this.model.set(data, {
				validate : true
			});

			if(this.flag){
				router.formData = this.options.resultModel.get('data');
				router.searchState = true;
				router.navigate("/result/" + this.select_index, {trigger: true});
			}
			return false;

		}
	});

	var router =  new Router();
	var person_info = $("#person_info");

	var form_view = new FormView({el : person_info, model :new FormModel(), resultModel : new ResultModel()});

	router.on('route:home', function(){
		//form_view.render();
	});

	router.on('route:result', function(index){
		if(!this.searchState){
			return router.navigate('/home', {trigger: true});
		}
		var result_view = new ResultView({el : person_info, model : new ResultModel()});
		result_view.render(index);
	});

	Backbone.history.start();
})();