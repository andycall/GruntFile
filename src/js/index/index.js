(function(){

    "use strict";

    Backbone.emulateHTTP = true;

    var RouterController = Backbone.Router.extend({
        routes : {
            '' : "home",
            "edit/:id" : "edit"
        },
        pageIndex : 1
    });



    var IndexModel = Backbone.Model.extend({
        initialize : function(){
            var _this = this;
            this.save();
        },
        url : "/getUser",
        autoRefresh : function(){
            var _this = this;
            _this.save();
            _this.refresher = setTimeout(function(){
                _this.autoRefresh();
            }, 2000);
        },
        refresher : null,
        stop : function(){
            clearTimeout(this.refresher);
        },
        start : function(){
            this.autoRefresh();
        },
        defaults: {

        }
    });

    var EditModel = Backbone.Model.extend({
        url : "/editUser",
        defaults : {
            uid: 1, //人员编号，唯一值
            username:"人员1",
            type:0, //0代表业务员，1代表快递员,2表示管理者
            is_login: true, //不可改，请隐藏
            pos: "239,152", //不可改，请隐藏
            phone_num: "18500742221",
            portrait: "http://www.baidu.com/" //人员头像
        },
        regTest : {
            uid : /^\d{1,4}$/,
            phone_num : /1[3|5|7|8][0-9]{9}/,
            username : /[\w\u4e00-\u9fa5]{2,6}/,
            type : /\d{1}/
        },

        errMsg : {
            username : "用户名输入错误！",
            uid : "人员编号错误！",
            phone_num : "手机号码输入错误！",
            type : "人员类型错误"
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

    var IndexView = Backbone.View.extend({
        initialize : function(options){
            this.model.on('change', this.render, this);
        },
        template : $("#table_template").html(),

        events : {
            "click tr" : "click_group"
        },
        "click_group" : function(e){
            var target = e.target;
            while(target.nodeName !== 'TR'){
                target = target.parentNode;
            }
            var index = $(target).index();

            var data = this.model.toJSON().data;

            MapObj.addMarker(data[index - 1]);
        },
        render : function(){
            var _this = this;
            console.log(_this.model.toJSON().data);

            $(this.el).html(_.template(_this.template)({
                peoples : _this.model.toJSON().data
            }));
            $("#page-title").html("获取人员信息");
        }
    });

    var EditView = Backbone.View.extend({
        template : _.template($("#form_template").html()),
        render : function(index){
            $("#page-title").html("编辑人员信息");
            var data = null;
            var _this = this;
            var isEmpty = _.keys(index_view.model.toJSON()).length === 0;
            if(isEmpty){
                index_view.model.on('sync', function(model){
                    _this.$el.html(_this.template({
                        value : model.toJSON().data[index]
                    }));
                    index_view.model.off('sync');
                });
            }
            else{
                this.$el.html(this.template({
                    value : index_view.model.toJSON().data[index]
                }));
            }
        },
        events : {
            "submit #search-form" : "submit_func"
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
        error :{
            0: "success",
            1: "not admin,login again", //查询会矫正对应的cookie
            2: "timeout" //后端超时
        },
        "submit_func" : function(e){
            var data = $(e.target).serializeObject();
            var flag = true;
            var _this = this;
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
                        var no = parseInt(model.get('no'));
                        var flag = false;

                        if(no === 0){
                            flag = true;
                        }
                        _this.log(_this.error[no], flag);

                    },
                    error : function(error){
                        _this.log("哎呀， 失败了╮(╯▽╰)╭", false);
                    }
                });
            }
            return false;
        }
    });


    var person_info = $("#person_info");
    var routerController =  new RouterController();
    var index_view = new IndexView({el : person_info, model : new IndexModel()});
    var edit_view = new EditView({el : person_info, model :new EditModel()});

    window.index_view = index_view;
    routerController.on('route:home', function(){
        index_view.render();
        index_view.model.start();
    });

    routerController.on('route:edit', function(index){
        index_view.model.stop();
        edit_view.render(index);
    });

    Backbone.history.start();
})();