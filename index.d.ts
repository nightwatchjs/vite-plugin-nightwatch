import { NightwatchAPI, Element } from 'nightwatch';
import { MountingOptions } from '@vue/test-utils';
import { Plugin } from 'vite';

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
        props?: MountingOptions<Record<string, any>>['props'];
        plugin?: Pick<GlobalMountOptions, 'plugins'>;
        mocks?: Pick<GlobalMountOptions, 'mocks'>;
      },
      callback?: (this: NightwatchAPI, result: Element) => void
    ): Awaitable<this, Element>;
    launchComponentRenderer(): this;
  }
}

interface Options {
  renderPage: string;
  componentType?: 'vue' | 'react';
}

export default function nightwatchPlugin(options?: Options): Plugin;
