import './index.html';

Template.SelectUsersModal.onCreated(function() {
  this.selectedUsers = new ReactiveVar([]);
  this.selectedList = new ReactiveVar(false);
  this.search = new ReactiveVar(false);
});

Template.SelectUsersModal.helpers({
  users() {
    let tmpl = Template.instance();
    if (tmpl.selectedList.get()) {
      return tmpl.selectedUsers.get();
    }
    let conditions = {
      "profile.type": {$in: ['Users', 'Contacts']},
      "profile.noreply": {$ne: true}
    };
    if (!_.isEmpty(this.excludeIds)) {
      _.extend(conditions, {_id: {$nin: this.excludeIds}});
    }
    let keyword = tmpl.search.get();
    if (!_.isEmpty(keyword)) {
      _.extend(conditions, {$or: [
        {"profile.name": {$regex: keyword, $options: 'i'}},
        {"emails.address": {$regex: keyword, $options: 'i'}}
      ]});
    }
    return Users.find(conditions);
  },
  selectedList() {
    return Template.instance().selectedList.get();
  },
  selectedUsers() {
    return Template.instance().selectedUsers.get();
  },
  search() {
    return Template.instance().search.get();
  },
  selected() {
    let users = Template.instance().selectedUsers.get();
    return _.find(users, {_id: this._id});
  }
});

Template.SelectUsersModal.events({
  "click .btn-toggle-select"(e, t) {
    e.preventDefault();

    let users = t.selectedUsers.get();
    if (_.find(users, {_id: this._id})) {
      _.remove(users, u => u._id === this._id);
    } else {
      users.push(this);
    }
    t.selectedUsers.set(users);
  },
  "click .btn-toggle-list"(e, t) {
    e.preventDefault();

    let list = t.selectedList.get();
    if (list) {
      t.selectedList.set(false);
    } else {
      t.selectedList.set(true);
    }
  },
  "keyup #user-search"(e, t) {
    if (e.which === 13) {
      e.preventDefault();
      t.search.set($(e.target).val());
    }
  },
  "click #btn-cancel-search-users"(e, t) {
    e.preventDefault();
    $("#user-search").val("");
    t.search.set(false);
  },
  "click #btn-confirm-selected"(e, t) {
    e.preventDefault();
    let users = t.selectedUsers.get();
    let cb = t.data.callback;
    cb && cb(users);
  }
});
