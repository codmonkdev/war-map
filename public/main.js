"use strict";

window.app = {};
var app = window.app;

function fixMapHeight(){
    var viewHeight = $(window).height();
    //var header = $("div[data-role='header']:visible:visible");
    var navbar = $("nav[data-role='navbar']:visible:visible");
    var mapDiv = $("div[data-role='map']:visible:visible");
    var mapHeight = viewHeight - navbar.outerHeight() - 1; // - header.outerHeight();
    mapDiv.height(mapHeight);
    if (window.map)
        window.map.fixMapHeight();
}

function fixMiniMapVisible(isHide) {

    let elem = $('#event-image-div');
    if (isHide) {
        $('#event-image-div')[0].innerHTML = '';
        elem.hide();
        return;
    }

    var viewWidth = $(window).width();
    (350 < viewWidth) ? elem.show() : elem.hide();
}

function changeWindowSize() {
    fixMapHeight();
    fixMiniMapVisible();
}

window.onresize = changeWindowSize;

function startApp() {

    let protocol = ClientProtocol.create();

    let mapControl = MapControl.create();
    mapControl.subscribe('changeYear', (year) => {
        fixMiniMapVisible(true);
        protocol.getHistoryEventsByYear(year);
    });

    let historyEventsControl = HistoryEventsControl.create();

    protocol.subscribe('refreshHistoryEvents', (events) => {
        historyEventsControl.showEvents(events);
    });

    historyEventsControl.subscribe('refreshedEventList', () => {
        $('table tr').click(function(){
            historyEventsControl.rowEventClick( $(this) );
            return false;
        });

        $('table tr td span').click(function(){
            historyEventsControl.mapEventClick( $(this) );
            return false;
        });
    });

    historyEventsControl.subscribe('activatedEvent', (data) => {
        mapControl.showEventOnMap(data.map);
        fixMiniMapVisible();
    });

    window.map = mapControl;

    // var something = document.getElementById('content');
    // something.style.cursor = 'pointer';

    $(document.getElementsByClassName('ol-attribution ol-unselectable ol-control ol-collapsed')).remove();

    changeWindowSize();
}