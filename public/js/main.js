const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const {username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')

socket.emit('joinRoom', {username, room})


socket.on('message', (message)=>{
    console.log(message);
    outputMessage(message);

    //scroll down;
    chatMessage.scrollTop = chatMessage.scrollHeight;   
}) 

socket.on('roomUsers', ({room, users}) =>{
    outputRoomName(room);
    outputRoomUser(users);
})

chatForm.addEventListener('submit', e =>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);
     //clear input after submission
     e.target.elements.msg.value = '';
     e.target.elements.msg.focus();
})

function outputMessage (message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML =`<p class="meta">${username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//output room name to DOM
function outputRoomName(room){
    roomName.innerText = room
}

function outputRoomUser(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username }</li>`).join('')}
    `
}