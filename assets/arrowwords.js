var can_touch = true;
var handler = "down";
var animateHelp = "animate__animated animate__bounceIn";

var row = 16;
var column = 13;

var $rows = null;
var $columns = null;

var old_row = null;
var current_row = 0;
var current_column = 0;
var current_index = 0;
var current_tab = "vertical";
var showDef = true;

var nd_child = false;
var current_case = null;
var current_id = 0;

var current_axe = "x";
var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var word_ids = [];
let wordsFound = [];

var last_pos = 1;

var count_h = 0;
var count_v = 0;
var last_h = 0;
var last_v = 0;

let helper = [];

let current_scale = 1;

const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
var isIPadPro = /Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;


function generateGrid() {
  // Relit les variables dynamiques
  row = APP_GAME_DATA.rows;
  column = APP_GAME_DATA.columns;
  var $rows = $("#grid .rows");
  var $columns = $("#grid .column");

  const words = APP_GAME_DATA.grid;
  var sw = 0;
  if (words[0].x == 0 && words[0].y == 0) {
    sw = 1;
  }

  $columns.each(function (e) {
    if (words[e] != undefined) {
      var cy = parseInt(words[e].y) + sw;
      var cx = parseInt(words[e].x) + sw;

      var start = $rows
        .eq(cy - 1)
        .find(".column")
        .eq(cx - 1);
      if (start.hasClass("play")) {
        start.addClass("c_1");
      } else {
        start.addClass("play c_0");
      }

      for (var j = 0; j < words[e].size_word; j++) {
        var s;
        var dir;
        if (words[e].dir == "RB") {
          s = $rows
            .eq(cy + j - 1)
            .find(".column")
            .eq(cx);
          dir = "y";
          if (j == 0) {
            s.addClass("tt");
          }
        }
        if (words[e].dir == "RR") {
          s = $rows
            .eq(cy - 1)
            .find(".column")
            .eq(cx + j);
          dir = "x";
          if (j == 0) {
            s.addClass("tl");
          }
        }
        if (words[e].dir == "BR") {
          s = $rows
            .eq(cy)
            .find(".column")
            .eq(cx + j - 1);
          dir = "x";
          if (j == 0) {
            s.addClass("tl");
          }
        }
        if (words[e].dir == "BB") {
          s = $rows
            .eq(cy + j)
            .find(".column")
            .eq(cx - 1);
          dir = "y";
          if (j == 0) {
            s.addClass("tt");
          }
        }

        s.attr("data-pos-" + dir, j)
          .attr("data-id-" + dir, words[e].id)
          .addClass("w_" + dir + "_" + words[e].id);
        //  .find('span').html(words[e].resp[j]);
        if (start.attr("data-id-" + dir) == undefined) {
          start.attr("data-id-" + dir, words[e].id);
        } else if (start.attr("data-id-" + dir) != words[e].id) {
          start.attr("data-id-" + dir + "2", words[e].id);
        }
      }

      if (words[e].dir == "RR" || words[e].dir == "BR") {
        var el = $("<a>" + words[e].def + "</a>");
        el.addClass("w_" + dir + "_" + words[e].id)
          .attr("data-id-" + dir, words[e].id)
          .appendTo(".dico_h");
      } else if (words[e].dir == "BB" || words[e].dir == "RB") {
        var el = $("<a>" + words[e].def + "</a>");
        el.addClass("w_" + dir + "_" + words[e].id)
          .attr("data-id-" + dir, words[e].id)
          .appendTo(".dico_v");
      }
      var def = $(`<div>${words[e].def}</div>`);
      def.addClass("w_" + dir + '_' + words[e].id);
      start.find('span')
        .append(def)
    }
  });

  $('.column.tl').each(function () {
    if ($(this).prev('.column').hasClass('c_1')) {
      $(this).addClass('double');
    }
  })

  $('.column[data-row="' + row + '"] span').addClass("bb0");
  $('.column[data-column="' + column + '"] span').addClass("br0");

  $("#app").animate({ opacity: 1 }, 1000);
  initGrid();
  resizeGrid();
}

function resizeGrid() {
  var $rows = $("#grid .rows");
  var $columns = $("#grid .column");
  var oY = 0;
  var oX = showDef ? 350 : 50;
  if (window.innerWidth < 768) {
    oX = 20;
    oY = 0;
  }
  var maxW = window.innerWidth - oX;
  var sizeX = maxW / column;
  // sizeX = Math.min(50, sizeX);
  var sizeY = sizeX * row;

  $columns.css("width", sizeX).css("height", sizeX);
  $rows.css("height", sizeX);
  $(".gameList").css("height", sizeY + 20);
  $("#grid")
    .css("height", sizeY)
    .css("width", sizeX * column);
  $("#grid-container")
    .css("height", sizeY)
    .css("width", sizeX * column);
  $("#grid-scaler")
    .css("height", sizeY)
    .css("width", sizeX * column);
}

