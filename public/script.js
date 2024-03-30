const wsUri = "ws://localhost:3000/chat";
//const wsUri = "wss://bash-x.com/chat";

const websocket = new WebSocket(wsUri);
let my_username = '';
let count = 0;

//------入室中のユーザーを表示-------
const enteringUser = (keys, values, obj) => {
  const entering = document.getElementById('entering-user');
  entering.innerHTML = '';
  for (const property in obj) {
    const username = document.createElement('div');
    username.innerText = `${property} が入室しました。`;
    count++;
    if (count >= 2) {
      gomoku.style.display = 'grid';
    }
    console.log(count);
    entering.appendChild(username);
  }
}
//ーーーーーーー五目ならべの板を生成------------------
let id_array = 'abcdefghijklmnopqwrstuvwx'.split('');
const gomoku = document.getElementById('gomoku');
console.log(id_array.length);
for (let i = 0; i < 9; i++) {
  const div = document.createElement('div');
  const br = document.createElement('br');
  div.classList.add('icon-btn');
  div.setAttribute('id', id_array[i]);
  gomoku.appendChild(div);
}
gomoku.style.display = 'none';

//ーーーーー特定の位置をクリックされた時の判定ーーーーー
document.addEventListener('DOMContentLoaded', function () {
  var btns = document.querySelectorAll('.icon-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function () {
      const data = {}
      data['send-coordinate'] = [my_username, this.id];
      sendMessage(JSON.stringify(data));
    }, false);
  }
}, false);

//
const hideElement = () => {
  const form = document.getElementById('form');
  form.style.display = 'none';
}

//ーーーーサーバー側にユーザー名を送信ーーーーーー
const sendUserName = () => {
  const user_name = document.getElementById('user-name').value;
  if (user_name !== '') {
    const data = {};
    data[user_name] = new Date();
    sendMessage(JSON.stringify(data));
  } else {
    alert('ユーザー名が空です');
  }
}

const writeMaruBatu = (count, coordinate) => {
  console.log(count);
  console.log(coordinate);
  if (count % 2 === 0) {
    document.getElementById(coordinate).innerText = '○';
  } else {
    document.getElementById(coordinate).innerText = '✕';
  }
}

const reflectCoordinates = (obj) => {
  console.log(obj);
  const values = Object.values(obj);
  console.log(values[0]);
  writeMaruBatu(values[0][0], values[0][1]);
}

//送られてきたデータを処理
const getUserData = (keys, values, obj) => {
  const message = document.getElementById('message');
  message.innerHTML = '';
  console.log(keys);

  switch (keys) {
    case 'too-many-players':
      message.innerText = 'ルームが満員です。';
      break;
    case 'this-name-is-too-long':
      message.innerText = '長過ぎるユーザー名です。';
      break;
    case 'already-in-use':
      message.innerText = '既に使われているユーザー名です。';
      break;
    case 'has-been-decided':
      message.innerText = `あなたのユーザー名は ${values} に決定されました。`;
      count++;
      hideElement();
      break;
    case 'reflect-the-coordinates':
      reflectCoordinates(obj);
      break;
    default:
      enteringUser(keys, values, obj);
  }
}

websocket.onopen = (e) => {
  console.log("CONNECTED");
};
websocket.onclose = (e) => {
  console.log("DISCONNECTED");
};
websocket.onerror = (e) => {
  console.log(`ERROR: ${e.data}`);
};

function sendMessage(message) {
  websocket.send(message);
}

//サーバー側からメッセージを受信
websocket.onmessage = (e) => {
  const obj = JSON.parse(e.data);
  const keys = String(Object.keys(obj));
  const values = String(Object.values(obj));
  getUserData(keys, values, obj);
};