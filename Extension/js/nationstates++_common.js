(function() {
	//Add $.changeElementType
	(function($) {
		$.fn.changeElementType = function(newType) {
			var attrs = {};

			$.each(this[0].attributes, function(idx, attr) {
				attrs[attr.nodeName] = attr.nodeValue;
			});

			this.replaceWith(function() {
				return $("<" + newType + "/>", attrs).append($(this).contents());
			});
		};
	})(jQuery);

	(function($) {
		$.fn.toggleDisabled = function(){
			return this.each(function(){
				this.disabled = !this.disabled;
			});
		};
	})(jQuery);
	
	$.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))

	//Add string.startsWith
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str){
			return this.slice(0, str.length) == str;
		};
	}
	
	//Add string.endsWith
	if (typeof String.prototype.endsWith != 'function') {
		String.prototype.endsWith = function (s) {
			return this.length >= s.length && this.substr(this.length - s.length) == s;
		}
	}

	//Add string.contains
	if (typeof String.prototype.contains != 'function') {
		String.prototype.contains = function (str){
			return this.indexOf(str) != -1;
		};
	}

	//Add string.toTitleCase
	if (typeof String.prototype.toTitleCase != 'function') {
		String.prototype.toTitleCase = function (){
			return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		};
	}
	
	if (typeof String.prototype.count != 'function') {
		String.prototype.count = function(substr,start,overlap) {
			overlap = overlap || false;
			start = start || 0;

			var count = 0, 
				offset = overlap ? 1 : substr.length;

			while((start = this.indexOf(substr, start) + offset) !== (offset - 1))
				++count;
			return count;
		};
	}

	//Add escape
	RegExp.escape = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	//Add replaceAll
	String.prototype.replaceAll = function(search, replace) {
		return this.replace(new RegExp(RegExp.escape(search),'g'), replace);
	};

	String.prototype.width = function(font) {
		var f = font || '12px arial',
		o = $('<div>' + this + '</div>')
			.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
			.appendTo($('body')),
		w = o.width();
		o.remove();
		return w;
	};

	(function ($) {
		$.fn.get_selection = function () {
			var e = this.get(0);
			//Mozilla and DOM 3.0
			if('selectionStart' in e) {
				var l = e.selectionEnd - e.selectionStart;
				return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
			}
			else if(document.selection) {		//IE
				e.focus();
				var r = document.selection.createRange();
				var tr = e.createTextRange();
				var tr2 = tr.duplicate();
				tr2.moveToBookmark(r.getBookmark());
				tr.setEndPoint('EndToStart',tr2);
				if (r == null || tr == null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
				var text_part = r.text.replace(/[\r\n]/g,'.'); //for some reason IE doesn't always count the \n and \r in length
				var text_whole = e.value.replace(/[\r\n]/g,'.');
				var the_start = text_whole.indexOf(text_part,tr.text.length);
				return { start: the_start, end: the_start + text_part.length, length: text_part.length, text: r.text };
			}
			//Browser not supported
			else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
		};

		$.fn.set_selection = function (start_pos,end_pos) {
			var e = this.get(0);
			//Mozilla and DOM 3.0
			if('selectionStart' in e) {
				e.focus();
				e.selectionStart = start_pos;
				e.selectionEnd = end_pos;
			}
			else if (document.selection) { //IE
				e.focus();
				var tr = e.createTextRange();

				//Fix IE from counting the newline characters as two seperate characters
				var stop_it = start_pos;
				for (i=0; i < stop_it; i++) if( e.value[i].search(/[\r\n]/) != -1 ) start_pos = start_pos - .5;
				stop_it = end_pos;
				for (i=0; i < stop_it; i++) if( e.value[i].search(/[\r\n]/) != -1 ) end_pos = end_pos - .5;

				tr.moveEnd('textedit',-1);
				tr.moveStart('character',start_pos);
				tr.moveEnd('character',end_pos - start_pos);
				tr.select();
			}
			return this.get_selection();
		};

		$.fn.replace_selection = function (replace_str) {
			var e = this.get(0);
			selection = this.get_selection();
			var start_pos = selection.start;
			var end_pos = start_pos + replace_str.length;
			e.value = e.value.substr(0, start_pos) + replace_str + e.value.substr(selection.end, e.value.length);
			this.set_selection(start_pos,end_pos);
			return {start: start_pos, end: end_pos, length: replace_str.length, text: replace_str};
		};

		$.fn.wrap_selection = function (left_str, right_str, sel_offset, sel_length) {
			var the_sel_text = this.get_selection().text;
			var selection = this.replace_selection(left_str + the_sel_text + right_str );
			if(sel_offset !== undefined && sel_length !== undefined) 
				selection = this.set_selection(selection.start +	sel_offset, selection.start +	sel_offset + sel_length);
			else if(the_sel_text == '') 
				selection = this.set_selection(selection.start + left_str.length, selection.start + left_str.length);
			return selection;
		};
	}(jQuery));

//*** This code is copyright 2002-2003 by Gavin Kistner, !@phrogz.net
//*** It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt
	if (typeof Date.prototype.customFormat != 'function') {
		Date.prototype.customFormat = function(formatString) {
			var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
			var dateObject = this;
			YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
			MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
			MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
			DD = (D=dateObject.getDate())<10?('0'+D):D;
			DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
			th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
			formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

			h=(hhh=dateObject.getHours());
			if (h==0) h=24;
			if (h>12) h-=12;
			hh = h<10?('0'+h):h;
			AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
			mm=(m=dateObject.getMinutes())<10?('0'+m):m;
			ss=(s=dateObject.getSeconds())<10?('0'+s):s;
			return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
		};
	}
	$.fn.scrolled = function (waitTime, fn) {
		var tag = "scrollTimer";
		this.scroll(function () {
			var self = $(this);
			var timer = self.data(tag);
			if (timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(function () {
				self.data(tag, null);
				fn();
			}, waitTime);
			self.data(tag, timer);
		});
	};
//*** END OF LICENSED CODE BY GAVEN KISTNER ***//
	migratePuppets();
	if (getUserNation() == "glen-rhodes") {
		localStorage.setItem("ignore_theme_warning", true);
	}
	$("textarea, input[type='text'], td input[type='password'], input[name='region_name']").addClass("text-input");
})();

