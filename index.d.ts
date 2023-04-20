import { NightwatchAPI, Element } from 'nightwatch';
import { MountingOptions } from '@vue/test-utils';
type RecordObject = Record<string, any>;

type GlobalMountOptions = NonNullable<MountingOptions<any>['global']>;

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
      options?: {
        props?: Pick<MountingOptions<any>, 'props'>;
        plugin?: Pick<GlobalMountOptions, 'plugins'>;
        mocks?: Pick<GlobalMountOptions, 'mocks'>;
      },
      callback?: (this: NightwatchAPI, result: Element) => void
    ): Awaitable<this, Element>;
    launchComponentRenderer(): this;
  }
}
