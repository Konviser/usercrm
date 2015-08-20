//initialize events related to the usertab
$(document).ready(function() {

	$('#addUserToDb').click(function () {

		var newuser = {
			username: $('.addUser #username').val(),
			isAdmin: $(".addUser #isAdmin").is(":checked"),
			login: {
				password: $('.addUser #newUserPassword').val(),
				email: $('.addUser #newUserEmail').val()
			}
		};

		db.addNewUser(newuser, function (err) {
			if (err) {
				viewHandler.displayAddUserErr(err);
				return;
			}
			//append new row
			$('#userList').append(viewHandler.createUserRow(newuser));
			viewHandler.cleanAddUserForm();
		})
	});

	$('#cleanAddUserForm').click(function(){
		viewHandler.cleanAddUserForm();
	});

	$(document).on('click', '.deleteUser', function(ev){
		var username = $(ev.target).closest('tr').attr('data-username');
		db.deleteUser(username).then(function(){
			viewEvents.userDeleted(username);
		})
	});
});