function isDarkTheme() {
	return $("link[href^='/ns.dark']").length > 0;
}

function isCenturyTheme() {
	//Todo: turn this on when rift is released
	//return $("link[href^='/ns.century']").length > 0;
	return $(".bel").length == 0;
}

function isRiftTheme() {
	return !isCenturyTheme();
}

/**
	Converts a search input into an array of keywords to search for.
	Each word separated by one or more spaces is considered a keyword,
	Unless the text is inside a pair of ""'s.
*/
function searchToKeywords(search) {
	var keys = new Array();
	var start = 0;
	var foundQuote = false;
	for (var i = 0, len = search.length; i < len; i++) {
		if (search[i] == '"') {
			if (!foundQuote) {
				foundQuote = true;
			} else {
				foundQuote = false;
				keys.push(search.substring(start + 1, i).trim());
				start = i + 1;
			}
		} else if (search[i] == " " && !foundQuote) {
			if (i != start) {
				keys.push(search.substring(start, i).trim());
			}
			start = i + 1;
		}
	}
	var lastKey;
	if (foundQuote) {
		lastKey = search.substring(start + 1).trim();
	} else {
		lastKey = search.substring(start).trim();
	}
	if (lastKey.length > 0) {
		keys.push(lastKey);
	}
	return keys;
}

