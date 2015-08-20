var login = {
	validateLogin: function(loginData){

		return db.getUsers().then(function(users) {
			var userFound = users.filter(function (el) {
				return el.login.email == loginData.email && el.login.password == loginData.password;
			})[0];
			if (userFound) {

				login.setCookies({username: userFound.username, isAdmin: userFound.isAdmin});
				window.loggenInUser = {username: userFound.username, isAdmin: userFound.isAdmin};
				return $.Deferred().resolve('valid login data');

			} else {
				return $.Deferred().reject('invalid login data');
			}
		});
	},
	validateNotEmpty: function (loginData) {
		return loginData.email =='' || loginData.password =='';
	},

	validateEmail: function(email){
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return re.test(email);
	},

	setCookies: function (cookieObj) {

		var expires = new Date();
		expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
		var cookieStr = '';

		for (var key in cookieObj){
			cookieStr += 	key + '=' + cookieObj[key] +';';
		}

		if (cookieStr){
			document.cookie = cookieStr +'expires=' + expires.toUTCString();
		}
	},
	getCookies:  function getCookie(key) {
		var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
		return keyValue ? keyValue[2] : null;
	},


	logout: function(){
		document.cookie = '';
		window.loggenInUser = null;

	}

};



