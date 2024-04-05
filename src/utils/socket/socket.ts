const socketIo_Config = (io: any) => {
    let users: { userId: string; socketId: string }[] = [];

    io.on("connect", (socket: any) => {
        console.log("A client connected");
        io.emit('welcome', "this is server hi socket");
        socket.on("disconnect", () => {
            console.log("A client disconnected");
        });
   
        const removeUser = (socketId: string) => {
            users = users.filter(user => user.socketId !== socketId);
        }

        const addUser = (userId: string, socketId: string) => {
            !users.some(user => user.userId === userId) &&
            users.push({ userId, socketId });
        }

        const getUser = (userId: string) => {
            return users.find(user => user.userId === userId);
        }

        //connect and disconnect users
        socket.on('addUser',(userId: string) => {
            addUser(userId, socket.id)
            io.emit('getUsers', users)
        })

        socket.on('disconnect',() => {
            removeUser(socket.id)
            io.emit('getUsers', users)
        })
    });
};

export default socketIo_Config;
