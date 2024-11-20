const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const cors = require("cors"); // Import cors

const app = express();
const dotenv = require("dotenv");
const connectDB = require("./Server/database/connection");

dotenv.config({ path: "config.env" });
const PORT = process.env.PORT || 8080;

connectDB();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, "client/build")));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
} else {
  app.use(cors()); // Allow API calls from React during development
}

// app.use("/css", express.static(path.resolve(__dirname, "Assets/css")));
// app.use("/img", express.static(path.resolve(__dirname, "Assets/img")));
// app.use("/js", express.static(path.resolve(__dirname, "Assets/js")));

app.use("/", require("./Server/routes/router"));

var server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const allowedOrigins = [
  "http://localhost:3000", // React frontend in local development
  "http://localhost:5173",
  "https://omes-ahgpcqfjdmb8h4bh.canadacentral-01.azurewebsites.net", // Production URL
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies and credentials
  })
);

const io = require("socket.io")(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true, // Enable Engine.IO v3 compatibility if needed
});

var userConnection = [];

io.on("connection", (socket) => {
  console.log("Socket id is: ", socket.id);

  // socket.on("userconnect", (data) => {
  //   console.log("Logged in username", data.displayName);
  //   userConnection.push({
  //     connectionId: socket.id,
  //     user_id: data.displayName,
  //   });

  //   var userCount = userConnection.length;
  //   console.log("UserCount", userCount);
  //   userConnection.map(function (user) {
  //     console.log("Username is: ", user.user_id);
  //   });
  // });
  socket.on("userconnect", (data) => {
    console.log("Logged in username", data.displayName);

    // Find if the user is already connected
    const existingUser = userConnection.find(
      (user) => user.user_id === data.displayName
    );

    if (existingUser) {
      console.log(`User ${data.displayName} is already connected.`);
      // Disconnect the old socket
      socket.to(existingUser.connectionId).emit("forceDisconnect");
      userConnection = userConnection.filter(
        (user) => user.user_id !== data.displayName
      );
    }

    // Add the new connection
    userConnection.push({
      connectionId: socket.id,
      user_id: data.displayName,
    });

    console.log("UserCount", userConnection.length);
    userConnection.map((user) => console.log("Username is: ", user.user_id));
  });

  socket.on("offerSentToRemote", (data) => {
    var offerReceiver = userConnection.find(
      (o) => o.user_id === data.remoteUser
    );
    if (offerReceiver) {
      console.log("OfferReceiver user is: ", offerReceiver.connectionId);
      socket.to(offerReceiver.connectionId).emit("ReceiveOffer", data);
    }
  });

  socket.on("answerSentToUser1", (data) => {
    var answerReceiver = userConnection.find(
      (o) => o.user_id === data.receiver
    );
    if (answerReceiver) {
      console.log("answerReceiver user is: ", answerReceiver.connectionId);
      socket.to(answerReceiver.connectionId).emit("ReceiveAnswer", data);
    }
  });

  socket.on("candidateSentToUser", (data) => {
    var candidateReceiver = userConnection.find(
      (o) => o.user_id === data.remoteUser
    );
    if (candidateReceiver) {
      console.log(
        "candidateReceiver user is: ",
        candidateReceiver.connectionId
      );
      socket.to(candidateReceiver.connectionId).emit("candidateReceiver", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    userConnection = userConnection.filter((p) => p.connectionId !== socket.id);
    console.log(
      "Rest users username are: ",
      userConnection.map(function (user) {
        return user.user_id;
      })
    );
  });

  socket.on("remoteUserClosed", (data) => {
    var closedUser = userConnection.find((o) => o.user_id === data.remoteUser);
    if (closedUser) {
      console.log("closedUser user is: ", closedUser.connectionId);
      socket.to(closedUser.connectionId).emit("closedRemoteUser", data);
    }
  });
});