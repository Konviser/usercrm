//initialize events related to the usertab
$(document).ready(function() {

	$('#addGroupToDb').click(groupClickHandlers.addGroup.bind({}));

	$('#cleanAddGroupForm').click(function(){
		viewHandler.cleanAddGroupForm();
	});

	$(document).on('click', '.deleteGroup', groupClickHandlers.deleteGroup.bind({}));
	$(document).on('click', '.editGroup', groupClickHandlers.handleClickDrowpdown.bind({}));
	$(document).on('click', '.deleteMembers', groupClickHandlers.handleClickDrowpdown.bind({}));
	$(document).on('click', '.selectUser', groupClickHandlers.selectUser.bind({}));



});

var groupClickHandlers = {

	handleClickDrowpdown: function(ev){
		var button = $(ev.target);
		var id = $(ev.target).attr('id');
		var dropdownEl =  button.closest('.dropdown');

		if (button.hasClass('disabled')){
			return;
		}
		if (dropdownEl.hasClass('open') && !dropdownEl.find('ul').length ){


			if (button.hasClass('editGroup')){
				//show dropdown with users
				db.getNotMembers(id).then(function(users){
					if (users.length){
						viewHandler.generateUserDropdown(id, button.closest('.dropdown'), users);
					}
				});
			} else if (button.hasClass('deleteMembers')){
				//show dropdown with members
				db.getMembers(id).then(function(users){
					if (users.length){
						viewHandler.generateUserDropdown(id, button.closest('.dropdown'), users);
					}
				});
			}

		} else if (dropdownEl.attr('class').indexOf('open') < 0 && dropdownEl.find('ul').length){
			viewHandler.removeDropDown(dropdownEl);
		}
	},

	selectUser: function(ev){
		var button = $(ev.target).closest('.dropdown').find('button');
		var groupname = $(ev.target).closest('tr').attr('data-groupname');
		var username = $(ev.target).text();

		if (button.hasClass('editGroup')){

			//add user to the group
			db.addMember(username, groupname).then(function(group){
				viewEvents.memberAdded(group);
			})

		} else if (button.hasClass('deleteMembers')){

			//remove user from the group
			db.deleteMember(groupname, username).then(function(group){
				viewEvents.memberDeleted(group);
			});

		}

		viewHandler.removeDropDown($(ev.target).closest('.dropdown'));
	},

	addGroup: function(ev){
		var groupname = $('#addNewGroup #groupname').val();

		db.addNewGroup(groupname, function (err, groupObj) {
			if (err) {
				viewHandler.displayAddGroupErr(err);
				return;
			}
			$('#groupList').append(viewHandler.addToGroupList(groupObj));
			viewHandler.cleanAddGroupForm();
		})
	},

	deleteGroup: function(ev){
		if ($(ev.target).hasClass('disabled')){
			return;
		}
		var groupname = $(ev.target).closest('tr').attr('data-groupname');
		db.deleteGroup(groupname).then(function(){
			viewEvents.groupDeleted(groupname);
		})
	}

};
