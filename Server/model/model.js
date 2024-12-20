const mongoose = require("mongoose");
var schema = new mongoose.Schema(
  {
    active: {
      type: String,
    },
    status: {
      type: String,
    },
    profession: {
      type: String,
      default: "Computer Science",
    },
  },
  { timestamps: true }
);

const UserDB = mongoose.model("ome", schema);
module.exports = UserDB;
