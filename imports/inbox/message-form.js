import './message-form.html';
import './message-form.css';

import SimpleSchema from 'simpl-schema';
import autosize from 'autosize';

Template.MessageForm.onRendered(function() {
  let threadId;

  this.autorun(() => {
    let data = Template.currentData();
    if (data && data._id != threadId) {
      // save
      if (threadId) {
        let textarea = $('#message-form textarea');
        let content = textarea && textarea.val();
        Session.set(`message-draft-${threadId}`, content);
      }
      // load
      threadId = data._id;
      let draft = Session.get(`message-draft-${threadId}`);
      this.$('textarea').val(draft);
      autosize(this.$('textarea'));
    }
  });
});

Template.MessageForm.onDestroyed(function() {
  // save draft
  let textarea = $('#message-form textarea');
  if (textarea) {
    Session.set(`message-draft-${this.data._id}`, textarea.val());
  }
});

Template.MessageForm.helpers({
  formCollection() {
    return Messages;
  },
  formSchema() {
    return new SimpleSchema({
      internal: {
        type: Boolean,
        label: I18n.t('Internal'),
        optional: true,
        autoform: {
          type: "boolean-checkbox"
        }
      },
      content: {
        type: String,
        max: 10000,
        autoform: {
          type: 'textarea',
          label: false,
        }
      }
    });
  }
});

AutoForm.hooks({
  "message-form": {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      this.event.preventDefault();

      let threadId = this.formAttributes.threadId;
      Meteor.call('sendMessage', threadId, insertDoc.content, insertDoc.internal, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
          $("form textarea").focus();
        }
      });
      this.done();
    }
  }
});
