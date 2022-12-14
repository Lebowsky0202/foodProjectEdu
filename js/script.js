window.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Tabs
    const tabsContent = document.querySelectorAll('.tabcontent'),// Табы сами с контентом
        tabsParent = document.querySelector('.tabheader__items'),// Обертка менюшки
        tabs = document.querySelectorAll('.tabheader__item');// Сами менюшки

    // Скрывает все табы
    function hideTabContent(){
        tabsContent.forEach(items => {
            items.classList.add('hide');
            items.classList.remove('show', 'fade');
        });
        tabs.forEach(items => {
            items.classList.remove('tabheader__item_active');
        });
    }

    // Показывает определенный таб
    function showTabContent(i = 0){
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();
    // При нажатий на одну из пункта меню выходит определенная менюшка
    // Здесь используется делегирование
    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if(target && target.classList.contains('tabheader__item')){
            tabs.forEach((item, i) => {
                if(target == item){
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    //timer
    const deadline = '2022-09-03';

    function getTimeRemaining(endtime){
        let days, hours, minutes, seconds;
        const t = Date.parse(endtime) - Date.parse(new Date());
        if (t <= 0){
            days = 0;
            hours = 0;
            minutes = 0;
            seconds = 0;
        }else{
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor(t / (1000 * 60 * 60) % 24),
            minutes = Math.floor(t / (1000 * 60 ) % 60),
            seconds = Math.floor((t / 1000) % 60);
        }

        return {
            total: t,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        };
    }

    function setZero(num){
        if(num > 0 && num < 10){
            return `0${num}`;
        }else{
            return num;
        }
    }

    function setClock(selector, endtime){
        const timer = document.querySelector(selector),
              days = document.querySelector('#days'),
              hours = document.querySelector('#hours'),
              minutes = document.querySelector('#minutes'),
              seconds = document.querySelector('#seconds'),
              timeInterval = setInterval(updateClock, 1000);

        updateClock();

        

        function updateClock(){
            const t = getTimeRemaining(endtime);

            days.textContent = setZero(t.days);
            hours.textContent = setZero(t.hours);
            minutes.textContent = setZero(t.minutes);
            seconds.textContent = setZero(t.seconds);

            if (t.total <= 0){
                clearInterval(timeInterval);
            }
        }
    }

    setClock('.timer', deadline);

    //Modal

    const modalBtn = document.querySelectorAll('[data-modal]'),
          modalWindow = document.querySelector('.modal');

    function closeModal(){
        modalWindow.classList.add('hide');
        modalWindow.classList.remove('show');
        document.body.style.overflow = '';
    }

    function showModal(){
        modalWindow.classList.add('show');
        modalWindow.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearTimeout(modalTimerId);
    }

    function showModalByScroll(){
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight){
            showModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }
    
    modalBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal();
        });
    });
    

    modalWindow.addEventListener('click', (e) => {
        const target = e.target;
        if(target && target === modalWindow || target.getAttribute('data-close') == ''){
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.code === 'Escape' && modalWindow.classList.contains('show')){
            closeModal();
        }
    });
    const modalTimerId = setTimeout(showModal, 30000);
    
    window.addEventListener('scroll', showModalByScroll);

    //Card 

    class Card {
        constructor(img, alt, title, descr, price, parentSelector) {
            this.img = img;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.parent = document.querySelector(parentSelector); 
            this.transfer = 27;
            this.changeToUAH(); 
        }

        changeToUAH(){
            this.price = this.price * this.transfer;
        }

        render(){
            const element = document.createElement('div');
            element.innerHTML = `
            <div class="menu__item">
                <img src=${this.img} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            </div>
            `;
            this.parent.append(element);
        }
    }

    const getResource  = async (url) => {
        let res = await fetch(url);
        if(!res.ok){
            throw new Error(`Could not fetch ${url} status ${res.status}`);
        }

        return await res.json();
    }
    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({img ,altimg, title, descr, price }) => {
                new Card(img, altimg, title, descr, price, '.menu .container').render();
            }); 
        });
    
    // Отправка формы на сервер

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо, скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так',
    };

    forms.forEach((item) => {
        bindPostData(item);
    });

    const postData = async (url, data) => {
        let res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: data,
        });
        return await res.json();
    }

    function bindPostData(form){
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage);
            
            
            const fromData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(fromData.entries()))

            postData('http://localhost:3000/requests', json )
            .then(data => {
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove(); 
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => { 
                form.reset();
            }); 
    });

    function showThanksModal(message){
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        showModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">
                    ${message}
                </div>
            </div>
        `;
        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    // fetch('http://localhost:3000/menu')
    //     .then(data => data.json())
    //     .then(data => console.log(data ));
    }

    //slider
    const sliderItem = document.querySelectorAll('.offer__slide'),
          slider = document.querySelector('.offer__slider'),
          prev = document.querySelector('.offer__slider-prev'),
          next = document.querySelector('.offer__slider-next'),
          total = document.querySelector('#total'),
          current = document.querySelector('#current'),
          slidesWraper = document.querySelector('.offer__slider-wrapper'),
          slidesField = document.querySelector('.offer__slider-inner'),
          width = window.getComputedStyle(slidesWraper).width ;
    let sliderIndex = 1;
    let offset = 0;

    if(sliderItem.length < 10){
        total.textContent = `0${sliderItem.length}`;
        current.textContent = `0${sliderIndex}`;
    }else{
        total.textContent = sliderItem.length ;
        current.textContent = sliderIndex;
    }

    slidesField.style.width = 100 * sliderItem.length + '%';
    slidesField.style.display = 'flex';
    slidesField.style.transition = '0.5s all';
    slidesWraper.style.overflow = 'hidden';

    sliderItem.forEach(slide => {
        slide.style.width = width;
    })

    slider.style.position = 'relative';
    const indecators = document.createElement('ol'),
          dots = [];
    indecators.classList.add('carousel-indicators');
    indecators.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 15;
        display: flex;
        justify-content: center;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    `;
    slider.append(indecators);

    for(let i = 0; i < sliderItem.length; i++){
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.style.cssText = `
            box-sizing: content-box;
            flex: 0 1 auto;
            width: 30px;
            height: 6px;
            margin-right: 3px;
            margin-left: 3px;
            cursor: pointer;
            background-color: #fff;
            background-clip: padding-box;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            opacity: .5;
            transition: opacity .6s ease;
        `;
        if(i == 0){
            dot.style.opacity = 1;
        }
        indecators.append(dot);
        dots.push(dot);
    }

    function deleteNotDigits(str){
        return +str.replace(/\D/g, '');
    }

    next.addEventListener('click', () =>{
        if(offset == deleteNotDigits(width) * (sliderItem.length - 1)){
            offset = 0;
        }else{
            offset += deleteNotDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;
        if(sliderIndex == sliderItem.length){
            sliderIndex = 1;
        }else{
            sliderIndex++;
        }

        if(sliderItem.length < 10){
            current.textContent = `0${sliderIndex}`;
        }else{
            current.textContent = sliderIndex;
        }
        dots.forEach(dot => dot.style.opacity = '0.5');
        dots[sliderIndex - 1].style.opacity = 1;
    });

    prev.addEventListener('click', () =>{
        if(offset == 0){
            offset = deleteNotDigits(width) * (sliderItem.length - 1);
        }else{
            offset -= deleteNotDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if(sliderIndex == 1){
            sliderIndex = sliderItem.length;
        }else{
            sliderIndex--;
        }

        if(sliderItem.length < 10){
            current.textContent = `0${sliderIndex}`;
        }else{
            current.textContent = sliderIndex;
        }
        dots.forEach(dot => dot.style.opacity = '0.5');
        dots[sliderIndex - 1].style.opacity = 1;
    });

    dots.forEach(dot => {
        dot.addEventListener('click', e => {
            const slideTo = e.target.getAttribute('data-slide-to');

            sliderIndex = slideTo;
            offset = deleteNotDigits(width) * (slideTo - 1);
            slidesField.style.transform = `translateX(-${offset}px)`;

            if(sliderItem.length < 10){
                current.textContent = `0${sliderIndex}`;
            }else{
                current.textContent = sliderIndex;
            }

            dots.forEach(dot => dot.style.opacity = '0.5');
            dots[sliderIndex - 1].style.opacity = 1;
        });
    });
    //Calc
    const result = document.querySelector('.calculating__result span');
    let sex,height, weight, age,ratio;

    if (localStorage.getItem('sex')){
        sex = localStorage.getItem('sex');
    }else{
        sex = 'female';
        localStorage.setItem('sex', 'female');
    }

    if (localStorage.getItem('ratio')){
        ratio = localStorage.getItem('ratio');
    }else{
        ratio = 1.375;
        localStorage.setItem('ratio', 1.375);
    }

    function initLocalSettings(selector, activeClass){
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.classList.remove(activeClass);
            if(elem.getAttribute('id') === localStorage.getItem('sex')){
                elem.classList.add(activeClass);
            }
            if(elem.getAttribute('data-ratio') === localStorage.getItem('ratio')){
                elem.classList.add(activeClass);
            }
        });
    }

    initLocalSettings('#gender div', 'calculating__choose-item_active');
    initLocalSettings('.calculating__choose_big div', 'calculating__choose-item_active');

    function calcTotal(){
        if(!sex || !height || !weight || !age || !ratio){
            result.textContent = '___';
            return;
        }
        if(sex === 'female'){
            result.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
        }else{
            result.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
        }
    }

    calcTotal();

    function getStaticInformation(parentSelector, activeClass){
        const elemets = document.querySelectorAll(`${parentSelector} div`);

        elemets.forEach(elem => {
            elem.addEventListener('click', (e) => {
                if(e.target.getAttribute('data-ratio')){
                    ratio = +e.target.getAttribute('data-ratio');
                    localStorage.setItem('ratio', +e.target.getAttribute('data-ratio'));
                }else{
                    sex = e.target.getAttribute('id');
                    localStorage.setItem('sex', e.target.getAttribute('id'));
                }
    
                elemets.forEach(elem => {
                    elem.classList.remove(activeClass);
                });
    
                e.target.classList.add(activeClass);
                calcTotal();
            });
        });
    }

    getStaticInformation('#gender', 'calculating__choose-item_active');
    getStaticInformation('.calculating__choose_big', 'calculating__choose-item_active');

    function getDynamicInformation(selector){
        const input = document.querySelector(selector);

        input.addEventListener('input', () => {
            if(input.value.match(/\D/g)){
                input.style.border = '1px solid red';
            }else{
                input.style.border = 'none';
            }

            switch(input.getAttribute('id')){
                case 'height':
                    height = +input.value;
                    break;
                case 'weight':
                    weight = +input.value;
                    break;
                case 'age':
                    age = +input.value;
                    break;
            }
            calcTotal(); 
        });
    }

    getDynamicInformation('#height');
    getDynamicInformation('#weight ');
    getDynamicInformation('#age');
});