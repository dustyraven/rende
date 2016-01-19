(function( $ ) {

	if("function" != typeof jQuery)
		throw "jQuery not loaded";

	var Rende = {


		/**
		 *
		 */
		wsFront : function(str)
		{
			return str.match(/^\s*/)[0].length;
		}

		/**
		 *
		 */
		,el : function(str)
		{
			if("string" != typeof str)
			{
				console.warn(str);
				throw new TypeError("Argument is " + typeof str);
			}

			var el, tmp, idx, type, fn, arg, args;

			for(tmp = 1; tmp < arguments.length; tmp++)
			{
				type = typeof arguments[tmp];

				if("string" == type)
					str = str.replace("{"+tmp+"}", arguments[tmp]);
				else if("array" == type || "object" == type)
					for (idx in arguments[tmp])
						str = str.replace("{"+idx+"}", arguments[tmp][idx]);
			}

			str = str.replace("|;","__ESC_SC__").replace("|:","__ESC_CN__").replace("|=","__ESC_EQ__");

			if(-1 == str.indexOf(";"))
				return document.createTextNode(" " + str + " ");

			str = str.split(";");

			el = str.shift();

			if(!/^[a-zA-Z]+[1-6]?$/.test(el))
				throw new TypeError("Invalid tag " + el);

			el = $("<"+el+">");

			while(tmp = str.shift())
			{
				tmp = tmp.split(":");

				// hack to use default function attr ;)
				if(1 == tmp.length && -1 != tmp[0].indexOf("="))
					tmp.unshift("attr");

				fn = tmp[0];
				arg = tmp[1];
				if("function" == typeof el[fn])
				{
					if(arg.indexOf("=") > 0)
					{
						args = {};
						arg = arg.split(",");
						while(val = arg.shift())
						{
							val = val.split("=");
							args[val[0]] = val[1].replace("__ESC_SC__",";").replace("__ESC_CN__",":").replace("__ESC_EQ__","=");
						}
					}
					else
						args = arg.replace("__ESC_SC__",";").replace("__ESC_CN__",":").replace("__ESC_EQ__","=");

					el[fn](args);
				}
			}
			return el;
		}

		/**
		 *
		 */
		,render : function(str)
		{
			//var startOfs = wsFront(lines[0]);
			var $this = this,
				lines = str.split("\n").filter(function(val){return val.trim();}),
				args = Array.prototype.slice.call(arguments,1),
				i, e, indent, row, stack = [], elements = [];

			stack[0] = "0 - div;";		 // just for debugging -> must be 0;
			elements[0] = $this.el("rendered;");
			for(row = 0; row < lines.length; row++)
			{
				e = lines[row].trim();
				if(0 === e.indexOf("//"))
					continue;

				indent = 1 + $this.wsFront(lines[row]);

				elements[row+1] = $this.el.apply( $this, [e].concat(args) );

				stack.splice(indent);
				while(stack.length > 0 && undefined === stack[stack.length-1])
					stack.splice(stack.length-1,1);

				elements[parseInt(stack[stack.length-1])].append(elements[row+1]); // just for debugging -> parseInt(stack[i]);

				stack[indent] = (row+1) + " - " + e; // just for debugging -> must be just row+1;
			}

			return elements[0].html();
		}

		/**
		 *
		 */
		,rend : function(arg)
		{
			var $this = this, comments;

			if(!arg)
				arg = $("rende");

			if("string" == typeof arg)
				arg = $(arg);

			arg.each(function(){
				var _this = $(this), str = _this.text();

				if(!str.trim())
					str = _this.contents().filter(function(){return this.nodeType === 8;}).get(0).nodeValue;

				/*
					comments = _this.contents().filter(function(){return this.nodeType === 8;}).get();
					$.each(comments, function(idx, comment){
						console.log(comment.nodeValue);
					});
				*/

				if(str.trim())
				{
					if("RENDE" == _this.prop("tagName"))
						_this.replaceWith($this.render(str));
					else
						_this.empty().html($this.render(str));
				}
			});
		}

	};


	$.fn.rende = function() {
		return $(Rende.render.apply(Rende, arguments));
	}

	Rende.rend();
	Rende.rend(".rende");

}( jQuery ));

