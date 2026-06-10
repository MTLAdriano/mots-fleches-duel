let Keyboard = null; // initialisé dans initKeyBoard()

let can_text = true;

let layout = [
    "A Z E R T Y U I O P",
    "Q S D F G H J K L M",
    "W X C V B N",
    "{escape} {enter} {backspace}"
];

if (APP_GAME_SLUG == 'arrowwords' || APP_GAME_SLUG == 'crosswords' || APP_GAME_SLUG == 'mini_arrowwords' || APP_GAME_SLUG == 'mini_crosswords') {
    layout = [
        "A Z E R T Y U I O P",
        "Q S D F G H J K L M",
        "{escape} W X C V B N {backspace}"
    ];
}
let display = {
    "{numbers}": "123",
    "{enter}": '⏎ Valider',
    "{escape}": '<i class="fa-solid fa-circle-xmark"></i> fermer',
    "{tab}": "tab ⇥",
    "{backspace}": 'suppr <i class="fa-solid fa-delete-left"></i>',
    "{capslock}": "caps lock ⇪",
    "{shift}": "⇧",
    "{controlleft}": "ctrl ⌃",
    "{controlright}": "ctrl ⌃",
    "{altleft}": "alt ⌥",
    "{altright}": "alt ⌥",
    "{metaleft}": "cmd ⌘",
    "{metaright}": "cmd ⌘",
    "{abc}": "ABC"
};

if (APP_GAME_SLUG == 'wordle') {
    layout = [
        "A Z E R T Y U I O P",
        "Q S D F G H J K L M",
        "W X C V B N {backspace} {enter}"
    ];
    display = {
        "{numbers}": "123",
        "{enter}": '<span class="validate-btn">Valider</span> <img class="validate-img" src="https://sdk.mygamify.fr/assets/img/enter.svg">',
        "{escape}": '<i class="fa-solid fa-circle-xmark"></i>',
        "{tab}": "tab ⇥",
        "{backspace}": '<img height="20" src="https://sdk.mygamify.fr/assets/img/backspace.svg">',
        "{capslock}": "caps lock ⇪",
        "{shift}": "⇧",
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
        "{abc}": "ABC"
    };
}

function initKeyBoard(){
    Keyboard = window.SimpleKeyboard.default;
    keyboard = new Keyboard({
        mergeDisplay: true,
        layoutName: "default",
        layout: {
            default: layout
        },
        display: display
    });
    $('.show_keyboard').on('click', function () {
        $(this).toggleClass('active');
        $('.gameKeyboard').toggle();
        $('.gameDefinition').toggleClass('has_keyboard');
    });
}

let checkTimeout = null;

