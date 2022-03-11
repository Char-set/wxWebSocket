# wxWebSocket

专门为微信小程序封装的webSocket库，对服务端有特定要求：

> 1、若客户端想要订阅某个业务，则利用 `send` 方法，传递包含 {biz: '业务特征值'} 的数据给服务端

> 2、服务端接受到包含 `biz` 特征值的数据，处理客户端订阅问题

> 3、服务端若想推送特定的业务数据，返回的数据中，需要包含 `biz` 特征值

## 使用方法

```js
    // import ...
    import WxSocket from 'wx-websocket';

    // use...

    let socket = new WxSocket(url, protocols?, header?);

    // socket 对象为官方的 SocketTask 对象，支持官方目前所有的方法及事件

```

## 提供 subscribe 方法，接受三个参数：

    subscribe(biz: String, otherParams: Object = {}, callback: Function)

        biz：需要订阅的业务特征值

        otherParams，订阅时传递的参数
        
        callback：订阅成功的回调函数

    
## 提供 on 方法，用于监听事件，注册回调，内部基础事件有如下：

```js
export enum ScoketEventName {
    CONNECTING = 'connecting',
    ISOPEN = 'isopen',
    CLOSING = 'closing',
    CLOSED = 'closed'
}
```

## 特别提示：

如果使用 `subscribe` 对事件 **(eventA)** 进行订阅后，服务端推送的数据中若包含 `biz` 字段，将不会触发 `socket.onMessage` 事件，内部会使用 `emit` 方法触发订阅，外部只能通过 `socket.on('eventA', callback)` 接受到数据