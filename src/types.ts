/**
 * Defines any message sendable over RPC.
 */
export type RPCMessage<T> = IRPCMethod<T> | IRPCReply<T>;

/**
 * Defines an RPC message with a sequence counter for reordering.
 */
export type RPCMessageWithCounter<T> = RPCMessage<T> & { counter: number };

/**
 * Describes an RPC method call.
 */
export interface IRPCMethod<T> {
  type: 'method';
  serviceID: string;
  id: number;
  method: string;
  discard?: boolean;
  params: T;
}

/**
 * Describes an RPC method reply.
 */
export interface IRPCReply<T> {
  type: 'reply';
  serviceID: string;
  id: number;
  result: T;
  error?: {
    code: number;
    message: string;
    path?: string[];
  };
}

/**
 * Checks whether the message duck-types into an Interactive message.
 * This is needed to distinguish between postmessages that we get,
 * and postmessages from other sources.
 */
export function isRPCMessage(data: any): data is RPCMessageWithCounter<any> {
  return (
    typeof data === 'object' &&
    (data.type === 'method' || data.type === 'reply') &&
    typeof data.counter === 'number'
  );
}

/**
 * IPostable is an interface that describes something to which we can send a
 * browser postMessage. It's implemented by the `window`, and is mocked
 * in tests.
 */
export interface IPostable {
  postMessage(data: any, target?: string): void;
}

/**
 * IReceivable is an interface that describes something from which we can
 * read a browser postMessage. It's implemented by the `window`, and is mocked
 * in tests.
 */
export interface IReceivable {
  /**
   * Takes a callback invoked to invoke whenever a message is received,
   * and returns a function the can be used to unsubscribe the callback.
   */
  recvMessage(callback: (data: any) => void): () => void;
}

/**
 * Default `IReceivable` implementation that listens on the window.
 */
export const defaultReceivable: IReceivable = {
  recvMessage(callback) {
    const _cb = ({ data }: MessageEvent) => callback(data);
    window.addEventListener('message', _cb);
    return () => window.removeEventListener('message', _cb);
  },
};

/**
 * Default `IPostable` implementation that sends messages to the parent window.
 */
export const defaultPostable: IPostable = {
  postMessage(data) {
    window.parent.postMessage(data, '*');
  },
};