function showPuppets() {
	if ($("#puppet_setting_form").length == 0) {
		$("#puppet_setting").append("<div id='puppet_setting_form' class='puppet-form'></div>");
		$("#puppet_setting_form").hover(function() { $("#puppet_setting_form").css('display', 'block').css('opacity', '1.0'); }, function() { $("#puppet_setting_form").css('display', 'none'); });
	}
	$("#puppet_setting_form").css('opacity', '.75').show();
	
	var manager = getPuppetManager();
	var puppets = manager.getActivePuppetList();
	
	var html = "<h3>Puppets</h3><ul>";
	var numPuppets = 0;
	var y = 0;
	for (var name in puppets) {
		if (name.length > 0) {
			html += "<li><div class='puppet-form-inner' style='margin-bottom: -15px;'><p style='margin-top: 3px;'><a class='puppet-name' id='" + name + "' href='/nation=" + name + "' style='color: white;'>" + name.split("_").join(" ").toTitleCase() + "</a></p></div><img name='" + name + "' class='puppet-form-remove' src='https://nationstatesplusplus.net/nationstates/static/remove.png'></img></li>";
			numPuppets++;
			y += 15;
			if (y > $(window).height() - 250) {
				html += "<li><div class='puppet-form-inner' style='margin-bottom: -15px;'><p style='margin-top: 10px;'><b><b>There are too many puppets!</b></p></div></li>";
				html += "<li><div class='puppet-form-inner' style='margin-bottom: -15px;'><p style='margin-top: 3px;'><b>Visit the puppet manager</b></p></div></li>";
				html += "<li><div class='puppet-form-inner' style='margin-bottom: -15px;'><p style='margin-top: 3px;'><b>and reduce the puppet list</b></p></div></li>";
				html += "<li><div class='puppet-form-inner' style='margin-bottom: -15px;'><p style='margin-top: 3px;'><b>or organize them into lists</b></p></div></li>";
				break;
			}
		}
	}
	if (numPuppets == 0) {
		html += "<li>There's nothing here...</li>";
	}
	html += "</ul>";
	html += "<p style='margin-top: -20px; margin-bottom: 1px;'><input class='text-input' type='text' id='puppet_nation' size='18' placeholder='Nation'></p>";
	html += "<p style='margin-top: 1px;'><input class='text-input' type='password' id='puppet_password' size='18' placeholder='Password'></p>";
	html += "<div id='puppet_invalid_login' style='display:none;'><p>Invalid Login</p></div>";
	html += "<p class='puppet_creator'><a style='color:white;' href='//www.nationstates.net/page=blank?puppet_creator'>Create New Puppet Nations</a></p>";
	html += "<p class='puppet_manager'><a style='color:white;' href='//www.nationstates.net/page=blank?puppet_manager'>Manage Puppets</a></p>";
	$("#puppet_setting_form").html(html);
	if (isRiftTheme()) {
		$("#puppet_setting_form").css("top", "50px").css("opacity", "1.0");
		$("#puppet_setting_form h3").css("text-align", "center").html($("#puppet_setting_form h3").html().toUpperCase());
	}
	
	$("#puppet_nation, #puppet_password").on("keydown", function(event) {
		if (event.keyCode == 13) {
			var nationName = $("#puppet_nation");
			var nationPassword = $("#puppet_password");
			if ($("#puppet_nation").val() == "" || $("#puppet_password").val() == "") {
				$("#puppet_invalid_login").show();
				return;
			}
			getPuppetManager().addPuppet($("#puppet_nation").val().toLowerCase().split(" ").join("_"), nationPassword.val());

			showPuppets();
			$("#puppet_nation").focus();
		}
	});

	$(".puppet-form-remove").on("click", function() {
		var manager = getPuppetManager();
		manager.removePuppet($(this).attr("name"));
		showPuppets();
	});

	$("a.puppet-name").on("click", function(event) {
		switchToPuppet($(this).attr("id"));
		event.preventDefault();
	});
}

function switchToPuppet(name) {
	var manager = getPuppetManager();
	var pass = manager.getActivePuppetList()[name];
	$.post("//www.nationstates.net/?nspp=1", "logging_in=1&nation=" + encodeURIComponent(name) + "&password=" + encodeURIComponent(pass) + ($("#puppet_setting").data("autologin-puppets") ? "&autologin=yes" : ""), function(data) {
		if (data.contains("Would you like to restore it?")) {
			$("#content").html($(data).find("#content").html());
		} else {
			if ($("#puppet_setting").data("redirect-puppet-page")) {
				window.location.href = "/nation=" + name;
			} else {
				window.location.reload(false);
			}
		}
	});
}

