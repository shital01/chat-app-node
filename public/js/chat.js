const socket =io()
//Elements
const $messageForm = document.querySelector('#message-form') 
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});

$messageForm.addEventListener('submit',(e)=>{
	e.preventDefault();//prevent default refresh
	$messageFormButton.setAttribute('disabled','disabled');
	const message = e.target.elements.message.value
	//document.querySelector('input').value
	socket.emit('sendMessage',message,(cb)=>{
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value='';
		$messageFormInput.focus();
		//if some check fail use return callback on server further code not run 
		//on client if(error) return console...so further code not run on client
		console.log('message was delivered....',cb)
	});
})

socket.on('message',(msg)=>{
	const html = Mustache.render(messageTemplate,{
		username:msg.username,
		message:msg.text,
		createdAt:moment(msg.createdAt).format('h:mm a')
	})

		$messages.insertAdjacentHTML('beforeend',html)
	//console.log(msg);
})

socket.emit('join',{username,room},(error)=>{
	if(error){
		alert(error);
		location.href='/'
	}
});
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


/*
socket.on('countUpdated',(clientcount)=>{
	console.log("count has been updated....",clientcount)
})

document.querySelector('#increment').addEventListener('click',()=>{
	console.log("button is clikced");
	socket.emit('increment');
})
*/