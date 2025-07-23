/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/battle`; params?: Router.UnknownInputParams; } | { pathname: `/characters`; params?: Router.UnknownInputParams; } | { pathname: `/guild`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/shop`; params?: Router.UnknownInputParams; } | { pathname: `/territory`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/battle`; params?: Router.UnknownOutputParams; } | { pathname: `/characters`; params?: Router.UnknownOutputParams; } | { pathname: `/guild`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/shop`; params?: Router.UnknownOutputParams; } | { pathname: `/territory`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } };
      href: Router.RelativePathString | Router.ExternalPathString | `/battle${`?${string}` | `#${string}` | ''}` | `/characters${`?${string}` | `#${string}` | ''}` | `/guild${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/shop${`?${string}` | `#${string}` | ''}` | `/territory${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/battle`; params?: Router.UnknownInputParams; } | { pathname: `/characters`; params?: Router.UnknownInputParams; } | { pathname: `/guild`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/shop`; params?: Router.UnknownInputParams; } | { pathname: `/territory`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | `/+not-found` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
    }
  }
}
