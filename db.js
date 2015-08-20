
(function($){
	var db = {

		getUsers: function(){
			return $.Deferred().resolve(JSON.parse(localStorage.ucrm).users);
		},

		getUserByName: function(userName){

			var userIsFound = JSON.parse(localStorage.ucrm).users.filter(function(user){
				return user.username == userName;
			})[0];
			return userIsFound? $.Deferred().resolve(userIsFound) : $.Deferred().reject('user is not found');
		},

		addNewUser: function(userData, callback) {
			if (!userData.username) {
				callback('username is empty');

			} else {

				//check if user with this username exists
				db.getUserByName(userData.username)
					.then(function () {callback('username already exists');})
					.fail(function(){
						if (userData.hasOwnProperty('login') && userData.login.email) {
							db.getUserByEmail(userData.login.email)
								.then(function () {callback('email already exists');})
								.fail(function () {addUserToLocalStorage(userData).then(function(){callback(null)});});

						} else {
							addUserToLocalStorage(userData).then(function(){callback(null)});
						}
					})
			}
		},

		getUserByEmail: function(email){

			var userIsFound = JSON.parse(localStorage.ucrm).users.filter(function(user){
				return user.hasOwnProperty('login') && user.login.email == email;
			})[0];
			return userIsFound? $.Deferred().resolve(userIsFound) : $.Deferred().reject('user is not found');
		},

		deleteUser: function(userName){

			return $.when(db.getUsers(), db.getGroups()).then(function(users, groups){

				users = users.filter(function(item){return userName != item.username;});
				window.localStorage.ucrm = JSON.stringify({users: users});

				//check if user has been in any groups and delete him from there
				groups.forEach(function(group){
					if (group.members.indexOf(userName) > -1){
						group.members.unshift(userName);
					}
				});

				window.localStorage.gcrm = JSON.stringify({groups: groups});
				return $.Deferred().resolve(userName);
			})
		},

		getGroups: function(){
			return $.Deferred().resolve(JSON.parse(localStorage.gcrm).groups);
		},

		getGroupByName: function(groupName){

			var groupIsFound = JSON.parse(localStorage.gcrm).groups.filter(function(group){
				return group.name == groupName;
			})[0];
			return groupIsFound? $.Deferred().resolve(groupIsFound) : $.Deferred().reject('group is not found');
		},


		getGroupsData: function(){

			return db.getGroups().then(function(groups){

				groups.forEach(function(group){
					group.membersCount = group.members.length;
				});

				return $.Deferred().resolve(groups);
			})
		},

		addNewGroup: function(groupname, callback){

			if (!groupname){
				callback('groupname is empty');
				return;
			}

			return db.getGroupByName(groupname).then(function(group){
				callback('group already exists');

			}).fail(function(){

				addGroupToLocalStorage(groupname).then(function(groupObj){
					callback(null, groupObj);
				})
			});
		},

		deleteGroup: function(groupname){
			return db.getGroups().then(function(groups){

				groups = groups.filter(function(item){return groupname != item.name;})
				window.localStorage.gcrm = JSON.stringify({groups: groups});
				return $.Deferred().resolve();
			})
		},

		addMember: function(username, groupname){

			var groupDB = JSON.parse(localStorage.gcrm).groups;
			var returnValue = {};

			groupDB.forEach(function(group){

				if (group.name == groupname){
					group.members.push(username);
					returnValue = group;
				}
			});

			localStorage.gcrm = JSON.stringify({groups: groupDB});

			return $.Deferred().resolve(returnValue);

		},

		deleteMember: function(groupname, username){

			var groupDB = JSON.parse(localStorage.gcrm).groups;
			var retournGroup = {};
			groupDB.forEach(function(group){

				if (group.name == groupname){
					group.members = group.members.filter(function(user){
						return user != username;
					});
					retournGroup = group;
				}
			});
			localStorage.gcrm = JSON.stringify({groups: groupDB});

			return $.Deferred().resolve(retournGroup);
		},

		getNotMembers: function(groupname){

			return $.when(db.getGroupByName(groupname), db.getUsers()).then(function(group, users){

				var notMembers = [];

				users.forEach(function(user){
					if(group.members.indexOf(user.username)< 0){
						notMembers.push(user.username);
					}
				});

				return $.Deferred().resolve(notMembers);
			});
		},

		getMembers: function(groupname){
			var group = JSON.parse(localStorage.gcrm).groups.filter(function(group){
				return groupname == group.name;
			})[0];

			return $.Deferred().resolve(group.members);
		}


	};


	function addGroupToLocalStorage(groupname){

		return db.getGroups().then(function(groups){
			groups.push({name: groupname, members: []});
			window.localStorage.gcrm = JSON.stringify({groups:groups});
			return $.Deferred().resolve({name: groupname, members: []});
		})
	}


	function addUserToLocalStorage(userData){
		return db.getUsers().then(function (users) {
			users.push(userData);
			window.localStorage.ucrm = JSON.stringify({users:users});
			return $.Deferred().resolve();
		});
	}

	window.db = db;
})(jQuery)
