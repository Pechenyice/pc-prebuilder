// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer, Menu } = require('electron');
// const customTitlebar = require('custom-electron-titlebar');

// let titleBar = new customTitlebar.Titlebar({
//     backgroundColor: customTitlebar.Color.fromHex('#03a9f4'),
//     shadow: true,
//     menu: null
// });

// titleBar.updateTitle('Our Code World Tutorials Rock !');


class ConfigPrefab {

    name = "";
    items = [];

    get name() {
      return this._name;
    }

    get items() {
        return this._items;
    }
  
    set name(value) {
      this._name = value;
    }
  
    addItem(name, path) {
        this.items.push({name, path});
    }

}

let prefab = new ConfigPrefab();

let filePathInput = document.getElementById('filePathInput');
let prefabNameInput = document.getElementById('prefabNameInput');

let itemsBox = document.getElementsByClassName('itemsBox__content')[0];

let tasks = document.getElementsByClassName('tasks')[0];

let prefabs = document.getElementsByClassName('tasks__prefab');

filePathInput.addEventListener('change', function() {
    let parts = this.files[0].path.split('\\');
    for (let elem of prefab.items) {
        if (elem.path == this.files[0].path) return;
    }
    prefab.addItem(parts[parts.length - 1].split('.')[0], this.files[0].path);

    let item = document.createElement('li');
    item.className = 'itemsBox__item';
    item.innerText = `${parts[parts.length - 1].split('.')[0]} (${this.files[0].path})`;
    itemsBox.appendChild(item);
});

prefabNameInput.addEventListener('change', function() {
    prefab.name = this.value;
});

let creatorTrigger = document.getElementsByClassName('creator__trigger')[0];
let creatorAccepter = document.getElementsByClassName('creator__accepter')[0];

creatorTrigger.addEventListener('click', () => {
    filePathInput.click();
});

creatorAccepter.addEventListener('click', () => {
    if (!prefab.name) {
        showNotification('Enter Prefab\'s name');
        return;
    }
    if (!prefab.items.length) {
        showNotification('Prefab must contain no less than 1 element');
        return;
    }
    ipcRenderer.send('prefabReady', JSON.stringify(prefab));
});

ipcRenderer.send('onInit', JSON.stringify({}));


ipcRenderer.on('createPrefabSignal', (event, data) => {
    let info = JSON.parse(data);
    if (info.error) {
        showNotification(info.comment);
        return;
    }
    itemsBox.innerHTML = '';
    prefabNameInput.value = '';
    filePathInput.value = '';
    prefab = new ConfigPrefab();
    tasks.innerHTML += addPrefab(info);
    prefabs = document.getElementsByClassName('tasks__prefab');
    for (let elem of prefabs) {
        elem.removeEventListener('click', prefabLoader);
        elem.addEventListener('click', prefabLoader);
    }
});

ipcRenderer.on('prefabLoaded', (event, data) => {
    showNotification('Prefab is configured! Waiting...');
});

function addPrefab(info) {
    let str = `<div class="tasks__prefab prefab" data-number="${info.number}">`
    +    `<div class="prefab__name">${info.data.name}</div>`
    +    `<div class="prefab__number">#${info.number}</div>`
    +    `<ol class="prefab__content">`;

    for (let elem of info.data.items) {
        str += `  <li class="prefab__elem">${elem.name}</li>`;
    }
    
    str += `</ol>`
    +    `<div class="prefab__starter">Configure</div>`
    +`</div>`;

    return str;
}

function prefabLoader() {
    ipcRenderer.send('loadPrefab', JSON.stringify({number: this.dataset.number}));
}

let speed = 20;

function showNotification(text) {
    let str = `<div class="notifications__note note">`
    + `<div class="note__close">&times;</div>`
    + `<div class="note__text"></div>`
    + `</div>`;
    let i = 0;
    
    document.getElementsByClassName('notifications')[0].innerHTML += str;
    let memory = document.getElementsByClassName('notifications__note');
    let ind = memory.length - 1;

    (function typeWriter(){
        if (i < text.length) {
            memory[ind].getElementsByClassName('note__text')[0].innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    })();

    for (let elem of document.getElementsByClassName('notifications__note')) {
        elem.addEventListener('click', () => {
            document.getElementsByClassName('notifications')[0].removeChild(elem);
        });
    }
}

// console.log(window.innerWidth);

let bubbles = document.getElementsByClassName('bubbles__bubble');
window.addEventListener('mousemove', function(e) {
    for (let bubble of bubbles) {
        bubble.style.transform = `translate(${(e.pageX - window.innerWidth) / -80 * bubble.dataset.k}px, ${(e.pageY - window.innerHeight) / -80 * bubble.dataset.k}px)`;
    }
});

let themes = document.getElementsByClassName('theme__choice');
let activator = document.getElementsByClassName('theme__active')[0];
let r = document.querySelector(':root');

themes[0].addEventListener('click', function() {
    if (themes[0].classList.contains('theme__choice_active')) return;
    themes[0].classList.add('theme__choice_active');
    themes[1].classList.remove('theme__choice_active');
    activator.classList.remove('theme__active_triggered');
    r.style.setProperty('--main-content-color', 'white');
    r.style.setProperty('--main-background-color', 'rgb(31, 31, 31)');
    // r.style.setProperty('--main-add-color', 'rgb(31, 31, 31)');
    r.style.setProperty('--main-accent-color', 'rgb(221, 207, 9)');
    // r.setProperty('--main-background-color', 'white');
    // r.setProperty('--main-background-color', 'white');
});

themes[1].addEventListener('click', function() {
    if (themes[1].classList.contains('theme__choice_active')) return;
    themes[1].classList.add('theme__choice_active');
    themes[0].classList.remove('theme__choice_active');
    activator.classList.add('theme__active_triggered');
    r.style.setProperty('--main-background-color', 'rgb(150, 150, 150)');
    r.style.setProperty('--main-content-color', 'rgb(31, 31, 31)');
    // r.style.setProperty('--main-add-color', 'white');
    r.style.setProperty('--main-accent-color', 'rgb(234 255 56)');
});

setTimeout(() => {document.getElementsByClassName('creator__name')[0].style.opacity = 1;}, 100);
setTimeout(() => {document.getElementsByClassName('creator__description')[0].style.opacity = 1;}, 300);
setTimeout(() => {document.getElementsByClassName('theme')[0].style.opacity = 1;}, 500);
setTimeout(() => {document.getElementsByClassName('itemsBox')[0].style.opacity = 1;}, 700);
setTimeout(() => {document.getElementsByClassName('creator__accepter')[0].style.opacity = 1;}, 900);
setTimeout(() => {document.getElementsByClassName('tasks')[0].style.opacity = 1;}, 2000);

setTimeout(() => {bubbles[0].style.opacity = 1;}, 1200);
setTimeout(() => {bubbles[1].style.opacity = 1;}, 1400);
setTimeout(() => {bubbles[2].style.opacity = 1;}, 1600);
setTimeout(() => {bubbles[3].style.opacity = 1;}, 1800);

// ipcRenderer.invoke('perform-action', ...args)
