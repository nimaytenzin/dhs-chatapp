const expres =require ('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/formatmessage');
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require ('./utils/user')

const app = expres();
const botName = 'DHS chat bot'


app.use(expres.static('public'));
const server = http.createServer(app);
const PORT =3000;

const io = socketio(server);

io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {
        const user =userJoin(socket.id, username, room);
        socket.join(user.room)
        // emit to the current connected user the welcome message
        socket.emit('message', formatMessage(botName, `Welcome to ${room} room`));

        //Broadcast emit when a client connects to all except the client 
        socket.broadcast.to(room).emit('message', formatMessage(botName, `${username} has joined the chat`) );

        //send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users:getRoomUsers(user.room)
        })

    })
   
    

    //catch chatMessage
    socket.on('chatMessage', msg => {
        const user =getCurrentUser(socket.id)
           io.to(user.room).emit('message', formatMessage(user.username, msg));
    })
    
    //emit to all when a client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeaves(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users:getRoomUsers(user.room)
            })

        }
        
    })
})

server.listen(process.env.PORT || PORT, ()=>{
    console.log('Server Connected on port 3000')
})