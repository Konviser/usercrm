(function($, db){

	var viewHandler = {

		redirectFromLogin: function(){
			//add spinner

			$.when(this.generateGroupList(), this.generateUserList()).then(function(groupList, userList){
				$('#users').append(userList);
				$('#groups').append(groupList);

				$('#loginForm').hide();
				$('.mainView').show();
				$('#loginForm').find('input[type="text"],input[type="password"] ').val(''); //reset form value
			});
		},

		openUsebTab: function(){

			showView('#userTab');
			if (window.loggenInUser.isAdmin){
				showView('#addNewUser');
			}
			hideVew('#groupTab');
			$('#error').hide();

		},

		openGroupTab: function(){
			showView('#groupTab');
			hideVew('#userTab');
			if (window.loggenInUser.isAdmin){
				showView('#addNewGroup');
			}
			viewHandler.cleanAddUserForm();
			$('#error').hide();
		},

		logout: function(){
			hideVew('#userTab');
			hideVew('#groupTab');
			hideVew('#addNewGroup');
			hideVew('#addNewUser');
		},

		generateUserList: function(){
			return db.getUsers().then(function(users){
				return $.Deferred().resolve(drawUserList(users));
			})
		},

		generateUserDropdown: function(groupname, anchor, userlist){

			var ul = $('<ul></ul>').addClass('dropdown-menu').attr('aria-labelledby', groupname);
			userlist.forEach(function(user){

				var li = $('<li></li>').addClass('selectUser').append($('<a>').attr('href','#').text(user));
				ul.append(li);
			});

			return anchor.append(ul);
		},

		generateGroupList: function(){

			return db.getGroupsData().then(function(groups){
				return $.Deferred().resolve(drawGroupList(groups));
			})

		},

		displayAddUserErr: function(err){
			$('.addUser #username').css({"border":"2px solid red","box-shadow":"0 0 3px red"});
			$('#error').text(err);
			$('#error').show();
		},

		cleanAddUserForm: function(){
			$('#addNewUser').find('input[type=text]').val('');
			$('#error').hide();
			$('#username').removeAttr('style');
		},

		createUserRow: function(userData){
			 var row = $('<tr>').attr('data-username', userData.username);
			row.append($('<td>').text(userData.username));
			row.append($('<td>').text(userData.isAdmin? '*' : ''));
			var editButtonCell = $('<td>');
			var deleteButtonCell = $('<td>');
			if (userData.username !== window.loggenInUser.username && window.loggenInUser.isAdmin){
				editButtonCell.append('<button class="editUser">Add to the group</button>');
				deleteButtonCell.append('<button class="deleteUser">Delete user</button>');
			} else {
				editButtonCell.text('');
				deleteButtonCell.text('');
			}
			editButtonCell.text('');

			row.append(editButtonCell);
			row.append(deleteButtonCell);
			return row;
		},

		createGroupRow: function(groupData){

			var row = $('<tr>').attr('data-groupname', groupData.name);
			row.append($('<td>').text(groupData.name));
			row.append($('<td class="members">').text(groupData.members.length? groupData.members.join(', ') : 'no members'));
			var editButtonCell = $('<td class="addToGroup">');
			var deleteButtonCell = $('<td>');
			var deleteMembersCell = $('<td>');
			editButtonCell.append('<div class="dropdown">' +
			'<button class="editGroup btn btn-default disabled dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
			'<span class="caret"></span>Add members</button><div>');
			editButtonCell.find('button').attr('id',groupData.name);

			var dropdownDiv = $('<div>').addClass('dropdown');

			var dropdownButton = $('<button>').addClass('deleteMembers btn btn-default dropdown-toggle disabled').attr('type', 'button').attr('data-toggle', 'dropdown').attr('aria-haspopup', 'true').attr('aria-expanded', 'true').text('Delete members').attr('id', groupData.name);

			deleteMembersCell.append(dropdownDiv.append(dropdownButton));

			deleteButtonCell.append('<button class="deleteGroup btn btn-default disabled">Delete group</button>');

			if (window.loggenInUser.isAdmin){
				editButtonCell.find('button').removeClass('disabled');
				deleteButtonCell.find('button').removeClass('disabled');
				if (groupData.members.length){
					deleteMembersCell.find('button').removeClass('disabled');
				}
			}

			row.append(editButtonCell);
			row.append(deleteButtonCell);
			row.append(deleteMembersCell);
			return row;
		},

		deleteUserRow: function(username){
			$('#userList').find('tr[data-username='+username+']').remove();
		},

		addToGroupList: function(groupData){
			//append new row
			if(($('#groupList .noGroup').length)){
				$('#groupList .noGroup').remove();
			}

			return viewHandler.createGroupRow(groupData);
		},

		cleanAddGroupForm: function(){
			$('#addNewGroup').find('input[type=text]').val('');
			$('#error').hide();
			$('#groupname').removeAttr('style');
		},

		displayAddGroupErr: function(err){
			$('.addNewGroup #groupname').css({"border":"2px solid red","box-shadow":"0 0 3px red"});
			$('#error').text(err);
			$('#error').show();
		},

		removeDropDown: function(dropDownContainer){
			dropDownContainer.find('ul').remove();
		},

		deleteGroupRow: function(groupname){
			$('#groupList').find('tr[data-groupname="'+ groupname + '"] ').remove();
		}

	};

	// for some more complicated tasks let's user observers;
	var memgerAddedListeneres = [];
	var memgerDeletedListeneres = [];
	var userDeletedListeners = [];
	var groupDeletedListeners = [];
	var viewEvents = {

		memberAdded: function(data){

			memgerAddedListeneres.forEach(function(listener){
				listener(data);
			})
		},

		onMemberAdded: function(listener){
			memgerAddedListeneres.push(listener);
		},

		onMemberDeleted: function(listener){
			memgerDeletedListeneres.push(listener);
		},

		userDeleted: function(data){

			userDeletedListeners.forEach(function(listener){
				listener(data);
			})
		},

		groupDeleted: function(data){

			groupDeletedListeners.forEach(function(listener){
				listener(data);
			})
		},
		memberDeleted: function(data){

			memgerDeletedListeneres.forEach(function(listener){
				listener(data);
			})
		},

		onUseDeleted: function(listener){
			userDeletedListeners.push(listener);
		},

		onGroupDeleted: function(listener){
			groupDeletedListeners.push(listener);
		}
	};

	window.viewHandler = viewHandler;
	window.viewEvents = viewEvents;

	viewEvents.onMemberAdded(function(data){

		if (!data.name){
			return;
		}
		//find cell to be tweaked
		$('#groupList').find('tr[data-groupname="'+data.name+'"] .members').text(data.members.join(', '));

		//activate delete group button
		$('#groupList').find('tr[data-groupname="'+data.name+'"] .deleteGroup').addClass('disabled');
		$('#groupList').find('tr[data-groupname="'+data.name+'"] .deleteMembers').removeClass('disabled');

	});

	viewEvents.onMemberDeleted(function(data){

		//find cell to be tweaked
		$('#groupList').find('tr[data-groupname="'+data.name+'"] .members').text(data.members.join(', '));

		if (!data.members.length){
			$('#groupList').find('tr[data-groupname="'+data.name+'"] .deleteGroup').removeClass('disabled');
			$('#groupList').find('tr[data-groupname="'+data.name+'"] .deleteMembers').addClass('disabled');
		}

	});

	viewEvents.onUseDeleted(function(username){

		viewHandler.deleteUserRow(username);

		//updateGroupTable view
		var groupMembersCells = $('#groupList').find('.members');

		for (var i = 0; i < groupMembersCells.length; i++){
			var newText = groupMembersCells[i].innerText.replace(username+', ', '');
			groupMembersCells[i].innerText = newText;
		}

	});

	viewEvents.onGroupDeleted(function(groupname){

		viewHandler.deleteGroupRow(groupname);

		//updateGroupTable view
		if (!$('#groupList tr').length){
			$('#groupList').append('<tr><td colspan="5" class="noGroup">no groups have been added yet</td></tr>');
		}

	});

	function drawUserList(users){

		var table = $('<table id="userList" class="table table-hover"><thead><tr><th>Username</th><th>isAdmin</th><th colspan="3"> Actions</th></tr></thead></table>');

		users.forEach(function(user){
			table.append(viewHandler.createUserRow(user));
		});
		return table;
	}

	function drawGroupList(groups){
		var table = $('<table id="groupList" class="table table-hover"><thead><tr><th>Groupname</th><th>Members</th><th colspan="3  "> Actions</th></tr></thead></table>');

		if (!groups.length){
			table.append('<tr><td colspan="5" class="noGroup">no groups have been added yet</td></tr>');
			return table;
		}

		groups.forEach(function(group){
			table.append(viewHandler.createGroupRow(group));
		});

		return table;
	}

	function showView(selector){
		$(selector).removeClass('hide');
	}

	function hideVew(selector){
		if (!($(selector).hasClass('hide'))){
			$(selector).addClass('hide');
		}
	}

})(jQuery, db)