function initMobileKeyboard() {
    keyboard.setOptions({
        onKeyPress: function (value) {

            if (!can_text) {
                // return false;
            }

            if (value == '{enter}' && enterKey != undefined) {
                enterKey();
            } else if (value == '{escape}') {
                $('.gameKeyboard').hide();
                $('.gameDefinition').removeClass('has_keyboard');
                $('.show_keyboard').removeClass('active');
            } else {

                if (window.innerWidth < 769) {
                    // $('html, body').animate({
                    //     scrollTop: current_case.offset().top - 200
                    // }, 300);
                }

                let removeNext = false;

                if (!current_case.hasClass('validated')) {
                    if (value != '{backspace}' && value != '{escape}') {
                        current_case.not('a').find('span').html(value);
                    }
                    if (value == '{backspace}') {

                        if (APP_GAME_SLUG == 'wordle' && current_case.find('span').html() == '') {
                            removeNext = true;
                        } else {
                            removeNext = false;
                        }
                        current_case.find('span').html('');
                    }
                }

                // on récupère la classe des cases sélectionnées
                var caseClass = '.column.w_' + current_axe + '_' + current_id;
                // on récupère la position de la case en cours par rapport au mot
                var pos = parseInt(current_case.attr('data-pos-' + current_axe));
                let newCase = null;
                let isBack = false;
                // si bouton retour / suppr
                if (value == '{backspace}') {
                    current_case.removeClass('last_played')
                    // on récup l'élément qui a l'index de position précédent
                    newCase = $(caseClass + '[data-pos-' + current_axe + '="' + (pos - 1) + '"]');
                    isBack = true;
                    
                    if (removeNext) {
                        newCase.find('span').html('')
                    }
                } else {
                    current_case.addClass('last_played');
                    // on récup l'élément qui a l'index de position suivant
                    newCase = $(caseClass + '[data-pos-' + current_axe + '="' + (pos + 1) + '"]');
                }

                checkCase(newCase, isBack);

                if (checkTimeout) {
                    clearTimeout(checkTimeout);
                }
                checkTimeout = setTimeout(()=>{
                    can_text = false;
                    checkWords(false,() => {
                        can_text = true
                    });
                },500)
                
            }
        }
    });
}
function initDesktopkeyBoard() {
    $(document).off('keydown').on('keydown', function (e) {

        if (!can_text) {
            // return false;
        }

        let removeNext = false;

        if (!current_case.hasClass('validated')) {

            // console.log(e.originalEvent.key);

            if (isLetter(e.originalEvent.key)) {
                current_case.not('a').find('span').html(e.originalEvent.key);
                current_case.addClass('last_played');
            }
            if (e.originalEvent.key == 'Delete' || e.originalEvent.key == 'Backspace') {
                
                if (APP_GAME_SLUG == 'wordle' && current_case.find('span').html() == '') {
                    removeNext = true;
                } else {
                    removeNext = false;
                }

                current_case.find('span').html('');
                current_case.removeClass('last_played')
            }
        }

        // on récupère la classe des cases sélectionnées
        var caseClass = '.column.w_' + current_axe + '_' + current_id;
        // on récupère la position de la case en cours par rapport au mot
        var pos = parseInt(current_case.attr('data-pos-' + current_axe));
        let newCase = null;
        let isBack = false;

        // déplacement avec les flèches
        // vertical
        if (current_axe == 'y') {
            if (e.originalEvent.key == 'ArrowUp') {
                newCase = $(caseClass + '[data-pos-y="' + (pos - 1) + '"]');
                isBack = true;
            }
            if (e.originalEvent.key == 'ArrowDown') {
                newCase = $(caseClass + '[data-pos-y="' + (pos + 1) + '"]');
                isBack = false;
            }
        }
        // horizontal
        if (current_axe == 'x') {
            if (e.originalEvent.key == 'ArrowLeft') {
                newCase = $(caseClass + '[data-pos-x="' + (pos - 1) + '"]');
                isBack = true;
            }
            if (e.originalEvent.key == 'ArrowRight') {
                newCase = $(caseClass + '[data-pos-x="' + (pos + 1) + '"]');
                isBack = false;
            }
        }
        
        // si bouton retour / suppr
        if (e.originalEvent.key == 'Delete' || e.originalEvent.key == 'Backspace') {
            // on récup l'élément qui a l'index de position précédent
            newCase = $(caseClass + '[data-pos-' + current_axe + '="' + (pos - 1) + '"]');
            isBack = true;
            if (removeNext) {
                newCase.find('span').html('')
            }
        } else if (isLetter(e.originalEvent.key)) {
            // on récup l'élément qui a l'index de position suivant
            newCase = $(caseClass+'[data-pos-'+current_axe+'="'+(pos + 1)+'"]');
        }
        if (newCase) {
            checkCase(newCase, isBack);
        }
        
        if (checkTimeout) {
            clearTimeout(checkTimeout);
        }
        checkTimeout = setTimeout(() => {
            can_text = false;
            checkWords(false,()=>{
                can_text = true
            });
        }, 500)
    });
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function checkCase(newCase, isBack) {

    var caseClass = '.column.w_' + current_axe + '_' + current_id;
    // si la nouvelle case est trouvée et qu'elle est invalide, on peut passer dessus
    if (newCase && newCase.length > 0 && !newCase.hasClass('validated')) {
        current_case.removeClass('active');
        current_case = newCase;
        current_case.addClass('active');
    }
    // fonction pour sauter les cases validées 
    while (newCase.hasClass('validated')) {
        var pos = parseInt(newCase.attr('data-pos-' + current_axe));
        if (isBack) {
            newCase = $(caseClass + '[data-pos-' + current_axe + '="' + (pos - 1) + '"]');
        } else {
            newCase = $(caseClass + '[data-pos-' + current_axe + '="' + (pos + 1) + '"]');
        }
        if (newCase.length > 0 && !newCase.hasClass('validated')) {
            current_case.removeClass('active');
            current_case = newCase;
            current_case.addClass('active');
        }
    }
    // on ajuste l'écran pour garder la nouvelle case visible
    if (current_scale && current_scale > 1) {
        followCase(newCase, isBack);
    }
}

function followCase(newCase, isBack) {

    if (newCase && newCase.length == 0) {
        return false;
    }

    const width = $('#grid-container').width();
    const height = $('#grid-container').height();

    const cW = newCase.width();
    const cH = newCase.height();

    const left = newCase.offset().left + (isBack ? -cW : cW);
    const top = newCase.offset().top + (isBack ? -cH : cH);

    let dx = parseInt($('#grid').attr('data-x')) || 0;
    let dy = parseInt($('#grid').attr('data-y')) || 0;

    let maxX = ($('#grid-scaler').width() - (width * current_scale)) / current_scale;
    let maxY = ($('#grid-scaler').height() - (height * current_scale)) / current_scale;

    // AXE X
    if (left > width) {
        dx -= (cW * 2);
        if (dx < maxX) {
            dx = maxX;
        }
    }
    if (left < 0) {
        dx += (cW * 2);
        if (dx > 0) {
            dx = 0;
        }
    }
    // AXE Y
    if (top > height) {
        dy -= (cH * 2);
        if (dy < maxY) {
            dy = maxY;
        }
    }
    if (top < 0) {
        dy += (cH * 2);
        if (dy > 0) {
            dy = 0;
        }
    }
    $('#grid').css('transform', `translate(${dx}px, ${dy}px)`);
    $('#grid').attr('data-x', dx);
    $('#grid').attr('data-y', dy);
}