function initGrid() {
  $(window).on("resize", function () {
    resizeGrid();
  });

  $('#vertical-tab').on('click', function () {
    current_axe = 'y';
  });
  $('#horizontal-tab').on('click', function () {
    current_axe = 'x';
  });

  initKeyBoard();

  var $rows = $("#grid .rows");
  var $columns = $("#grid .column");

  $("#zoomIn").on("click", function () {


    if (current_scale < 3) {
      current_scale += 0.5;
      $("#grid-scaler").css("transform", "scale(" + current_scale + ")");

      // case position
      var posX = parseInt(current_case.attr('data-column'));
      var posY = parseInt(current_case.attr('data-row'));

      // si la position est supérieur à la moitiée de la grille//
      // il faut inverser gauche droite = +2 // -2

      // center position
      let x = -((posX - 2) * (current_case.width()));
      let y = -((posY - 2) * (current_case.height()));


      // limits
      let offX = 2;
      let offY = 2;
      if (current_scale >= 2) {
        offX = 1;
        offY = 1;
      }
      if (current_scale >= 2.5) {
        offX = 0.5;
        offY = 0.5;
      }
      let maxX = -(($("#grid-scaler").width()) / offX) / current_scale;
      if (x < maxX) { x = maxX; }
      if (x > 0) { x = 0 }

      let maxY = -(($("#grid-scaler").height()) / offY) / current_scale;
      if (y < maxY) { y = maxY; }
      if (y > 0) { y = 0 }

      // update attributes for drag and drop
      $('#grid').attr("data-x", x);
      $('#grid').attr("data-y", y);

      // update CSS
      $('#grid')[0].style.transform = "translate(" + x + "px, " + y + "px)";
    }
  });
  $("#zoomOut").on("click", function () {

    if (current_scale == 1.5) {
      $('#grid')[0].style.transform = "translate( 0px, 0px)";
      $('#grid').attr("data-x", 0);
      $('#grid').attr("data-y", 0);
    }
    if (current_scale > 1) {
      current_scale -= 0.5;
      $("#grid-scaler").css("transform", "scale(" + current_scale + ")");
    }

  });
  $(".toggleDef").on("click", function () {
    toggleDef()
  });

  function toggleDef() {
    showDef = !showDef;
    $('.c_0').toggleClass("hideDef");
    $('.gameContainer').toggleClass("hideDef")
    $('.gameCol').toggleClass("col-md-12");
    $('.gameCol').toggleClass("col-md-8");
    resizeGrid();
  }

  toggleDef();

  interact("#grid").draggable({
    inertia: true,
    listeners: {
      move: function (event) {
        if (current_scale === 1) { return };

        const target = event.target;
        x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        $('#grid').addClass('dragging')

        if (x > 0) { x = 0 }
        if (y > 0) { y = 0 }

        let offsetX = $('#grid-container').width() - parseFloat(target.getAttribute("data-x") * current_scale);
        let maxX = $('#grid-scaler').width() * current_scale - 6 * current_scale - 1;

        if (offsetX > maxX && event.dx < 0) {
          x -= event.dx
        }

        let offsetY = parseFloat($('#grid-container').height()) - (parseFloat(target.getAttribute("data-y") * current_scale));
        let maxY = parseFloat($('#grid-scaler').height() * current_scale) - 6 * current_scale;

        if (offsetY > maxY && event.dy < 0) {
          y -= event.dy
        }

        target.style.transform = "translate(" + x + "px, " + y + "px)";
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
      },
      end: function () {
        $('#grid').removeClass('dragging')
      }
    },
  });

  $(".dico a")
    .off("click")
    .on("click", function () {
      $("#words").modal("hide");
    });
  $("#grid .column").off("click");

  $("#grid .column").on("click", function () {
    if ($(this).hasClass("active") && !$(this).hasClass("play")) {
      current_axe = current_axe == "x" ? "y" : "x";
      if (!$(this)[0].hasAttribute('data-id-' + current_axe)) {
        current_axe = current_axe == "x" ? "y" : "x";
      }
    }
  });

  $("#grid .column, .dico a").on("click", function () {
    if (can_touch) {

      $('.play span div').removeClass('select');

      current_case = $(this);

      if ($(this).hasClass("play") && !current_case[0].hasAttribute("data-id-" + current_axe + "2")) {
        current_axe = current_axe == "x" ? "y" : "x";
      }
      if (!$(this)[0].hasAttribute('data-id-' + current_axe)) {
        current_axe = current_axe == "x" ? "y" : "x";
      }

      if (isTouchDevice()) {
        $(".gameKeyboard").show();
        $(".gameDefinition").addClass("has_keyboard");
        $(".show_keyboard").addClass("active");
      }
      if (
        current_case[0].hasAttribute("data-id-" + current_axe) ||
        current_case[0].hasAttribute("data-id-" + current_axe + "2")
      ) {
        var newTab = current_axe == "x" ? "horizontal" : "vertical";
        if (newTab != current_tab) {
          $("#" + newTab + "-tab").tab("show");
          current_tab = newTab;
        }

        var id = parseInt(current_case.attr("data-id-" + current_axe));
        var id2 = parseInt(current_case.attr("data-id-" + current_axe + "2"));
        if (nd_child && !isNaN(id2)) {
          nd_child = false;
          id = id2;
        } else {
          nd_child = true;
        }
        current_id = id;

        $(".dico a").removeClass("select active");
        $columns.removeClass("select active sx sy");
        if (showDef) {
          current_case.addClass("active");
        } else {
          current_case.not('.play').addClass("active");
          $(".play .w_" + current_axe + "_" + id).addClass('select')
        }
        // on sélectionne les cases du mot
        var selected = $(".column.w_" + current_axe + "_" + id).not('.play');
        selected.addClass("select s" + current_axe);

        // $('.column span').css({ 'border-right' : ''})
        // $(this).prev('.column').find('span').css('border-right', '0')

        // si la case en cours est une définition
        // on se positionne sur la première case de la selection
        if (current_case.hasClass("play")) {
          current_case = selected.eq(0);
          current_case.addClass("active");
        }
        // si la première case de la selection est déja valide
        if (current_case.hasClass('validated')) {
          // on sélectionne les cases invalides
          var empty = $(".column.w_" + current_axe + "_" + id).not('.play').not('.validated');
          current_case.removeClass('active');
          // et active la première case de cette sélection
          current_case = empty.eq(0);
          current_case.addClass("active");
        }

        $(".gameDefinition").html($("a.w_" + current_axe + "_" + id).html());

        if ($("#grid .column.active").length == 0) {
          current_case = $(".column.w_" + current_axe + "_" + id).eq(0);
          current_case.addClass("active");
        }
        if (!isTouchDevice() || (!isMobile && !isIPadPro)) {
          initDesktopkeyBoard();
        }
        initMobileKeyboard();
      } else {
        current_axe = current_axe == "x" ? "y" : "x";
        // $(this).trigger('click');
      }
    }
  });
  $("#app").animate({ opacity: 1 }, 1000);

  $("#grid .column").eq(0).trigger('click')
}
// reset de la grille
function resetGrid() {
  var $rows = $("#grid .rows");
  var $columns = $("#grid .column");
  $columns.not('.play').each(function (e) {
    $(this).find("span").html("");
    $(this).find("div").remove();
    $(this).removeClass("validated game_help " + animateHelp);
  });
  word_ids = [];
  wordsFound = [];
}
// sauvegarde de la grille
function saveGrid() {
  var board = [];
  var $columns = $("#grid .column");
  $columns.each(function (index, el) {
    board.push($(this).find("span").html());
  });
  return JSON.stringify({
    word_ids: word_ids,
    wordsFound: wordsFound,
    grid: board,
    helper: helper
  });
}

