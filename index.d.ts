import { NightwatchAPI, Element } from 'nightwatch';
type RecordObject = Record<string, any>;

declare module 'nightwatch' {
  interface NightwatchAPI {
    importScript(
      scriptPath: string,
      options: { scriptType: string; componentType: string },
      callback?: () => void
    ): this;
    mountReactComponent<TProps extends Record<string, any>>(
      componentPath: string,
      props?: TProps,
      callback?: (this: NightwatchAPI, result: Element) => void
    ): Awaitable<this, Element>;
    mountVueComponent(
      componentPath: string,
      options?: { plugin?: RecordObject; mocks?: RecordObject },
      callback?: (this: NightwatchAPI, result: Element) => void
    ): Awaitable<this, Element>;
    launchComponentRenderer(): this;
  }
}