function migratePuppets() {
	var puppetNames = localStorage.getItem("puppets");
	if (puppetNames != null) {
		var puppets = {};
		var split = puppetNames.split(",");
		for (var i = 0; i < split.length; i++) {
			puppets[split[i]] = localStorage.getItem("puppet-" + split[i]);
			localStorage.removeItem("puppet-" + split[i]);
			localStorage.removeItem("puppet-" + split[i] + "-cache");
		}
		console.log(JSON.stringify(puppets));
		localStorage.removeItem("puppets");
		
		puppetLists = {};
		puppetLists.list = [];
		puppetLists.list.push({ name: "default", puppets: puppets });
		puppetLists.active = "default";
		localStorage.setItem("puppetlists", JSON.stringify(puppetLists));
	}
}

function getPuppetManager() {
	var puppetLists = localStorage.getItem("puppetlists");
	if (puppetLists == null) {
		puppetLists = {};
		puppetLists.list = [];
		puppetLists.list.push({ name: "default", puppets: {} });
		puppetLists.active = "default";
		localStorage.setItem("puppetlists", JSON.stringify(puppetLists));
	} else {
		puppetLists = JSON.parse(puppetLists);
	}

	var manager = {};
	manager._data = puppetLists;
	manager.getActiveList = function() {
		return this._data.active;
	};

	manager.setActiveList = function() {
		if (arguments.length > 0) {
			this._data.active = arguments[0];
			this.save();
		}
	};

	manager.findPassword = function() {
		if (arguments.length > 0) {
			var name = arguments[0];
			for (var i = 0; i < this._data.list.length; i += 1) {
				for (var p in this._data.list[i].puppets) {
					if (p == name) {
						return this._data.list[i].puppets[p];
					}
				}
			}
		}
		return null;
	}

	manager.getActivePuppetList = function() {
		var active = this.getActiveList();
		for (var i = 0; i < this._data.list.length; i += 1) {
			if (this._data.list[i].name == active) {
				return this._data.list[i].puppets;
			}
		}
		return [];
	};

	manager.addPuppetList = function() {
		if (arguments.length > 0) {
			var name = arguments[0];
			var duplicate = false;
			for (var i = 0; i < this._data.list.length; i += 1) {
				var list = this._data.list[i];
				if (list.name == name) {
					duplicate = true;
					break;
				}
			}
			if (!duplicate) {
				this._data.list.push({name: name, puppets: {} });
				this.save();
				return true;
			}
		}
		return false;
	};

	manager.removePuppetList = function() {
		if (arguments.length > 0) {
			var name = arguments[0];
			var puppetLists = [];
			for (var i = 0; i < this._data.list.length; i += 1) {
				var list = this._data.list[i];
				if (list.name != name) {
					puppetLists.push(list);
				}
			}
			this._data.list = puppetLists;
			this.save();
		}
	};

	manager.renamePuppetList = function() {
		if (arguments.length > 1) {
			var name = arguments[0];
			var newName = arguments[1];
			var puppetLists = [];
			for (var i = 0; i < this._data.list.length; i += 1) {
				var list = this._data.list[i];
				if (list.name == name) {
					list.name = newName;
				}
			}
			this.save();
		}
	};

	manager.clearPuppetList = function() {
		var listName = this.getActiveList();
		if (arguments.length > 0) {
			listName = arguments[0];
		}
		for (var i = 0; i < this._data.list.length; i += 1) {
			if (this._data.list[i].name == listName) {
				this._data.list[i].puppets = {};
			}
		}
		this.save();
	}

	manager.addPuppet = function() {
		if (arguments.length > 1) {
			var nation = arguments[0];
			var pass = arguments[1];
			
			var listName = this.getActiveList();
			if (arguments.length > 2) {
				listName = arguments[2];
			}
			
			var autoSave = true;
			if (arguments.length > 3) {
				autoSave = arguments[3];
			}
			
			for (var i = 0; i < this._data.list.length; i += 1) {
				if (this._data.list[i].name == listName) {
					this._data.list[i].puppets[nation] = pass;
				}
			}
			
			if (autoSave) {
				this.save();
			}
		}
	}

	manager.save = function() {
		localStorage.setItem("puppetlists", JSON.stringify(this._data));
	};

	manager.removePuppet = function() {
		if (arguments.length > 0) {
			var nation = arguments[0];

			var listName = this.getActiveList();
			if (arguments.length > 1) {
				listName = arguments[1];
			}

			var autoSave = true;
			if (arguments.length > 3) {
				autoSave = arguments[3];
			}
			
			for (var i = 0; i < this._data.list.length; i += 1) {
				if (this._data.list[i].name == listName) {
					delete this._data.list[i].puppets[nation];
				}
			}
			if (autoSave) {
				this.save();
			}
		}
	}

	return manager;
}

