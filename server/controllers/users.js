const User = require("../models/users");

function findById(id) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.findById(id).exec());
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}
function findByUsername(username) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.find({ username: username }).exec());
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

function findAll() {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.find({}).lean().exec());
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

function create(UserToCreate) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.create(UserToCreate));
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

function deleteUser(UserToDelete) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.findOneAndRemove({ username: UserToDelete }));
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}
function deleteById(UserToDelete) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.findOneAndRemove({ _id: UserToDelete }));
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

function updateByUsername(UserToUpdate, query) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.findOneAndUpdate({ username: UserToUpdate }, query));
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

function updateById(UserToUpdate, query) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.findOneAndUpdate({ _id: UserToUpdate }, query));
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

function makeAdmin(UserToUpdate) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.findOneAndUpdate({ _id: UserToUpdate }, {admin:true}));
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}
function removeAdmin(UserToUpdate) {
  return new Promise((resolve, reject) => {
    try {
      resolve(User.findOneAndUpdate({ _id: UserToUpdate }, {admin:false}));
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

module.exports = {
  findById,
  findByUsername,
  findAll,
  create,
  deleteByUsername: deleteUser,
  deleteById,
  updateByUsername,
  updateById,
  makeAdmin,
  removeAdmin
};
