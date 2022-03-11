import { EventEmitter } from "eventemitter3";
import "./wx";

enum ScoketStatus {
    connecting,
    open,
    closing,
    closed
}

export enum ScoketEventName {
    CONNECTING = 'connecting',
    ISOPEN = 'isopen',
    CLOSING = 'closing',
    CLOSED = 'closed'
}

interface SendParams {
    data: string | ArrayBuffer | Object,
    success?: Function,
    fail?: Function,
    complete?: Function
}

export default class WxSocket extends EventEmitter {
    private socket: wx.SocketTask;
    private responseHeaders: { [field: string]: string } = {};
    readyState: ScoketStatus;
    url: string;
    constructor(url: string, protocols: string | string[] = [], header: object = {}) {
        super();
        this.url = url;
        this.readyState = ScoketStatus.connecting;
        this.emit(ScoketEventName.CONNECTING);
        this.socket = wx.connectSocket({
            url,
            header: {
                ...header
            },
            protocols: Array.isArray(protocols) ? protocols : [protocols]
        });
    }

    close() {
        this.readyState = ScoketStatus.closing;
        this.emit(ScoketEventName.CLOSING);
        this.socket.close({
            code: 1000,
            reason: "normal closure",
            success: () => {
                this.readyState = ScoketStatus.closed;
                this.emit(ScoketEventName.CLOSED);
            }
        });
    }

    onClose(callback: Function): void {
        this.socket.onClose((res) => {
            callback.call(this, res);
        });
    }

    onError(callback: Function): void {
        this.socket.onError((res) => {
            callback.call(this, res);
        });
    }

    onMessage(callback: Function): void {
        this.socket.onMessage((res: any) => {
            try {
                let { data } = res;
                if(!data) return;

                let formatData = JSON.parse(data);
                let { biz } = formatData;

                if(biz) {
                    this.emit(biz, formatData);
                } else {
                    callback.call(this, res);
                }
                
            } catch (e) {
                console.error('解析socket返回失败', e);
                callback.call(this, res);
            }
        });
    }

    onOpen(callback: Function): void {
        this.socket.onOpen((res) => {
            this.readyState = ScoketStatus.open;
            for (let i in res.header) {
                this.responseHeaders[i.toLowerCase()] = res.header[i];
            }
            callback.call(this, res);
        })
    }

    send(params: SendParams): Promise<{}>{
        const self = this;
        return new Promise((rl, rj) => {
            let {data, success, fail, complete} = params;
            this.socket.send({
                data: JSON.stringify(data),
                success(e) {
                    success && success.call(self, e);
                    rl(e);
                },
                fail(e) {
                    fail && fail.call(self, e);
                    rj(e);
                },
                complete() {
                    complete && complete.call(self);
                }
            })
        })
    }
    
    subscribe(biz: String, otherParams: Object = {}, callback: Function) {
        this.socket.send({
            data: JSON.stringify({biz, ...otherParams}),
            success(e) {
                callback && callback();
                console.log(`订阅业务 biz ：${biz} 成功 =>>>>>>>>>>>>>>`);
            },
            fail(e) {
                console.log(`订阅业务 biz ：${biz} 失败 =>>>>>>>>>>>>>>`);
            },
            complete() {
                
            }
        })
    }

}