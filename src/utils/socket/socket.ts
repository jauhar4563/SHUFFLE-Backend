const socketIo_Config = (io: any) => {
  let users: { userId: string; socketId: string }[] = [];

  io.on("connect", (socket: any) => {
    console.log("A client connected");
    io.emit("welcome", "this is server hi socket");
    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });

    const removeUser = (socketId: string) => {
      users = users.filter((user) => user.socketId !== socketId);
    };

    const addUser = (userId: string, socketId: string) => {
      !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
    };

    const getUser = (userId: string) => {
      return users.find((user) => user.userId === userId);
    };

    //when connect
    socket.on("addUser", (userId: string) => {
      addUser(userId, socket.id);
      console.log(users);
      
      io.emit("getUsers", users);
    });

    // send and get message
    socket.on(
      "sendMessage",
      ({
        senderId,
        receiverId,
        text,
        messageType,
        file
      }: {
        senderId: string;
        receiverId: string;
        text: string;
        messageType:string;
        file:string;
      }) => {
        console.log(file)
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("getMessage", {
          senderId,
          text,
          messageType,
          file
        });
      }
    );
    socket.on('headerinfo',({
      message
    }:{message:string;})=>{
      console.log(message);
    })

    socket.on(
      "sendNotification",
      ({
        postImage,
        receiverId,
        senderName,
        message,
      }: {
        postImage: string;
        receiverId: string;
        senderName: string;
        message:string;
      }) => {
        console.log(message);
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("getNotifications", {
          postImage,
          senderName,
          message,
        });
      }
    );

    // Listen for "typing" event from client
    socket.on(
      "typing",
      ({ senderId, recieverId }: { senderId: string; recieverId: string }) => {
        const user = getUser(recieverId);
        if (user) {
          io.to(user.socketId).emit("userTyping", { senderId });
        }
      }
    );

    // Listen for "stopTyping" event from client
    socket.on(
      "stopTyping",
      ({ senderId, recieverId }: { senderId: string; recieverId: string }) => {
        const user = getUser(recieverId);
        if (user) {
          io.to(user.socketId).emit("userStopTyping", { senderId });
        }
      }
    );

    socket.on("joinGroup", (data: any) => {
      try {
        const { group_id, userId } = data;
        socket.join(group_id);
        console.log("Connected to the group", group_id, "by user", userId);
        socket
          .to(group_id)
          .emit("joinGroupResponse", {
            message: "Successfully joined the group",
          });
      } catch (error) {
        console.error("Error occurred while joining group:", error);
      }
    });

    socket.on("GroupMessage", async (data: any) => {
      const { group_id, sender_id, content,  messageType,file, lastUpdate } = data;
      const datas = {
        group_id,
        sender_id,
        content,
        messageType,
        file,
        lastUpdate,
      };
      if (group_id) {
        const emitData = {
          group_id,
          sender_id,
          content,
          messageType,
          file
        };
        io.to(group_id).emit("responseGroupMessage", emitData);
      }
    });
    socket.on("videoCallRequest", (data: any) => {
      const emitdata = {
        roomId: data.roomId,
        senderName:data.senderName,
        senderProfile:data.senderProfile
      };
      console.log(emitdata)
      const user = getUser(data.recieverId);
      if(user){
        io.to(user.socketId).emit("videoCallResponse", emitdata);
      }
    });


    //Group Video Call 

    socket.on("GroupVideoCallRequest",(data:any)=>{

      const emitdata={
        roomId:data.roomId,
        groupName:data.groupName,
        groupProfile:data.groupProfile
      }
      
        io.to(data.groupId).emit("GroupVideoCallResponse",emitdata)
      })
      

    // When disconnectec
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

export default socketIo_Config;
