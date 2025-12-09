import { ReactNode } from 'react';
import { i18n as I18nInstance, InitOptions, TFunction } from 'i18next';
interface I18nContextProps {
    i18n: I18nInstance;
    t: TFunction<'translation', undefined>;
}
interface I18nProviderProps {
    i18nInstance?: I18nInstance;
    children: ReactNode;
    initOptions?: InitOptions;
}
export declare function createI18nProvider({ i18nInstance, initOptions }: Omit<I18nProviderProps, 'children'>): {
    i18n: I18nInstance;
    t: any;
};
export declare function useI18n(): I18nContextProps;
export declare const t: any;
export {};
