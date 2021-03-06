class ClientProtocol extends EventEmitter {
    constructor() {

        super();
        let socket = io();

        this.lang = 'rus';
        this.dict = new Map(); //key - hash (tobject), value {объект}

        socket.emit('clGetDictEngRus', '', (msg) => {
            let data = JSON.parse(msg);
            data.res.forEach( (item) => {
                let obj = {eng: item.eng, rus: item.rus};
                this.dict.set(item.id, obj);
            });
        });

        socket.on('error', (message) => {
            console.error(message);
        });

        socket.on('logout', (data) => {
            socket.disconnect();
            window.location.reload();
        });

        this.socket = socket;
    }

    _getStrDateFromEvent(inputDate) {
        let date = new Date(inputDate);
        return ('0' + date.getDate()).slice(-2) + '.'
        + ('0' + (date.getMonth()+1)).slice(-2) + '.'
        + date.getFullYear();
    }

    _getDictName(id) {
        if (!this.dict.has(id)) return;
        let obj = this.dict.get(id);
        if (!obj) return;
        return obj[this.lang];
    }

    getSocket() {
        return this.socket;
    }

    setCurrentLanguage(lang) {
        this.lang = lang;
    }

    getHistoryEventsByYear(year) {
        this.socket.emit('clQueryEvents', JSON.stringify({year: year}), (msg) => {
            let data = JSON.parse(msg);
            let events = data.events.map( (event) => {
                return {
                    "id": event._id,
                    "startDate": this._getStrDateFromEvent( event.startDate ),
                    "endDate": this._getStrDateFromEvent( event.endDate ),
                    "maps": event.maps,
                    "name": this._getDictName(event._name),
                    "imgUrl": event.imgUrl
                };
            });

            this.emit('refreshHistoryEvents', events);
        });
    }

    static create() {
        return new ClientProtocol();
    }
}