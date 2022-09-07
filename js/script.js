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

    next.addEventListener('click', () =>{
        if(offset == +width.slice(0, width.length - 2) * (sliderItem.length - 1)){
            offset = 0;
        }else{
            offset += +width.slice(0, width.length - 2);
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
    });

    prev.addEventListener('click', () =>{
        if(offset == 0){
            offset = +width.slice(0, width.length - 2) * (sliderItem.length - 1)
        }else{
            offset -= +width.slice(0, width.length - 2);
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
    });

    // showSliders(sliderIndex);

    // if(sliderItem.length < 10){
    //     total.textContent = `0${sliderItem.length}`;
    // }else{
    //     total.textContent = sliderItem.length ;
    // }

    // function showSliders(n){
    //     if(n > sliderItem.length){
    //         sliderIndex = 1
    //     }
    //     if(n < 1){
    //         sliderIndex = sliderItem.length;
    //     }
    //     sliderItem.forEach(item => {
    //         item.classList.add('hide');
    //         item.classList.remove('show');
    //     })
    //     sliderItem[sliderIndex - 1].classList.add('show'); 
    //     sliderItem[sliderIndex - 1].classList.remove('hide');
    //     if(sliderItem.length < 10){
    //         current.textContent = `0${sliderIndex}`;
    //     }else{
    //         current.textContent = sliderIndex ;
    //     }  
    // }

    // function plusSlides(n){
    //     showSliders(sliderIndex += n);
    // }
    
    // sliderPrev.addEventListener('click', () => {plusSlides(-1)});
    // sliderNext.addEventListener('click', () => {plusSlides(+1)});

});