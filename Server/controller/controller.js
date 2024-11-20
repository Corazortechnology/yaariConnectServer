const mongoose = require("mongoose");
var UserDB = require("../model/model");

exports.create = (req, res) => {
  const user = new UserDB({
    active: "yes",
    status: "0",
  });

  user
    .save(user)
    .then((data) => {
      res.send(data._id);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occoured while creating a create operation",
      });
    });
};

exports.leavingUserUpdate = (req, res) => {
  const userid = req.params.id;
  console.log("Leaving userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { active: "no", status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};
exports.updateOnOtherUserClosing = (req, res) => {
  const userid = req.params.id;
  console.log("Leaving userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { active: "yes", status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: ` Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};

// exports.newUserUpdate = (req, res) => {
//   const userid = req.params.id;

//   // Step 2: Check if the omeID exists in the MongoDB Atlas database
//   UserDB.findOne({ _id: userid })
//     .then((user) => {
//       if (user) {
//         // omeID exists in the database, you can proceed with your logic here
//         UserDB.updateOne({ _id: userid }, { $set: { active: "yes" } })
//           .then((data) => {
//             if (!data) {
//               res.status(404).send({
//                 message: Cannot update user with ${userid} Maybe user not found!,
//               });
//             } else {
//               res.send("1 document updated");
//             }
//           })
//           .catch((err) => {
//             res.status(500).send({ message: "Error update user information" });
//           });
//         console.log("omeID exists in the database.");
//         // Do any further actions here...
//       } else {
//         // omeID does not exist in the database
//         console.log("omeID does not exist in the database.");

//         // Step 3: Remove the omeID from localStorage
//         // localStorage.removeItem("omeID");

//         // Step 4: Create a new user in MongoDB and obtain the new user's ID

//         const newUser = new UserDB({
//           active: "yes",
//           status: "0",
//         });
//         newUser
//           .save(newUser)
//           .then((data) => {
//             // Obtain the new user's ID from the saved data
//             const newUserID = data._id;

//             // Step 5: Use the obtained user ID (newUserID) as the new omeID
//             var newOmeID = newUserID;

//             // Step 6: Store the new omeID in both MongoDB and the browser's localStorage
//             // Store the new omeID in localStorage
//             // localStorage.setItem("omeID", newOmeID);
//             res.send({ omeID: newOmeID });
//           })
//           .catch((err) => {
//             console.error("Error saving new user to the database:", err);
//             // Handle any errors that occur during saving the new user
//           });
//       }
//     })
//     .catch((err) => {
//       console.error("Error querying the database:", err);
//       // Handle any errors that occur during database query
//     });
// };

exports.newUserUpdate = async (req, res) => {
  const userid = req.params.id;

  // Step 1: Check if the omeID exists in the MongoDB database
  try {
    const user = await UserDB.findOne({ _id: userid });

    if (user) {
      // User already exists, update it if necessary
      console.log("omeID exists in the database:", userid);

      // Update user to ensure active status
      const updateResult = await UserDB.updateOne(
        { _id: userid },
        { $set: { active: "yes" } }
      );

      if (updateResult.nModified > 0) {
        console.log("User updated successfully:", userid);
      } else {
        console.log("No changes were necessary for user:", userid);
      }

      res.send("Existing user updated successfully");
    } else {
      // User does not exist, create a new record
      console.log("omeID does not exist, creating a new user:", userid);

      const newUser = new UserDB({
        _id: userid, // Explicitly use the provided ID if required
        active: "yes",
        status: "0",
      });

      const savedUser = await newUser.save();
      console.log("New user created with ID:", savedUser._id);

      res.send({ omeID: savedUser._id });
    }
  } catch (error) {
    console.error("Error querying or updating the database:", error);
    res.status(500).send({
      message: "Error occurred while updating or creating a user.",
    });
  }
};

exports.updateOnEngagement = (req, res) => {
  const userid = req.params.id;
  console.log("Revisited userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { status: "1" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};
exports.updateOnNext = (req, res) => {
  const userid = req.params.id;
  console.log("Revisited userid is: ", userid);

  UserDB.updateOne({ _id: userid }, { $set: { status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with ${userid} Maybe user not found!`,
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error update user information" });
    });
};
function isValidObjectId(id) {
  // Check if the ID is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(id)) {
    const objectId = new mongoose.Types.ObjectId(id);
    const idString = objectId.toString();

    // Check if the resulting ID string matches the original input
    if (id === idString) {
      return true;
    }
  }

  return false;
}
exports.remoteUserFind = (req, res) => {
  const omeID = req.body.omeID;

  // Check if the provided omeID is valid
  if (isValidObjectId(omeID)) {
    // Retrieve the user's profession before searching for a remote user
    UserDB.findOne({ _id: omeID })
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        const userProfession = user.profession; // Assuming 'profession' is a field in the user schema

        // Now, find a random user with the same profession
        UserDB.aggregate([
          {
            $match: {
              _id: { $ne: new mongoose.Types.ObjectId(omeID) },
              active: "yes",
              status: "0",
              profession: userProfession, // Match users with the same profession
            },
          },
          { $sample: { size: 1 } }, // Pick a random user
        ])
          .then((data) => {
            if (data.length > 0) {
              res.send(data);
            } else {
              res.status(404).send({ message: "No matching user found" });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || "Error occurred while retrieving user information.",
            });
          });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error occurred while retrieving user profession.",
        });
      });
  } else {
    res.status(400).send({ message: "Invalid omeID" });
  }
};

exports.getNextUser = (req, res) => {
  const omeID = req.body.omeID;
  const remoteUser = req.body.remoteUser;
  let excludedIds = [omeID, remoteUser];

  // First, retrieve the profession of the current user (omeID)
  UserDB.findOne({ _id: omeID })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      const userProfession = user.profession; // Assuming 'profession' is a field in the user schema

      // Now, find the next user with the same profession
      UserDB.aggregate([
        {
          $match: {
            _id: { $nin: excludedIds.map((id) => new mongoose.Types.ObjectId(id)) },
            active: "yes",
            status: "0",
            profession: userProfession, // Ensure the profession matches
          },
        },
        { $sample: { size: 1 } }, // Pick a random user
      ])
        .then((data) => {
          if (data.length > 0) {
            res.send(data);
          } else {
            res.status(404).send({ message: "No matching user found" });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || "Error occurred while retrieving user information.",
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error occurred while retrieving the current user's profession.",
      });
    });
};
exports.deleteAllRecords = (req, res) => {
  UserDB.deleteMany({})
    .then(() => {
      res.send("All records deleted successfully");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while deleting all records",
      });
    });
};
exports.updateProfession = function(req, res) {
  const omeID = req.body.omeID; // Get omeID from the request body (matching the pattern in remoteUserFind)
  const profession = req.body.profession; // Get the new profession from the request body

  if (!profession || typeof profession !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid profession provided. It must be a string.",
    });
  }

  // Step 1: Validate omeID
  if (!mongoose.Types.ObjectId.isValid(omeID)) {
    return res.status(400).json({ success: false, message: "Invalid omeID" });
  }

  // Step 2: Find the user using omeID and update their profession
  UserDB.findOne({ _id: omeID })
    .then(function(user) {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Step 3: Update the profession
      user.profession = profession; // Update the profession field in the user model

      // Step 4: Save the updated user
      user.save()
        .then(function(updatedUser) {
          return res.status(200).json({
            success: true,
            message: "Profession updated successfully.",
            profession: updatedUser.profession,
          });
        })
        .catch(function(err) {
          return res.status(500).json({
            success: false,
            message: "Error updating profession. Please try again.",
          });
        });
    })
    .catch(function(err) {
      return res.status(500).json({
        success: false,
        message: "Error finding user. Please try again.",
      });
    });
};
