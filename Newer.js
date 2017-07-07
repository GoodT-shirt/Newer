(function( window, undefined ) {
    var jQuery = (function(){
        var jQuery = function(selector){
            return new jQuery.fn.init(selector);
        };

        //这里fn是prototype的别名，后面的代码扩展fn就是扩展prototype，fn写起来简短
        //如果后面引用了大量的prototype，prototype因为是关键字，还不能被压缩
        jQuery.fn = jQuery.prototype = {
            constructor: jQuery,


            //这是一个构造函数,应该将this转换为一个类数组对象
            init: function(selector, context){
                var results;

                this.length = 0;
                this.add = function(elem){
                	Array.prototype.push.call(this, elem);
                };

                if(typeof selector === "string"){		//选择器表达式字符串
                    results = jQuery.find(selector, context);
                    for(var i = 0; i < results.length; i++){
                    	this.add(results[i]);		//会自动增加length
                    }
                }
                else if(typeof selector === "object"){  //DOM对象
                	/*
                    this[0] = [selector];       //第0个元素是一个数组，数组里的每一个元素都是DOM元素（对象）
                    this.length = 1;*/
                    this.add(selector);
                }
                else if(typeof selector === "function"){//函数
                    //debugger;
                    jQuery.getReady(selector);
                }

                return this;
            }
        };
        jQuery.fn.init.prototype = jQuery.fn;
        jQuery.extend = jQuery.fn.extend = function(){
            var ob = arguments[0];
            for(var p in ob){
                if(ob.hasOwnProperty(p) && (!this.hasOwnProperty(p))){
                    this[p]=ob[p];
            }
            }
        };
        var readyList = [];
        jQuery.extend({
            find:function(selector, context) {
                //return 10;
                var root;
                //如果没有root,就从document开始查找
                root = context || document;
                //
                var parts = selector.split(" "),                //以空格分离选择器
                    query = parts[0],                           //取出第一段结果
                //slice返回从第1项到最后一项组成的一个新数组
                //join把数组中的每个元素转换为字符串，并且用空格连接起来，形成一个String对象
                    rest = parts.slice(1).join(" "),
                    elems = root.getElementsByTagName(query),   //查找匹配第一段选择器的元素
                    results = [];                               //初始化一个数组，用于保存查询结果

                for(var i = 0; i < elems.length; i++){
                    if(rest){
                        //递归查找，以elems[i]为上下文，以rest为选择器表达式
                        //concat会创建一个原数组的副本，并将find的结果添加到results末尾,，这里又将这个副本的引用存回results
                        results = results.concat(jQuery.find(rest, elems[i]));
                    }
                    else{
                        //将查找到的元素保存在results数组上
                        results.push(elems[i]);
                    }
                }
                return results;
            },
            getReady:function(fn){
                readyList.push(fn);
            },
            watFormDomReady:function(){
                var isReady = false,                                   //#A Start off assuming that we're not ready
                    contentLoadedHandler;

                function ready() {                                     //#B Function that triggers the ready handler and records that fact
                    if (!isReady) {
                        $(document).triggerEvent("ready");			    // 触发一次
                        for(var i = 0; i < readyList.length; i++){
                            readyList[i]();
                        }
                        isReady = true;                                 //DOM就绪了
                    }
                }

                if (document.readyState === "complete") {               //#C If the DOM is already ready by the time we get here, fire the handler
                    ready();
                }

                if (document.addEventListener) {                       //#D For W3C browsers, create a handler for the DOMContentLoaded event that fires off the ready handler and removes itself
                    contentLoadedHandler = function () {
                        document.removeEventListener(
                            "DOMContentLoaded", contentLoadedHandler, false);
                        ready();
                    };

                    document.addEventListener(                             //#E Establish the handler
                        "DOMContentLoaded", contentLoadedHandler, false);

                }

                else if (document.attachEvent) {                        //#F For IE Event Model, create a handler that removes itself and fires the ready handler if the document readyState is complete
                    contentLoadedHandler = function () {
                        if (document.readyState === "complete") {
                            document.detachEvent(
                                "onreadystatechange", contentLoadedHandler);
                            ready();
                        }
                    };

                    document.attachEvent(                                  //#G Establish the handler. Probably late, but is iframe-safe.
                        "onreadystatechange", contentLoadedHandler);

                    var toplevel = false;
                    try {
                        toplevel = window.frameElement == null;
                    }
                    catch (e) {
                    }

                    if (document.documentElement.doScroll && toplevel) {     //#H If not in an iframe try the scroll check
                        doScrollCheck();
                    }
                }

                function doScrollCheck() {                                  //#I Scroll check process for legacy IE
                    if (isReady) return;
                    try {
                        document.documentElement.doScroll("left");
                    }
                    catch (error) {
                        setTimeout(doScrollCheck, 1);
                        return;
                    }
                    ready();
                }
            }
        });
        //用于扩展全局对象，所以不用jQuery.fn.extend
        jQuery.extend({
            isFunction: function () {
                if(typeof arguments[0] == "function")
                    return true;
                else
                    return false;
            }
        });

        jQuery.extend({
            isFrom:function(){
            return argument[0].constructor == arguments[1];
            //return arguments[0] instanceof arguments[1];
        }});


        jQuery.extend({
            each:function(obj,callback){
                for(var i = 0; i < obj.length; i++){
                    callback.call(obj || null, obj[i], i, obj);
                }
            }
        });
/*
 对于HTML文档，getElementsByTagName返回的是一个HTMLCollection对象，该对象和NodeLIst对象很类似，该函数是用C++实现的
 详见《JS高程》P257
 return jQuery.makeArray(document.getElementsByTagName(selector));
*/
        jQuery.extend({
            makeArray:function( array, results ){
                //array是HTMLCollection对像
                array = Array.prototype.slice.call( array, 0 );
                if ( results ) {
                    results.push.apply( results, array );
                    return results;
                }

                return array;
            }
        });
        //扩展原型对象
        jQuery.fn.extend({
            css:function(name, value){
                var contentArray = this[0];     //选择器查询结果集
                if(arguments.length == 2){
                    for(var i = 0; i < this.length; i++){
                        contentArray[i].style[name] = value;
                    }
                    return this;
                }
                else if(arguments.length == 1){
                    return contentArray[0].style[name];
                }
            }
        });

        var cache ={},                  //保存和元素相关联的数据
            guidCounter = 1,            //Globally Unique Identifier，全局唯一标识符
            expando = "data" + (new Date).getTime();  //一个属性名称，用于保存GUID。使用当前时间戳防止和elem中的用户自定义名称冲突
        jQuery.extend({
            getData:function(elem){
                var guid = elem[expando];       //获取己经赋值给元素的GUID
                if (!guid) {                    //如果是第一次在elem上调用getData,则会不存在
                    guid = elem[expando] = guidCounter++;       //创建该GUID，保存在expando位置上
                    cache[guid] = {};           //给GUID创建一个新的空对象
                }
                return cache[guid];             //返回该对象，即可用于存储数据和函数
            },
            removeData:function(elem){
                var guid = elem[expando];
                if (!guid) return;
                delete cache[guid];
                try {
                    delete elem[expando];
                }
                catch (e) {
                    if (elem.removeAttribute) {
                        elem.removeAttribute(expando);
                    }
                }
            }
        });

        var nextGuid = 1;
        jQuery.fn.extend({
            //elem：需要绑定处理程序的元素，type:事件的类型，fn：处理程序自身
            bind: function(type, fn) {
                for (var i = 0; i < this.length; i++) {
                    elem = this[i];     //逐个处理DOM元素
                    var data = jQuery.getData(elem);                           //elem相关的数据 ，并保存在data中
                    if (!data.handlers) data.handlers = {};             //创建handlers属性，用于存储各种类型事件的处理程序的数据块
                    if (!data.handlers[type])                           //为每一个事件类型创建一个数组
                        data.handlers[type] = [];
                    if (!fn.guid) fn.guid = nextGuid++;                 //为每个传入的函数都添加一个guid属性，用于标识处理函数，方便解绑
                    data.handlers[type].push(fn);                       //相同事件类型的多个处理程序入同一个栈
                    if (!data.dispatcher) {                             //超级处理程序，称为调度器，如果不存在，则创建该调度器
                        data.disabled = false;                          //创建调度器时，置为false
                        data.dispatcher = (function(elem) {
                            //要绑定当时的执行环境elem，
                            return function (event) {            		//该调度器在有事件发生时，触发绑定的函数.注意，该event对象是事件发生时由浏览器传入的
                                // debugger;
                                if (data.disabled) return;                  //检查是否禁用标记，如果有，则不触发绑定的函数
                                event = jQuery.fixEvent(event);
                                var handlers = data.handlers[event.type];   //获取相应事件类型的处理程序数组
                                if (handlers) {
                                    for (var n = 0; n < handlers.length; n++) {   //调用注册到该事件类型下的每一个处理程序，并且是按顺序调用的
                                        handlers[n].call(elem, event);            //并以当前元素为处理函数的上下文，并将Event对象作为唯一的参数进行传入
                                    }
                                }
                            };
                        })(elem);
                    }

                    if (data.handlers[type].length == 1) {              //第一次为该事件类型创建处理程序
                        if (document.addEventListener) {				//DOM MODEL
                        	//这样dispatcher即成为该元素的事件委托函数，事件发生时真正调用的
                        	//是该委托函数，第三个参数false，说明使用冒泡处理程序
                            elem.addEventListener(type, data.dispatcher, false);    
                        }
                        else if (document.attachEvent) {				//IE MODEL
                        	//IE MODEL给绑定的处理程序设置了错误的上下文(设成了window)，而不是事件目标元素
                        	//但上面的data.dispatcher己经修正了该问题
                            elem.attachEvent("on" + type, data.dispatcher);
                        }
                    }
                 }
            },
            unbind:function(type, fn){
                var contentArray = this[0];
                for (var i = 0; i < this.length; i++) {
                    elem = contentArray[i];
                    var data = jQuery.getData(elem);                           //获取与元素相关的数据

                    if (!data.handlers) {
                        continue;
                    }                        //检测是否包含任何处理程序

                    var removeType = function (t) {                      //#4
                        data.handlers[t] = [];        //置为空数组，则立刻将该事件类型的所有处理程序全部删除，同时导致data.handlers[t].length为0，从而可以调用tideUp进行清理
                        jQuery.tidyUp(elem, t);
                    };

                    if (!type) {              //省略了type参数，则删除所有事件类的处理程序
                        for (var t in data.handlers) removeType(t);
                        continue;
                    }

                    var handlers = data.handlers[type];              //#6
                    if (!handlers) return;

                    if (!fn) {                                          //#7
                        removeType(type);
                        continue;
                    }

                    if (fn.guid) {                              //#8
                        for (var n = 0; n < handlers.length; n++) {
                            if (handlers[n].guid === fn.guid) {
                                handlers.splice(n--, 1);
                            }
                        }
                    }
                    jQuery.tidyUp(elem, type);
                }
            }
        });

        jQuery.extend({
            tidyUp:function(elem, type){
                //判断object是否有任何属性
                function isEmpty(object) {
                    for (var prop in object) {
                        return false;
                    }
                    return true;
                }
                //获取该元素的数据块
                var data = jQuery.getData(elem);

                if (data.handlers[type].length === 0) {             //判断该事件类型关联的处理程序数组是否为空

                    delete data.handlers[type];                     //删除该事件类型关联的处理程序数组
                    //该事件类型的委托程序也没有必要存在了
                    if (document.removeEventListener) {				//支持DOM MODEL
                        elem.removeEventListener(type, data.dispatcher, false);
                    }
                    else if (document.detachEvent) {				//支持IE MODEL
                        elem.detachEvent("on" + type, data.dispatcher);
                    }
                }
                //可能handlers下一个事件类型的数组都没有了，则该handlers对像本身也没必要存在了(handlers的每个成员都是一个数组）
                if (isEmpty(data.handlers)) {                        //#3
                    delete data.handlers;
                    delete data.dispatcher;
                }
                //由于上述的各种删除操作，该元素的相关数据都没有，则data也可删除，即cache[guid]和elem[expando]
                if (isEmpty(data)) {
                    jQuery.removeData(elem);
                }
            }
        });

        jQuery.extend({
            fixEvent:function(event){
                function returnTrue() {
                    return true;
                }                            //#1
                function returnFalse() {
                    return false;
                }
                //如果event实例不存在，或者存在，但是缺少标准stopPropagation属性，那么我们就认
                //为需要对其修复。首先获取event对象的副本
                if (!event || !event.stopPropagation) {                           
                    var old = event || window.event;		//该副本可能是传入的event对象(DOM MODEL)，也可能是全局上下文上的event对象(IE MODEL)
                    //创建一个空对象作为修复后的event对象
                    event = {};
                    //将old事件对象中的所有属性都赋值到新对象上
                    for (var prop in old) {                                         
                        event[prop] = old[prop];
                    }
                    // 事件所在的元素，IE MODEL中，原始源保存在srcElement中
                    if (!event.target) {
                        event.target = event.srcElement || document;
                    }

                    //事件触发时的关联元素, mouseover事件发生时会有一个关联元素toElement, mouseout事件发生时会有关联元素fromElement
                    event.relatedTarget = event.fromElement === event.target ?
                        event.toElement :
                        event.fromElement;

                    // 阻止默认浏览器行为，该属性在IE MODEL中不存在
                    event.preventDefault = function () {
                        event.returnValue = false;		//在IE中要阻止默认行为的发生，需要将returnValue设为false
                        event.isDefaultPrevented = returnTrue;		//下面又置为returnFalse
                    };

                    event.isDefaultPrevented = returnFalse;

                    // 阻止事件冒泡，该属性在IE MODEL中不存在
                    event.stopPropagation = function () {
                        event.cancelBubble = true;
                        event.isPropagationStopped = returnTrue;
                    };

                    event.isPropagationStopped = returnFalse;

                    // 阻止事件冒泡并执行其他处理程序
                    event.stopImmediatePropagation = function () {
                        this.isImmediatePropagationStopped = returnTrue;
                        this.stopPropagation();
                    };

                    event.isImmediatePropagationStopped = returnFalse;

                    //处理鼠标位置
                    if (event.clientX != null) {
                        var doc = document.documentElement, body = document.body;
                        //pageX,pageY提供鼠标相对于整个文档的位置，这两个属性在IE MODEL中不存在，但可以从其他信息中获取
                        //在IE中，clientX/Y提供鼠标相对于窗口的位置，而scrollTop/Left则给出了文档滚动的位置
                        //并且clientTop/Left给出了文档的偏移量。
                        event.pageX = event.clientX +
                            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                            (doc && doc.clientLeft || body && body.clientLeft || 0);
                        event.pageY = event.clientY +
                            (doc && doc.scrollTop || body && body.scrollTop || 0) -
                            (doc && doc.clientTop || body && body.clientTop || 0);
                    }

                    // 键盘事件时所按按键的键盘码，IE MODEL中可通过charCode和keyCode属性获取
                    event.which = event.charCode || event.keyCode;

                    // 鼠标事件发生时，用户单击的鼠标按键。DOM MODEL的左中右是0, 1, 2，而IE MODEL的左中右是1,2,4
                    if (event.button != null) {
                        event.button = (event.button & 1 ? 0 :
                            (event.button & 4 ? 1 :
                                (event.button & 2 ? 2 : 0)));
                    }
                }
                return event;                                                //#4
            }
        });

        //一般来说是触发单个元素
        jQuery.fn.extend({
            triggerEvent: function(event){
              for(var i = 0; i < this.length; i++){
	              //var contentArray = this[0];
	              //elem = contentArray[0];		
	              elem = this[i];						
				  var elemData = jQuery.getData(elem),                  //获取元素数据
				  parent = elem.parentNode || elem.ownerDocument;		//获取元素的父元素
				  if (typeof event === "string") {                      //如果传入的event名称是一个字符串(还可以是一个事件对象)
				    event = { type:event, target:elem };				//就为此创建一个event对象
				  }
				  event = jQuery.fixEvent(event);                       //对event属性进行规范化
				  if (elemData.dispatcher) {                            //如果传入的元素有事件调度器，则执行它
				    elemData.dispatcher.call(elem, event);				
				  }
				  if (parent && !event.isPropagationStopped()) {        //如果有父元素，而且没有显式停止冒泡	
				  	var obj ={
				  		0: [parent]
				  	};		
				  	 $(parent).triggerEvent(event);						//则在父元素上触发该事件
				  }
				  else if (!parent && !event.isDefaultPrevented()) {    //如果DOM到顶了(到达document元素)，并且没有禁用默认行为
				    var targetData = jQuery.getData(event.target);
				    if (event.target[event.type]) {                     //判断元素有没有该事件的默认行为
				      targetData.disabled = true;                       //临时禁用事件调度器，因为在上面己经执行了调度器,不想再重复执行了
				      event.target[event.type]();                       //执行默认行为，可能引发调度器被调用
				      targetData.disabled = false;                      //重新打开调度器
				    }
				  }
			   }
           }
        });
        jQuery.extend({
            //添加一个中央定时器
            timers: {
                timerID: 0,               //当前定时器ID
                timers: [],               //当前定时器要执行的一系列处理函数

                add: function(fn) {
                    this.timers.push(fn);
                },

                start: function() {
                    if (this.timerID) return;   //己经有一个中央定时器在运行
                    //制造一个闭包，使runNext可以一直访问jQuery.timers
                    (function(thisObj) {
                        (function runNext() {
                            if (thisObj.timers.length > 0) {     //还有处理函数没有执行完
                                for (var i = 0; i < thisObj.timers.length; i++) {
                                    if (thisObj.timers[i]() === false) { //处理程序执行时返回false
                                        thisObj.timers.splice(i, 1);      //将该处理程序从数组中移除
                                        i--;
                                    }
                                }
                                //再一次调度,timerID的值会变，但不会是0
                                //这里的调度使得jQuery.timers.start();后面的程序有机会执行
                                thisObj.timerID = setTimeout(runNext, 0);
                            }
                            else{
                                console.log("%d,%d", thisObj.timers.length, thisObj.timerID);
                                thisObj.stop();
                                console.log("%d,%d", thisObj.timers.length, thisObj.timerID);
                            }
                        })();
                    })(this);
                },

                stop: function() {                                             //#5
                    clearTimeout(this.timerID);
                    this.timerID = 0;
                }
            }
        });
        jQuery.extend({
        	//预解析html字符串，将<table/>这样的自关闭元素转换为<table></table>
        	convert: function(html){
        		var tags = /^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i;

		        return html.replace(/(<(\w+)[^>]*?)\/>/g, function (all, front, tag) {
													          return tags.test(tag) ? all: front + "></" + tag + ">";
		        });
        	},
        	//从html字符串生成一个DOM列表
        	getNodes: function(htmlString,doc, fragment) {
        		//元素类型和特殊父容器之间的映射。每个映射都有3个值：节点深度，父元素开启标签和父元素关闭标签
		        var map = {                                                     
		          "<td":[3, "<table><tbody><tr>", "</tr></tbody></table>"],
		          "<th":[3, "<table><tbody><tr>", "</tr></tbody></table>"],
		          "<tr":[2, "<table><thead>", "</thead></table>"],
		          "<option":[1, "<select multiple='multiple'>", "</select>"],
		          "<optgroup":[1, "<select multiple='multiple'>", "</select>"],
		          "<legend":[1, "<fieldset>", "</fieldset>"],
		          "<thead":[1, "<table>", "</table>"],
		          "<tbody":[1, "<table>", "</table>"],
		          "<tfoot":[1, "<table>", "</table>"],
		          "<colgroup":[1, "<table>", "</table>"],
		          "<caption":[1, "<table>", "</table>"],
		          "<col":[2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
		          "<link":[3, "<div></div><div>", "</div>"]
		        };
		        //使用正则表达式匹配开始尖括号和要注入的元素标签名称，如<td
		        var tagName = htmlString.match(/<\w+/), //#2
		            mapEntry = tagName ? map[tagName[0]] : null;                
		        //如果匹配了映射中的内容就获取该条目 ，否则就构建一个深度为0的虚假空父标签
		        if (!mapEntry) mapEntry = [0, "", ""];                          
		        //创建一个<div>元素
		        var div = (doc || document).createElement("div");               
		        //将要注入的新标签包装在来自映射的父元素中，然后将其作为新创建<div>的innterHTML内容进行注入
		        div.innerHTML = mapEntry[1] + htmlString + mapEntry[2];         
		        //循环结束后，最终的div是新创建元素的父元素
		        while (mapEntry[0]--) div = div.lastChild;                      

		        //将div下的子节点列表添加到fragment中
		        //任何DOM节点都不能同时出现在文档中的多个位置
		        //document对象是window对象的一个属性,高程P253页
		        if (fragment) {
		          while (div.firstChild) {
		            fragment.appendChild(div.firstChild);
		          }
		        }

		        //返回新创建的元素（或元素集合）
		        return div.childNodes;                                          
	      },
	      //elems是一个集合，应该是一个类数组对象
	      insert: function(elems, args, callback) {
	          if (elems.length) {
	            var doc = elems[0].ownerDocument || elems[0],
	            	//创建一个文档片段
	                fragment = doc.createDocumentFragment(),
	                //args是html字符串，doc是调用createElement函数的对象,生成的DOM节点存放在fragment中
	                scripts = jQuery.getNodes(args, doc, fragment),
	                first = fragment.firstChild;
		            //fragment里非空
		            if (first) {
		              for (var i = 0; elems[i]; i++) {
		              	//callback函数中有用到this对象，所以使用call方式调用，调用之前先用root函数获取插入位置(插入的所在元素，即其父元素)
		                callback.call(jQuery.root(elems[i], first),
		                    i > 0 ? fragment.cloneNode(true) : fragment);	//对片段进行克隆
		              }
		            }
		          }
	        },
	      //要将cur插入到elem中
	      root:function(elem, cur) {
			  return elem.nodeName.toLowerCase() === "table" &&//如果elem是<table>
			      cur.nodeName.toLowerCase() === "tr" ?//cur是<tr>
			      (elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")))//则返回<tbody>，表示实际是要将<tr>插入到<tbody>中
			      : elem;	//否则就是要插入到elem元素中
		  },
		  loadScript: function(url, callback,elem){
		  	var script = document.createElement("script"), elem = elem || document.body;
		  	script.onload = function(){
		  		if(callback){
		  			callback();
		  		}
		  	};
		  	script.type = "text/javascript";
		  	script.src = url;
		  	elem.appendChild(script);
		  },
		  loadScriptString: function(code, elem){
		  	var script = document.createElement("script"), elem = elem || document.body;
		  	script.type = "text/javascript";
		  	try{
		  		script.appendChild(document.createTextNode(code));	//标准的DOM文本节点方法，但IE将<script>视为一个特殊元素，不允许DOM访问其子节点
		  	}catch(ex){
		  		script.text = code;		//抛出异常，肯定是IE，IE可以使用text属性
		  	}
		  	elem.appendChild(script);
		  },
		  //实时向页面中添加样式，马上能看到
		  loadStyleString: function(css){
            var style = document.createElement("style");
            style.type = "text/css";
            try{
                style.appendChild(document.createTextNode(css));
            } catch (ex){
                style.styleSheet.cssText = css;
            }
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(style);
           },
           //由于要下载，所以会比较慢
          loadStyles:function(url){
           	 var link = document.createElement("link");
           	 link.rel = "styleSheet";
           	 link.type = "text/css";
           	 link.href = url;
           	 var head = document.getElementsByTagName("head")[0];
           	 head.appendChild(link);
          }
    	
     
        });

		jQuery.extend({
			createCanvas:function(elem, cont){
				var canvas = document.createElement('canvas'), context = canvas.getContext('2d'), elem = elem || document.body, cont = cont || {};
				canvas.id = 'canvas';
				//长宽设置要在设置context.font之前
				if(cont.width)
					canvas.width = cont.width;
				else 
					canvas.width = 600;
				if(cont.height)
					canvas.height = cont.height;
				else
					canvas.height = 300;
				
				if(cont.font)
					context.font = cont.font;
				else
					context.font = '38pt Arial';

				if(cont.fillStyle)
					context.fillStyle = cont.fillStyle;
				else
					context.fillStyle = 'cornflowerblue';

				if(cont.strokeStyle)
					context.strokeStyle = cont.strokeStyle;
				else
					context.strokeStyle = 'blue';
				

				if(!cont.text)
					cont.text = 'Hello Canvas';

				if(!cont.textX)
					cont.textX  = canvas.width / 2 - 150;
				if(!cont.textY)
					cont.textY = canvas.height / 2 + 15;
				
				context.fillText(cont.text, cont.textX, cont.textY);
				context.strokeText(cont.text, cont.textX, cont.textY);
				elem.appendChild(canvas);
			}
		});

        jQuery.extend({
            matchAllChar:function(str){
                return /.*/.exec(str)[0];       //只能匹配到换行符为止，即只返回换行符前面的字符串
                return /[\S\s]*/.exec(str)[0];  //会返回字符串str自身，无论str是否包含换行符，记住没有？操作符，匹配操作是贪婪的，即会返回匹配的整个字符串
                return /(?:.|\s)*/.exec(str)[0];//(.)匹配除换行符以外的所有内容，\s所有是空白的字符包括换行符，结果是包含换行符在内的所有字符，是两个集合的并集,(?:)的作用是使该圆括号不要进行捕获，以提升性能 
            },
            matchWholeUnicode:function(text){
                /*
                \w：匹配任意单词字符
                \u0080-\uFFFF
                _-：匹配下划线和中横线
                */
                var matchAll = /[\w\u0080-\uFFFF_-]+/;   
                text.match(matchAll);
            },
            //匹配转义字符
            /*
             var tests = [                                           //#2
                    "formUpdate",
                    "form\\.update\\.whatever",
                    "form\\:update",
                    "\\f\\o\\r\\m\\u\\p\\d\\a\\t\\e",
                    "\\\\\\\\",
                    "form:update"       //不能匹配，因为:前面没有反斜杠
                  ];
            */
            matchEscapeChar:function(test){
                /*
                ^:匹配开头
                (\w):匹配一个单词字符
                (\\.):匹配一个反斜杠后跟随任意字符（可以是另外一个反斜杠）
                */
                  var pattern = /^((\w+)|(\\.))+$/;                       
                  if(pattern.test(test[n])) return true;
                  else return false;
            },
            /*
            |操作符左边是^\s+：匹配开始的至少一个空格
            |操作符右边是\s+$:匹配结束的至少一个空格
            */
            trim:function(str){
                 return (str||"").replace(/^\s+|\s+$/g, ""); 
            },
            /*
            假使传入的参数为border-bottom-width
            则upper会被调用两次，第一欠传入的是-b,b,第二次传入的是-w,w
            */
            makeCamel:function(str){
                //all是匹配正则的完整字符串,letter是一个捕获
                var upper =  function(all,letter){
                    return letter.toUpperCase(); 
                }  
                str.replace(/-(\w)/g,upper) 
            },
            /*
            假设source为"foo=1&foo=2&blah=a&blah=b&foo=3"
            则function会被调用五次，full为别是：foo=1,foo=2,blah=a,blah=b,foo=3
            而key分别是foo,foo,blah,blah,foo
            value分别是：1,2,a,b,3
            */
            compress:function(source){
                var keys = {};                                     
                var num = 0; 
                /*
                可见，括号（）有两个作用：分组，捕获
                ([^=&]+):匹配除了=和&(既不能有=也不能有&)之外的至少一个字符，即键
                ([^&]*):匹配除&之外的任意个字符(可以没有)
                */
                source.replace(/([^=&]+)=([^&]*)/g,
                            function(full, key, value) {                     
                                keys[key] =(keys[key] ? keys[key] + "," : "") + value;
                                return "";
                                });

                var result = [];                                   
                for (var key in keys) {                            
                    result.push(key + "=" + keys[key]);              
                }                                                 

                return result.join("&");     
            },
            getOpacity:function(elem){
                var filter = elem.style.filter;
                return filter ?                                                     //存在filter属性
                filter.indexOf("opacity=") >= 0 ?   //且找到了"opacity="
                    (parseFloat(filter.match(/opacity=([^)]+)/)[1]) / 100) + "" :
                    "" :
                elem.style.opacity;
                /*
                ([^)]+)：匹配除了)的任意个字符, /100后将转换为小数
                */
            },
            findClassInElements:function(className, type){
                var elems = document.getElementsByTagName(type || "*");
                /*
                /(^|\s)className(\s|$)/
                看正则要看整体，不然很容易迷糊
                */
                var regex = new RegExp("(^|\\s)" + className + "(\\s|$)");
                var results = [];                                      //#4
                for (var i = 0, length = elems.length; i < length; i++){
                    if (regex.test(elems[i].className)) {                //能匹配指定className
                        results.push(elems[i]);                          //DOM元素入栈
                    }
                }
                return results;
            },
            findTagInLocalWithMatch:function(str){
                var all = str.match(/<(\/?)(\w+)([^>]*?)>/);    
                var results=[];     //创建一个数组，是在全局堆内存中

                for(var i = 0; i < all.length; i++){
                    results.push(all[i]);       //all[0]是与整个模式匹配的字符串，all[1~]是捕获结果
                }
                return results;
            },
            findTagInLocalWithMatch:function(str){
                var all = str.match(/<(\/?)(\w+)([^>]*?)>/g);    
                var results=[];

                for(var i = 0; i < all.length; i++){
                    results.push(all[i]);       //和exec不同，全局模式时，一次性返回所有匹配结果（不是捕获结果）
                }
                return results;
            },
            findTagInGlobalWithExec:function(str){
                /*
                两边的<>表示它匹配的是开始标签(连同里面的属性)或结束标签
                (\/?)结合前面的<：匹配<或</
                (\w+):匹配任意个字母
                ([^>]*?)：匹配除了>的任意个字符，包括空格
                */
                  var pattern = /<(\/?)(\w+)([^>]*?)>/g, match;
                  var num = 0;
                  var results=[];

                  while ((match = pattern.exec(str)) !== null) {                  //#1
                        results.push(match[0]);     //match[0]是与整个模式匹配的字符串,match[1~]是捕获结果
                  }

             },
                        
            //匹配整个标签，包括其中的内容，如<b class="hello">Hello</b>
            matchWholeTag:function(str){
                /*
                首先看头和尾，分别是<和>，其次看分组和引用，有3个分组和1个引用
                (\w+)：匹配任意单词，可以有下划线，如_a,_abc,A都能匹配
                ([^>]*)：匹配除了>的任意个字符，自然包括空格
                (.*)：匹配开始标签和结束标签的内容
                <\/\1>：匹配和开始标签配对的结束标签
                */
                var pattern = /<(\w+)([^>]*)>(.*?)<\/\1>/g; 
                var match = pattern.exec(str);
                /*
                match[0]:与整个模式匹配的字符串
                match[1]:与第一个捕获组匹配的字符串
                match[2]:与第二个捕获组匹配的字符串,依次类推
                在有全局标志g的情况下，每次调用都返回下一个匹配及其捕获内容，例如<b>Hello</b> <i>world!</i>
                需要调用两次exec，才能分别获取<b>Hello</b>和<i>world!</i>
                */
                return match;
            }
        });




         //为就绪事件增加监听程序，当DOM完全加载完毕时会回来执行这里的事件处理程序
    	jQuery.watFormDomReady();
        return jQuery;
    })();
    window.jQuery = window.$ = jQuery;
})(window);


