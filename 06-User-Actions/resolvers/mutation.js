const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {AuthenticationError,ForbiddenError} = require('apollo-server-express');
require('dotenv').config();



module.exports = {
  newNote: async (parent, {id}, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }
    if(id!=user.id){
      throw new ForbiddenError("you dont have permission to add data")
    }
    return await models.Note.create({
      id:user.id,
      content: args.content,
      author: args.author
    });
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }

    const note = await models.Note.findOne({id:id});
    if (note && String(note.id) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delete the note");
    }

    try {
      await models.Note.deleteOne(note);
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { content, id }, { models, user }) => {

    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }

    const note = await models.Note.findOne({id:id});

    if (note && String(note.id) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
    }

    return await models.Note.findOneAndUpdate(
      {
        id: id
      },
      {
        $set: {
          content:content
        }
      }
    );
  },
  
  signUp: async (parent, { id,username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await models.User.create({
        id,
        username,
        email,
        password: hashed
      });
      return jwt.sign({ id: user.id }, process.env.dasanushka);
    } catch (err) {
      throw new Error('Error creating account');
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {

      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      username:username,
      email:email,
      
    });


    if (!user) {
      throw new AuthenticationError('Error signing in');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Error signing in');
    }

    return jwt.sign({ id: user.id }, process.env.dasanushka);
  }
};
