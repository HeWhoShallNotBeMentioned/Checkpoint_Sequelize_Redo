'use strict';

const db = require('./database');
const Sequelize = require('sequelize');

// Make sure you have `postgres` running!

//---------VVVV---------  your code below  ---------VVV----------

const Task = db.define('Task', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  due: {
    type: Sequelize.DATE,
  },
});

Task.belongsTo(Task, { as: 'parent' });

Task.clearCompleted = () => {
  return Task.destroy({
    where: {
      complete: true,
    },
  });
};

Task.completeAll = () => {
  return Task.update(
    {
      complete: true,
    },
    { where: { complete: false } }
  );
};

Task.prototype.getTimeRemaining = function() {
  if (!this.due) {
    return Infinity;
  } else {
    let diff = Math.abs(new Date() - this.due);
    return diff;
  }
};

Task.prototype.isOverdue = function() {
  let diff = new Date() - this.due;
  let diff2 = diff / (24 * 60 * 60 * 1000);

  if (diff2 > 0) {
    if (this.complete === true) {
      return false;
    }
    return true;
  } else if (diff2 < 0) {
    return false;
  }
};

Task.prototype.addChild = function(child) {
  return Task.create({
    name: child.name,
    parentId: this.id,
  });
};

Task.prototype.getChildren = function() {
  return Task.findAll({
    where: { parentId: this.id },
  });
};

Task.prototype.getSiblings = function() {
  return Task.findAll({
    where: {
      parentId: this.parentId,
      id: { ne: this.id },
    },
  });
};

//---------^^^---------  your code above  ---------^^^----------

module.exports = Task;
