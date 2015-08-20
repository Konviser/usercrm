$(document).ready(function(){

	window.localStorage.ucrm = JSON.stringify({users: [{username: 'admin', isAdmin:true, login: {email: 'admin@admin.com', password: 'admin'}}]});
	window.localStorage.gcrm = JSON.stringify({groups: []});
	$('.login').show();
	$('.mainView').hide();
	$('#error').hide();

	$("#login").click(function(){

		var loginData = {email: $("#email").val(),password: $("#password").val()};
		$('#error').hide();
		$('#loginForm input[type="text"],input[type="password"]').removeAttr('style');

		// Checking for blank fields.
		if(login.validateNotEmpty(loginData)){
			$('#loginForm input[type="text"],input[type="password"]').css("border","2px solid red");
			$('#loginForm input[type="text"],input[type="password"]').css("box-shadow","0 0 3px red");

			showLoginAlert('Please fill all the fielsd');
		}else if (!login.validateEmail(loginData.email)){

			$('#loginForm input[type="text"]').css({"border":"2px solid red","box-shadow":"0 0 3px red"});
			$('#loginForm input[type="password"]').css({"border":"2px solid #00F5FF","box-shadow":"0 0 5px #00F5FF"});

			showLoginAlert('Invalid email');
		} else {
			login.validateLogin(loginData).then(function(){viewHandler.redirectFromLogin()}).fail(function(){showLoginAlert('Invalid login');});
		}

	});

	$('#logout').click(function(){
		login.logout();
		$('#loginForm').show();
		$('.mainView').hide();
		$('#groupList').remove();
		$('#userList').remove();
		viewHandler.logout();
	});

	$('#jumpToUsers').click(viewHandler.openUsebTab.bind({}));
	$('#jumpToGroups').click(viewHandler.openGroupTab.bind({}));


	function showLoginAlert(text){
		$('#error').text(text);
		$('#error').show();
	}
});