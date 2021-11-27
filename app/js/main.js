const btn = document.querySelector('#menu-btn');
const mobileMenu = document.querySelector('#menu');
const body = document.querySelector('body');

function navToggle() {
    btn.classList.toggle('open');
    mobileMenu.classList.toggle('hidden');
    body.classList.toggle('no-scroll');
}

btn.addEventListener('click', navToggle);