var allWords = [];
// récupération des mots complétés
function getGrid() {
  const words = APP_GAME_DATA.grid;
  var board = [];
  for (var i = 0; i < words.length; i++) {
    var id = words[i].id;
    var axe = words[i].dir == "BB" || words[i].dir == "RB" ? "y" : "x";
    var els = $(".column[data-id-" + axe + '="' + id + '"]').not(".play");
    var e = {
      id: id,
      word: "",
      axe
    };
    for (var j = 0; j < words[i].size_word; j++) {
      e.word += els.eq(j).find("span").html();
    }
    if (words[i].size_word == e.word.length) {
      board.push(e);
    }
  }
  return JSON.stringify(board);
}

let lastCount = 0;
// vérification de la validité des mots en live
function checkWords(notify = false, callback = null) {

  if (APP_AUTO_SAVE != undefined && APP_AUTO_SAVE && APP_USER) {
    $('.save').trigger('click');
  }

  // on check si un nouveau mot a été trouvé pour lancer la validation
  let tmpGrid = JSON.parse(getGrid());
  if (tmpGrid.length < lastCount) {
    lastCount = tmpGrid.length;
    // si pas de nouveau mot, on continue sans validation
    if (callback) {
      callback()
    }
    return false;
  }
  lastCount = tmpGrid.length;


  if (wordsFound.length < APP_GAME_DATA.grid.length) {
    can_touch = false;
    $.post(
      APP_CHECK_URL + APP_QUERY,
      {
        time: 0,
        is_discovery: APP_GAME_DATA.discovery ? 1 : 0,
        grid: getGrid(),
        nextId: APP_GAME_DATA.next_grid_id || 0,
        level: APP_GAME_DATA.level,
        usedHelps: []
      },
      res => {
        can_touch = true;
        if (callback) {
          callback()
        }
        if (!res.validated) {
          $('.validate').trigger('click')
          return false;
        }
        res.validated.forEach(item => {
          if (wordsFound.indexOf(item.id) === -1) {
            wordsFound.push(item.id);
            word_ids.push(item.id);
            var els = $(".column[data-id-" + item.axe + '="' + item.id + '"] ').not(".play");

            for (let i = 0; i < item.word.length; i++) {

              let letter = els.eq(i);
              letter.addClass('validated');
              setTimeout(() => {
                letter.addClass('anim')
                letter.removeClass('active')
              }, i * 100);
            }
            setTimeout(() => {
              els.removeClass('anim')
            }, (item.word.length * 100) + 1500)
            if (notify) {
              Toastify({
                duration: 2000,
                close: true,
                position: "center",
                text: 'Bravo ! Vous avez trouvé le mot ' + item.word,
                style: {
                  background: '#29AD61',
                  marginTop: 0
                },
              }).showToast();
            }

            if (wordsFound.length > (APP_GAME_DATA.grid.length - 1)) {
              $('.validate').trigger('click')
            }
          }
        });
      }
    );
  } else {
    $('.validate').trigger('click')
  }
}
// remplissage de la grille
function setGrid(data) {
  var $columns = $("#grid .column");
  $columns.each(function (index, el) {
    $(this).find("span").html(data.grid[index]);
  });
  word_ids = data.word_ids;
  checkWords(false);
  if (data.helper != undefined) {
    helper = data.helper;
    for (var i = 0; i < helper.length; i++) {
      $('.column[data-index="' + helper[i] + '"]').addClass('game_help validated');
    }
  }

}
// récupération des données pour les aides
function getHelpData(help) {
  if (help == 1) {
    return {
      help: help,
      word_id: 0,
      word_ids: word_ids,
      index: 0,
    };
  }
  if (help == 2) {
    return {
      help: help,
      word_id: 0,
      word_ids: word_ids,
      index: 0,
    };
  }
  if (help == 3) {
    if (current_case) {
      var id = current_case.attr("data-id-" + current_axe);
    } else {
      alert(
        "Vous devez au préalable choisir une case avant d'utiliser cette aide"
      );
      return false;
    }
    return {
      help: help,
      word_id: id,
      word_ids: word_ids,
      index: current_case.attr("data-pos-" + current_axe),
    };
  }
}
// exécution des aides avec les données API
function helpGrid(help, data) {
  if (help == 1) {
    var axe = data.sens == "RB" || data.sens == "BB" ? "y" : "x";
    var els = $(".column[data-id-" + axe + '="' + data.word_id + '"] ').not(
      ".play"
    );
    word_ids.push(data.word_id);
    for (var i = 0; i < 3; i++) {
      els
        .eq(i)
        .addClass("game_help validated " + animateHelp)
        // .append(`<div>${data.result[i]}</div>`)
        .find("span")
        .html(data.result[i]);
      helper.push(els.eq(i).attr('data-index'));
    }
  }

  if (help == 2) {
    var axe = data.sens == "RB" || data.sens == "BB" ? "y" : "x";
    var els = $(".column[data-id-" + axe + '="' + data.word_id + '"] ').not(
      ".play"
    );
    word_ids.push(data.word_id);
    for (var i = 0; i < data.size_word; i++) {
      els
        .eq(i)
        .addClass("game_help validated " + animateHelp)
        // .append(`<div>${data.result[i]}</div>`)
        .find("span")
        .html(data.result[i]);
      helper.push(els.eq(i).attr('data-index'));
    }
  }

  if (help == 3) {
    word_ids.push(data.word_id);
    current_case
      .addClass("game_help validated " + animateHelp)
      // .append(`<div>${data.result}</div>`)
      .find("span")
      .html(data.result);

    helper.push(current_case.attr('data-index'));


    // on récupère la classe des cases sélectionnées
    var caseClass = '.column.w_' + current_axe + '_' + current_id;
    // on récupère la position de la case en cours par rapport au mot
    var pos = parseInt(current_case.attr('data-pos-' + current_axe));
    var newCase = $(caseClass + '[data-pos-' + current_axe + '="' + (pos + 1) + '"]');
    // on vérifie si la case est éligible à la sélection
    checkCase(newCase, false);


  }
  checkWords()
}
