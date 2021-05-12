var socket=io();
const form=document.getElementById('userform');
const input=document.getElementById('input');
const container=document.getElementById('container');
const roomForm=document.getElementById('roomForm');

var obj={
    from: me,
    to: toUser
    
}

if(form!=null){

    socket.emit('join-room',me,obj);

}

    socket.on('room-joined',(msg)=>{
        console.log(msg);
    })
   
   
    socket.on('chat-msg',msg=>{
        var item=document.createElement('p');
        item.textContent=toUser+": "+msg;
        container.appendChild(item);
    })

    form.addEventListener('submit',e=>{
        e.preventDefault()
        if(input.value){
            var item=document.createElement('p');
            item.textContent='you: '+input.value;
            container.appendChild(item);
            socket.emit('chat-msg',input.value);
           
        }
        input.value='';
    });
   

console.log('sending message to: '+toUser);