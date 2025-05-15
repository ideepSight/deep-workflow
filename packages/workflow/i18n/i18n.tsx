import { createContext, useContext, ReactNode } from 'react';
import i18next, { i18n as I18nInstance, InitOptions, TFunction } from 'i18next';
import resources from './resources';

interface I18nContextProps {
	i18n: I18nInstance;
	t: TFunction<'translation', undefined>;
}
if (!i18next.isInitialized) {
	i18next.init({
		lng: 'zh',
		fallbackLng: 'zh',
		resources
	});
} else {
	Object.keys(resources).forEach((lng) => {
		Object.keys(resources[lng]).forEach((ns) => {
			i18next.addResourceBundle(lng, ns, resources[lng][ns], true, true);
		});
	});
}
const I18nContext = createContext<I18nContextProps>({
	i18n: i18next,
	t: i18next.t.bind(i18next)
});

interface I18nProviderProps {
	i18nInstance?: I18nInstance;
	children: ReactNode;
	initOptions?: InitOptions;
}

export function createI18nProvider({ i18nInstance, initOptions }: Omit<I18nProviderProps, 'children'>) {
	const getI18nInstance = (i18nInstance?: I18nInstance, initOptions?: InitOptions) => {
		if (i18nInstance) {
			Object.keys(resources).forEach((lng) => {
				Object.keys(resources[lng]).forEach((ns) => {
					i18nInstance.addResourceBundle(lng, ns, resources[lng][ns], true, true);
				});
			});
			return i18nInstance;
		} else {
			if (!i18next.isInitialized) {
				i18next.init({
					lng: 'zh',
					fallbackLng: 'zh',
					resources,
					...initOptions
				});
			}
			return i18next;
		}
	};
	const i18n = getI18nInstance(i18nInstance, initOptions);
	const t = i18n.t.bind(i18n);
	return { i18n, t };
}

export function useI18n() {
	return useContext(I18nContext);
}

export const t = i18next.t.bind(i18next);