function getNationStatesAuth(callback) {
	$.get("//www.nationstates.net/page=verify_login", function(data) {
		//Prevent image requests by replacing src attribute with data-src
		var authCode = $(data.replace(/[ ]src=/gim," data-src=")).find("#proof_of_login_checksum").html();
		//Regenerate localid if nessecary
		$(window).trigger("page/update");
		callback(authCode);
	});
}

function doAuthorizedPostRequest(url, postData, success, failure) {
	doAuthorizedPostRequestFor(getUserNation(), url, postData, success, failure);
}

function doAuthorizedPostRequestFor(nation, url, postData, success, failure) {
	//Clear out old style token
	localStorage.removeItem(nation + "-auth-token");
	
	var authToken = localStorage.getItem(nation + "-auth-token-v2");
	if (authToken != null) {
		try {
			authToken = JSON.parse(authToken);
			if (Date.now() > authToken.expires) {
				localStorage.removeItem(nation + "-auth-token-v2");
				authToken = null;
			}
		} catch(err) {
			localStorage.removeItem(nation + "-auth-token-v2");
		}
	}
	if (authToken != null) {
		doAuthorizedPostRequestInternal(nation, url, authToken.code, postData, success, failure);
	} else {
		getNationStatesAuth(function(authCode) {
			$.post("https://nationstatesplusplus.net/api/nation/auth/", "nation=" + nation + "&auth=" + encodeURIComponent(authCode), function(data, textStatus, jqXHR) {
				localStorage.setItem(nation + "-auth-token-v2", JSON.stringify(data));
				doAuthorizedPostRequestInternal(nation, url, data.code, postData, success, failure);
			}).fail(failure);
		});
	}
}

function doAuthorizedPostRequestInternal(nation, url, authToken, postData, success, failure) {
	postData = "nation=" + nation + "&auth-token=" + authToken + (postData.length > 0 ? "&" + postData : "");
	$.post(url, postData, function(data, textStatus, jqXHR) {
		if (typeof success != "undefined" && success != null) {
			success(data, textStatus, jqXHR);
		}
	}).fail(function(data, textStatus, jqXHR) {
		if (typeof failure != "undefined" && failure != null) {
			failure(data, textStatus, jqXHR);
		}
	});
}

/*
	Returns the nation name of the active user, or empty string if no active user.
*/
function getUserNation(page) {
	if (typeof page === "undefined") {
		var x = $(document);
	} else {
		var x = $(page);
	}
	if (x.find(".bannernation a").attr("href")) {
		return x.find(".bannernation a").attr("href").trim().substring(8);
	}
	if (x.find(".STANDOUT:first").attr("href")) {
		return x.find(".STANDOUT:first").attr("href").substring(7);
	} else {
		var nationSelector = x.find("a:contains('Logout'):last");
		if (typeof nationSelector.text() != 'undefined' && nationSelector.text().length > 0) {
			return nationSelector.text().substring(9, nationSelector.text().length - 2).replaceAll(" ", "_").toLowerCase();
		}
	}
	return "";
}

/*
	Returns the region name of the active user, or empty string if no active user.
*/
function getUserRegion() {
	if ($(".menu li:first a:first").attr("href") && $(".menu li:first a:first").attr("href").startsWith("region="))
		return $(".menu li:first a:first").attr("href").substring(7);
	return $(".STANDOUT:eq(1)").attr("href") ? $(".STANDOUT:eq(1)").attr("href").substring(7) : "";
}

/*
	Returns the name of the nation the user is currently viewing, or empty string if none.
*/
function getVisibleNation() {
	if ($(".newtitlename a").attr("href")) {
		return $(".newtitlename a").attr("href").trim().substring(8);
	}
	return $(".nationname > a").attr("href") ? $(".nationname > a").attr("href").trim().substring(8) : "";
}

