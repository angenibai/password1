const login = document.querySelector('#login');

login.addEventListener('click', function() {
    chrome.tabs.create({active: true, url: '/window.html'})
});