/*
	Returns the dilemma id number on the page, if any
*/
function getVisibleDilemma() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("dilemma=")) {
			return split[i].substring(8);
		}
	}
	return "";
}

/*
	Returns the sorting parameter on the page, if any
*/
function getVisibleSorting() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("sort=")) {
			return split[i].substring(5);
		}
	}
	return "";
}

/*
	Returns the region the user is currently viewing, or empty string if no region is visible.
*/
function getVisibleRegion() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("region=")) {
			return split[i].substring(7).toLowerCase().replaceAll(" ", "_");
		}
	}
	return "";
}

/*
	Returns the visible page the user is viewing.
*/
function getVisiblePage() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("page=")) {
			return split[i].substring(5);
		}
	}
	if (window.location.href.contains("/nation=")) {
		return "nation";
	}
	if (window.location.href.contains("/region=")) {
		return "region";
	}
	return "unknown";
}

function getTelegramFolder() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("folder=")) {
			return split[i].substring(7);
		}
	}
	return "inbox";
}

function getVisibleTag() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("tag=")) {
			return split[i].substring(4);
		}
	}
	return "";
}

function getTelegramStart() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("start=")) {
			return split[i].substring(6);
		}
	}
	return "0";
}


function getPageDetail() {
	var split = window.location.href.split(/[/#/?]/);
	for (var i = 0; i < split.length; i++) {
		if (split[i].startsWith("detail=")) {
			return split[i].substring(7);
		}
	}
	return "";
}

function isPageActive() {
	var hidden = false;
	if (document.mozHidden) hidden = true;
	if (document.webkitHidden) hidden = true;
	if (document.hidden) hidden = true;
	return !hidden;
}

var _lastPageActivity;
function getLastActivity() {
	if (!_lastPageActivity) {
		if ($("#main").length > 0) {
			$("#main").mousemove(function (c) {
				_lastPageActivity = Date.now();
			}).mousedown(function (c) {
				_lastPageActivity = Date.now();
			}).mouseup(function (c) {
				_lastPageActivity = Date.now();
			});
			_lastPageActivity = Date.now()
		} else {
			setInterval(function() {
				if (isPageActive()) {
					_lastPageActivity = Date.now()
				}
			}, 500);
			console.log("can not measure activity normally, using page active fallback");
		}
	}
	return _lastPageActivity;
}

var _isAntiquityTheme = document.head.innerHTML.indexOf("antiquity") != -1;
function isAntiquityTheme() {
	return _isAntiquityTheme;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function parseBBCodes(text) {
	text = $("<div></div>").html(text).text();
	text = text.replaceAll("[b]", "<b>").replaceAll("[/b]", "</b>");
	text = text.replaceAll("[B]", "<b>").replaceAll("[/B]", "</b>");
	text = text.replaceAll("[i]", "<i>").replaceAll("[/i]", "</i>");
	text = text.replaceAll("[I]", "<i>").replaceAll("[/I]", "</i>");
	text = text.replaceAll("[normal]", "<span style='font-size:14px'>").replaceAll("[/normal]", "</span>");
	text = text.replaceAll("[u]", "<u>").replaceAll("[/u]", "</u>");
	text = text.replaceAll("[U]", "<u>").replaceAll("[/U]", "</u>");
	text = text.replaceAll("[blockquote]", "<blockquote class='news_quote'>").replaceAll("[/blockquote]", "</blockquote>");
	text = text.replaceAll("[list]", "<ul>").replaceAll("[/list]", "</ul>");
	text = text.replaceAll("[*]", "</li><li>");
	text = parseUrls(text, true);
	text = parseUrls(text, false);
	text = parseImages(text, true);
	text = parseImages(text, false);
	text = updateTextLinks("nation", text);
	text = updateTextLinks("region", text);
	text = text.replaceAll("\n", "</br>");
	
	var regex = new RegExp("\\[h([0-6])\\]", "gi");
	text = text.replace(regex, "<h$1 style='text-align:center'>");
	regex = new RegExp("\\[/h([0-6])\\]", "gi");
	text = text.replace(regex, "</h$1>");
	
	//Strip align tags
	regex = new RegExp("\\[align=.{0,}\\]", "gi");
	text = text.replace(regex, " ");
	regex = new RegExp("\\[/align\\]", "gi");
	text = text.replace(regex, " ");

	return text;
}

function updateTextLinks(tag, text) {
	var index = text.indexOf("[" + tag + "]");
	while (index > -1) {
		var endIndex = text.indexOf("[/" + tag + "]", index + tag.length + 2);
		if (endIndex == -1) {
			break;
		}
		var innerText = text.substring(index + tag.length + 2, endIndex);
		text = text.substring(0, index) + "<a target='_blank' href='/" + tag + "=" + innerText.toLowerCase().replaceAll(" ", "_") + "'>" + innerText + "</a>" + text.substring(endIndex + tag.length + 3);
		index = text.indexOf("[" + tag + "]", index);
	}
	return text;
}

function parseUrls(text, lowercase) {
	var index = text.indexOf((lowercase ? "[url=" : "[URL="));
	while (index > -1) {
		var endIndex = text.indexOf((lowercase ? "[/url]" : "[/URL]"), index + 6);
		if (endIndex == -1) {
			break;
		}
		var innerText = text.substring(index + 5, endIndex + 1);
		var url = innerText.substring(0, innerText.indexOf("]"));
		
		text = text.substring(0, index) + "<a target='_blank' href='" + url + "'>" + innerText.substring(innerText.indexOf("]") + 1, innerText.length - 1) + "</a>" + text.substring(endIndex + 6);
		index = text.indexOf((lowercase ? "[url=" : "[URL="), index);
	}
	return text;
}

function parseImages(text, lowercase) {
	var index = text.indexOf((lowercase ? "[img]" : "[IMG]"));
	while (index > -1) {
		var endIndex = text.indexOf((lowercase ? "[/img]" : "[/IMG]"), index + 6);
		if (endIndex == -1) {
			break;
		}
		var url = text.substring(index + 5, endIndex);
		
		text = text.substring(0, index) + "<img class='center-img' src='" + url + "'>" + text.substring(endIndex + 6);
		index = text.indexOf((lowercase ? "[img]" : "[IMG]"), index);
	}
	return text;
}
	
function addFormattingButtons() {
	$(".nscodedesc").find("abbr").each(function() {
		var text = $(this).html().substring(1, $(this).html().length - 1);
		$(this).html(text);
		if (text.length > 1) {
			$(this).css("width", "53px");
		} else {
			$(this).css("width", "23px");
		}
		if (text == "b") {
			$(this).attr("name", "formatting_button");
			$(this).css("font-weight", "bold");
			$(this).html(text.toUpperCase());
		} else if ($(this).html() == "i") {
			$(this).attr("name", "formatting_button");
			$(this).css("font-style", "italic");
		} else if ($(this).html() == "u") {
			$(this).attr("name", "formatting_button");
			$(this).css("text-decoration", "underline");
		} else if ($(this).html() == "nation") {
			$(this).attr("name", "formatting_button");
		} else if ($(this).html() == "region") {
			$(this).attr("name", "formatting_button");
		} else if ($(this).html() == "color") {
			$(this).attr("name", "formatting_button");
		} else if ($(this).html() == "url") {
			$(this).attr("name", "formatting_button");
		}

		$(this).attr("class", "forum_bbcode_button");
		$(this).changeElementType("button");
	});
	var formatBBCode = function(event) {
		event.preventDefault();
		var widebox = $(this).parent().prev();
		var value = ($(this).html().contains("<option>") ? $(this).val() : $(this).html());
		widebox.find("textarea[name='message']").wrap_selection("[" + value + "]", "[/" + value.split("=")[0] + "]");
	}
	$('body').on('click', "button[name='formatting_button']", formatBBCode);
}


function linkify(inputText, checkNationStates) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3;
	
	if (typeof checkNationStates == "undefined" || checkNationStates) {
		if (inputText.indexOf("nationstates.net/") > -1) {
			return inputText;
		}
	}

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https|http|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(replacePattern1, '<a class="linkified" href="$1" target="_blank">$1</a>');

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|])/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a class="linkified" href="http://$2" target="_blank">$2</a>');

	//Change email addresses to mailto:: links.
	replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	replacedText = replacedText.replace(replacePattern3, '<a class="linkified" href="mailto:$1">$1</a>');

	return replacedText;
}

function isInRange(min, value, max) {
	if (value > min && value < max) {
		return true;
	}
	return false;
}

function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((docViewTop <= elemBottom) && (docViewBottom >= elemTop));
}

function getNationAlias(nation) {
	if (localStorage.getItem("aliases-" + getUserNation()) != null && getUserNation() != "") {
		try {
			var aliases = JSON.parse(localStorage.getItem("aliases-" + getUserNation()));
			return aliases[nation];
		} catch (error) {
			console.log("Unable to retrieve aliases!");
			console.log(error);
		}
	}
	return null;
}

function setNationAlias(nation, alias) {
	if (getUserNation() != "") {
		var aliases = new Object();
		if (localStorage.getItem("aliases-" + getUserNation()) != null) {
			try {
				aliases = JSON.parse(localStorage.getItem("aliases-" + getUserNation()));
			} catch (error) {
				console.log("Unable to parse aliases!");
				console.log(error);
			}
		}
		if (alias != null) {
			aliases[nation] = alias;
		} else {
			delete aliases[nation];
		}
		localStorage.setItem("aliases-" + getUserNation(), JSON.stringify(aliases));
	}
}

function timestampToTimeAgo(timestamp) {
	var threeDays = false;
	var time = "";
	var timeDiff = Date.now() - timestamp;
	if (timeDiff > 365 * 24 * 60 * 60 * 1000) {
		var years = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000));
		if (years > 1) time += years + " years ";
		else time += "1 year ";
		timeDiff -= years * (365 * 24 * 60 * 60 * 1000);
	}
	if (timeDiff > 24 * 60 * 60 * 1000) {
		var days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
		threeDays = days > 3;
		if (days > 1) time += days + " days ";
		else time += "1 day ";
		timeDiff -= days * (24 * 60 * 60 * 1000);
	}
	if (!time.contains("year") && (!time.contains("days") || !threeDays) && timeDiff > 60 * 60 * 1000) {
		var hours = Math.floor(timeDiff / (60 * 60 * 1000));
		if (hours > 1) {
			time += hours + " hours ";
			timeDiff -= hours * (60 * 60 * 1000);
		}
	}
	if (!time.contains("year") && !time.contains("day") && !time.contains("hours") && timeDiff > 60 * 1000) {
		var minutes = Math.floor(timeDiff / (60 * 1000));
		if (minutes > 1) time += minutes + " minutes ";
		else time += "1 minutes ";
		timeDiff -= minutes * (60 * 1000);
	}
	if (!time.contains("year") && !time.contains("day") && !time.contains("hours") && !time.contains("minutes") && timeDiff > 1000) {
		time = "Seconds ";
	}
	time = time.substring(0, time.length - 1);
	return time;
}

function getRSSPrivateKey(recalculate, callback) {
	if (!recalculate) {
		var cached = localStorage.getItem("rss-priv-key-" + getUserNation());
		if (cached != null) {
			callback(cached);
			return;
		}
	}

	var grabKey = function(data) {
		var rss = $(data).find("form[action='page=subscribe'] ul li:first a").attr("href");
		var key = rss.split("=")[rss.split("=").length - 1];
		if (key != null) {
			localStorage.setItem("rss-priv-key-" + getUserNation(), key);
		}
		return key;
	}

	$.get("//www.nationstates.net/page=subscribe?nspp=1", function(html) {
		if ($(html).find("input[name='generate_feed']").length > 0) {
			console.log("no rss feed, generating");
			$.post("//www.nationstates.net/page=subscribe/page=subscribe?nspp=1", "generate_feed=Generate+News+Feed", function(data) {
				if ($(data).find("p.info").length > 0) {
					localStorage.removeItem(getUserNation() + "-auth-token-v2");
					callback(grabKey(data));
				} else {
					console.log("Error turning on rss feed");
					console.log(data);
				}
			});
		} else {
			callback(grabKey(html));
		}
	});
}
